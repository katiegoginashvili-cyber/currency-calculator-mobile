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
  // #region agent log
  fetch('http://127.0.0.1:7248/ingest/30933eef-a3b4-4469-b38d-b3c1692116d3',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'0c8447'},body:JSON.stringify({sessionId:'0c8447',runId:'scan-pre-fix',hypothesisId:'H1',location:'src/services/aiPriceScan.ts:24',message:'AI proxy request start',data:{endpoint:AI_PROXY_ENDPOINT,base64Length:base64Image?.length ?? 0},timestamp:Date.now()})}).catch(()=>{});
  // #endregion
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
    // #region agent log
    fetch('http://127.0.0.1:7248/ingest/30933eef-a3b4-4469-b38d-b3c1692116d3',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'0c8447'},body:JSON.stringify({sessionId:'0c8447',runId:'scan-pre-fix',hypothesisId:'H2',location:'src/services/aiPriceScan.ts:38',message:'AI proxy request failed',data:{status:response.status,errorSnippet:errorText.slice(0,220)},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    throw new Error(`AI request failed (${response.status}): ${errorText}`);
  }

  const payload = await response.json();
  // #region agent log
  fetch('http://127.0.0.1:7248/ingest/30933eef-a3b4-4469-b38d-b3c1692116d3',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'0c8447'},body:JSON.stringify({sessionId:'0c8447',runId:'scan-pre-fix',hypothesisId:'H3',location:'src/services/aiPriceScan.ts:44',message:'AI proxy response success shape',data:{hasOutputText:typeof payload?.output_text==='string',hasOutputParsed:payload?.output_parsed!=null,topLevelKeys:Object.keys(payload ?? {}).slice(0,12)},timestamp:Date.now()})}).catch(()=>{});
  // #endregion
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
