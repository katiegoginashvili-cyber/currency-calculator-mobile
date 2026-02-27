const { onRequest } = require("firebase-functions/v2/https");

const region = "us-central1";

const jsonHeaders = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const makeOpenAiBody = (base64Image) => ({
  model: "gpt-4.1-mini",
  input: [
    {
      role: "user",
      content: [
        {
          type: "input_text",
          text: [
            "Analyze this product price label photo.",
            "Return STRICT JSON only with this schema:",
            '{"amount": number|null, "currencyCode": "USD"|...|null, "confidence": 0..1, "reason": string, "isOldPrice": boolean}',
            "Rules:",
            "- Prefer current/main price over old/strikethrough/was price.",
            "- If only old price exists, set amount null and isOldPrice true.",
            "- currencyCode must be ISO-4217 3-letter code or null.",
            "- No markdown, no extra text.",
          ].join(" "),
        },
        {
          type: "input_image",
          image_url: `data:image/jpeg;base64,${base64Image}`,
        },
      ],
    },
  ],
  text: {
    format: {
      type: "json_schema",
      name: "price_scan",
      schema: {
        type: "object",
        additionalProperties: false,
        required: ["amount", "currencyCode", "confidence", "reason", "isOldPrice"],
        properties: {
          amount: { type: ["number", "null"] },
          currencyCode: { type: ["string", "null"] },
          confidence: { type: "number" },
          reason: { type: "string" },
          isOldPrice: { type: "boolean" },
        },
      },
    },
  },
  max_output_tokens: 250,
});

exports.aiScanPrice = onRequest(
  {
    region,
    timeoutSeconds: 30,
    cors: true,
    secrets: ["OPENAI_API_KEY"],
  },
  async (req, res) => {
    if (req.method === "OPTIONS") {
      res.status(204).set(jsonHeaders).send("");
      return;
    }
    if (req.method !== "POST") {
      res.status(405).set(jsonHeaders).send(JSON.stringify({ error: "Method not allowed" }));
      return;
    }

    try {
      const { base64Image } = req.body || {};
      if (!base64Image || typeof base64Image !== "string") {
        res.status(400).set(jsonHeaders).send(JSON.stringify({ error: "Missing base64Image" }));
        return;
      }

      const openAiKey = process.env.OPENAI_API_KEY;
      if (!openAiKey) {
        res.status(500).set(jsonHeaders).send(JSON.stringify({ error: "OpenAI key is not configured" }));
        return;
      }

      const upstream = await fetch("https://api.openai.com/v1/responses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openAiKey}`,
        },
        body: JSON.stringify(makeOpenAiBody(base64Image)),
      });

      const text = await upstream.text();
      res.status(upstream.status).set(jsonHeaders).send(text);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      res.status(500).set(jsonHeaders).send(JSON.stringify({ error: message }));
    }
  }
);

exports.getLatestRates = onRequest(
  {
    region,
    timeoutSeconds: 20,
    cors: true,
    secrets: ["EXCHANGE_RATE_API_KEY"],
  },
  async (req, res) => {
    if (req.method === "OPTIONS") {
      res.status(204).set(jsonHeaders).send("");
      return;
    }
    if (req.method !== "POST") {
      res.status(405).set(jsonHeaders).send(JSON.stringify({ error: "Method not allowed" }));
      return;
    }

    try {
      const { baseCurrency = "USD" } = req.body || {};
      const safeBase = String(baseCurrency).toUpperCase();
      if (!/^[A-Z]{3}$/.test(safeBase)) {
        res.status(400).set(jsonHeaders).send(JSON.stringify({ error: "Invalid baseCurrency" }));
        return;
      }

      const exchangeKey = process.env.EXCHANGE_RATE_API_KEY;
      if (!exchangeKey) {
        res.status(500).set(jsonHeaders).send(JSON.stringify({ error: "Exchange key is not configured" }));
        return;
      }

      const upstream = await fetch(`https://v6.exchangerate-api.com/v6/${exchangeKey}/latest/${safeBase}`);
      const text = await upstream.text();
      res.status(upstream.status).set(jsonHeaders).send(text);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      res.status(500).set(jsonHeaders).send(JSON.stringify({ error: message }));
    }
  }
);

exports.getHistoricalRates = onRequest(
  {
    region,
    timeoutSeconds: 20,
    cors: true,
    secrets: ["EXCHANGE_RATE_API_KEY"],
  },
  async (req, res) => {
    if (req.method === "OPTIONS") {
      res.status(204).set(jsonHeaders).send("");
      return;
    }
    if (req.method !== "POST") {
      res.status(405).set(jsonHeaders).send(JSON.stringify({ error: "Method not allowed" }));
      return;
    }

    try {
      const { baseCurrency, year, month, day } = req.body || {};
      const safeBase = String(baseCurrency || "").toUpperCase();
      const safeYear = Number(year);
      const safeMonth = Number(month);
      const safeDay = Number(day);

      if (!/^[A-Z]{3}$/.test(safeBase)) {
        res.status(400).set(jsonHeaders).send(JSON.stringify({ error: "Invalid baseCurrency" }));
        return;
      }
      if (!Number.isInteger(safeYear) || safeYear < 2000 || safeYear > 2100) {
        res.status(400).set(jsonHeaders).send(JSON.stringify({ error: "Invalid year" }));
        return;
      }
      if (!Number.isInteger(safeMonth) || safeMonth < 1 || safeMonth > 12) {
        res.status(400).set(jsonHeaders).send(JSON.stringify({ error: "Invalid month" }));
        return;
      }
      if (!Number.isInteger(safeDay) || safeDay < 1 || safeDay > 31) {
        res.status(400).set(jsonHeaders).send(JSON.stringify({ error: "Invalid day" }));
        return;
      }

      const exchangeKey = process.env.EXCHANGE_RATE_API_KEY;
      if (!exchangeKey) {
        res.status(500).set(jsonHeaders).send(JSON.stringify({ error: "Exchange key is not configured" }));
        return;
      }

      const upstream = await fetch(
        `https://v6.exchangerate-api.com/v6/${exchangeKey}/history/${safeBase}/${safeYear}/${safeMonth}/${safeDay}`
      );
      const text = await upstream.text();
      res.status(upstream.status).set(jsonHeaders).send(text);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      res.status(500).set(jsonHeaders).send(JSON.stringify({ error: message }));
    }
  }
);
