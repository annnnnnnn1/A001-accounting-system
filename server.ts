import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

async function startServer() {
  const app = express();
  app.use(express.json());
  const PORT = 3000;

  // AI Pricing & Cross-Border Fee Engine API
  app.post('/api/ai-fee', async (req, res) => {
    try {
      const { platformName, cardType, recipeName, trueCost } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;

      if (!apiKey) {
        let platformFee = 3.0;
        if (platformName?.includes('蝦皮')) platformFee = 7.5;
        if (platformName?.includes('Pinkoi')) platformFee = 15.0;
        if (platformName?.includes('微信') || platformName?.includes('市集')) platformFee = 0.0;

        return res.json({
          success: true,
          platformFeePercent: platformFee,
          cardFeePercent: 1.5,
          crossBorderFeePercent: 0,
          reasoning: `系統為您預設帶入【${platformName || '大陸跨境平台'}】之典型手續費（平台 ${platformFee}% + 海外信用卡 1.5%）。已保留手動覆蓋權限。`,
          recommendedMargin: 50
        });
      }

      const ai = new GoogleGenAI({ apiKey });
      const prompt = `你是一名專精於跨境電商、手作捏捏（Squishy）商品與財務定價的 AI 顧問。
使用者想瞭解上架平台「${platformName || '淘寶/拼多多/蝦皮'}」、支付方式「${cardType || '海外信用卡'}」的最新手續費率。
商品名稱為：「${recipeName || '手作捏捏'}」，真實製作總成本為：¥${trueCost || 100}元。

請以純 JSON 格式回應，包含以下欄位：
{
  "platformFeePercent": 平台抽成百分比數字 (例如 3.0 或 7.5 或 15.0),
  "cardFeePercent": 信用卡或支付渠道手續費百分比數字 (例如 1.5 或 2.0),
  "crossBorderFeePercent": 跨境綜合處理費百分比數字 (例如 0 或 1.0),
  "reasoning": "繁體中文精簡分析（50字內）：平台抽成、海外信用卡費與手動微調補貼建議",
  "recommendedMargin": 建議目標毛利率數字 (例如 50 或 60)
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json'
        }
      });

      const text = response.text || '{}';
      const parsed = JSON.parse(text);

      return res.json({
        success: true,
        platformFeePercent: parsed.platformFeePercent ?? 3.0,
        cardFeePercent: parsed.cardFeePercent ?? 1.5,
        crossBorderFeePercent: parsed.crossBorderFeePercent ?? 0,
        reasoning: parsed.reasoning || "AI 已為您分析最新平台抽成與跨境信用卡費率。",
        recommendedMargin: parsed.recommendedMargin ?? 50
      });
    } catch (err: any) {
      console.error("AI Fee API error:", err);
      return res.json({
        success: true,
        platformFeePercent: 3.0,
        cardFeePercent: 1.5,
        crossBorderFeePercent: 0,
        reasoning: "AI 服務進行預設帶入：平台 3% + 海外信用卡刷卡費 1.5%。可手動隨時調整。",
        recommendedMargin: 50
      });
    }
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
