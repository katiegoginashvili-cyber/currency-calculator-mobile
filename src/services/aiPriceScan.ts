import Constants from 'expo-constants';

export type AiPriceScanResult = {
  amount: number | null;
  currencyCode: string | null;
  confidence: number;
  reason: string;
};

const AI_ENDPOINT = 'https://api.openai.com/v1/responses';

const resolveOpenAiKey = (): string | undefined => {
  const manifest = (Constants as any)?.manifest;
  const manifest2 = (Constants as any)?.manifest2;

  const fromExpoConfig = Constants.expoConfig?.extra?.openaiApiKey as string | undefined;
  const fromManifest = manifest?.extra?.openaiApiKey as string | undefined;
  const fromManifest2 = manifest2?.extra?.expoClient?.extra?.openaiApiKey as string | undefined;
  const fromPublicEnv = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
  let fromBundledAppJson: string | undefined;

  try {
    const appJson = require('../../app.json') as { expo?: { extra?: { openaiApiKey?: string } } };
    fromBundledAppJson = appJson?.expo?.extra?.openaiApiKey;
  } catch {
    fromBundledAppJson = undefined;
  }

  return fromExpoConfig || fromManifest || fromManifest2 || fromPublicEnv || fromBundledAppJson;
};

const clampConfidence = (value: unknown): number => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return 0;
  return Math.max(0, Math.min(1, parsed));
};

const normalizeCurrency = (value: unknown): string | null => {
  if (typeof value !== 'string') return null;
  const upper = value.trim().toUpperCase();
  return /^[A-Z]{3}$/.test(upper) ? upper : null;
};

export const analyzePriceFromPhotoWithAI = async (base64Image: string): Promise<AiPriceScanResult> => {
  const apiKey = resolveOpenAiKey();
  if (!apiKey) {
    throw new Error('Missing OpenAI key (checked expoConfig/manifest/manifest2/env/app.json)');
  }

  const response = await fetch(AI_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4.1-mini',
      input: [
        {
          role: 'user',
          content: [
            {
              type: 'input_text',
              text: [
                'Analyze this product price label photo.',
                'Return STRICT JSON only with this schema:',
                '{"amount": number|null, "currencyCode": "USD"|...|null, "confidence": 0..1, "reason": string, "isOldPrice": boolean}',
                'Rules:',
                '- Prefer current/main price over old/strikethrough/was price.',
                '- If only old price exists, set amount null and isOldPrice true.',
                '- currencyCode must be ISO-4217 3-letter code or null.',
                '- No markdown, no extra text.',
              ].join(' '),
            },
            {
              type: 'input_image',
              image_url: `data:image/jpeg;base64,${base64Image}`,
            },
          ],
        },
      ],
      text: {
        format: {
          type: 'json_schema',
          name: 'price_scan',
          schema: {
            type: 'object',
            additionalProperties: false,
            required: ['amount', 'currencyCode', 'confidence', 'reason', 'isOldPrice'],
            properties: {
              amount: { type: ['number', 'null'] },
              currencyCode: { type: ['string', 'null'] },
              confidence: { type: 'number' },
              reason: { type: 'string' },
              isOldPrice: { type: 'boolean' },
            },
          },
        },
      },
      max_output_tokens: 250,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`AI request failed (${response.status}): ${errorText}`);
  }

  const payload = await response.json();
  const outputText =
    (typeof payload?.output_text === 'string' && payload.output_text) ||
    (typeof payload?.output?.[0]?.content?.[0]?.text === 'string' && payload.output[0].content[0].text) ||
    (typeof payload?.output?.[0]?.content?.[0]?.value === 'string' && payload.output[0].content[0].value) ||
    null;

  const outputParsed = payload?.output_parsed;
  if (!outputText && !outputParsed) {
    const topLevelKeys = Object.keys(payload ?? {});
    const outputTypes = Array.isArray(payload?.output)
      ? payload.output.map((entry: any) => entry?.type ?? null).slice(0, 5)
      : [];
    throw new Error(
      `AI response missing parsable body (keys=${topLevelKeys.join(',')}; outputTypes=${JSON.stringify(outputTypes)})`,
    );
  }

  const parsed = (outputParsed ??
    JSON.parse(outputText as string)) as {
    amount?: number | null;
    currencyCode?: string | null;
    confidence?: number;
    reason?: string;
    isOldPrice?: boolean;
  };

  const normalizedAmount =
    typeof parsed.amount === 'number' && Number.isFinite(parsed.amount) && parsed.amount > 0
      ? parsed.amount
      : null;
  const normalizedCurrency = normalizeCurrency(parsed.currencyCode);
  const isOldPrice = parsed.isOldPrice === true;

  return {
    amount: isOldPrice ? null : normalizedAmount,
    currencyCode: isOldPrice ? null : normalizedCurrency,
    confidence: clampConfidence(parsed.confidence),
    reason: typeof parsed.reason === 'string' ? parsed.reason : '',
  };
};
