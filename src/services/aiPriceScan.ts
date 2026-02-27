export type AiPriceScanResult = {
  amount: number | null;
  currencyCode: string | null;
  confidence: number;
  reason: string;
};

const AI_PROXY_ENDPOINT =
  'https://us-central1-currencycalculator-d4998.cloudfunctions.net/aiScanPrice';

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
  const response = await fetch(AI_PROXY_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      base64Image,
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
