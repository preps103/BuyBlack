import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware to parse JSON payloads
  app.use(express.json());

  // Initialize Gemini API client server-side
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY || "",
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  // API Route: Umoja Scout AI Personal Shopper
  app.post("/api/gemini/chat", async (req, res) => {
    try {
      const { message, chatHistory, stores } = req.body;
      
      // Pass store inventory summary to Gemini
      const storeContext = stores ? JSON.stringify(stores.map((s: any) => ({
        id: s.id,
        name: s.name,
        category: s.category,
        ownerName: s.ownerName,
        story: s.story,
        products: s.products.map((p: any) => ({
          id: p.id,
          name: p.name,
          price: p.price,
          description: p.description
        }))
      }))) : "";

      const systemInstruction = `You are "Umoja Scout", an inspiring, knowledgeable, and deeply welcoming AI Personal Shopper for the BuyBlack Marketplace. BuyBlack is a premium digital hub dedicated to celebrating and supporting exceptional Black-owned businesses, products, and builders.

Your mission is to help customers navigate the marketplace, suggest specific store pairings, answer cultural context queries, and guide gift-finding.

Below is the current marketplace directory list (complete with products, pricing, and owner backgrounds):
${storeContext}

Operational Guidelines:
1. Speak with warmth, pride, and authentic hospitality. Avoid dry corporate jargon.
2. Recommend specific stores and items from the provided database. Specify exact pricing (e.g. $24.99) and store names in bold.
3. Keep answers highly interactive and conversational. Highlight the story of the founder when making recommendations.
4. Format all recommendations in elegant Markdown, using bold titles, bullets, and spaced paragraphs. Keep text punchy but meaningful.
5. If a shopper asks for items outside of our immediate directory, politely recommend the closest cultural category or brand we do have, and warmly explain how our curated shops might still have what they need!
6. Never make up stores or products that aren't in the context. Recommend ONLY stores present in the provided marketplace list. Let them know they can easily register NEW stores in the Merchant Center and then ask you about them!`;

      // Build contents array
      const contents: any[] = [];
      if (chatHistory && Array.isArray(chatHistory)) {
        for (const turn of chatHistory) {
          contents.push({
            role: turn.role === 'user' ? 'user' : 'model',
            parts: [{ text: turn.text }]
          });
        }
      }
      contents.push({
        role: 'user',
        parts: [{ text: message }]
      });

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: contents,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.7,
        },
      });

      res.json({ text: response.text });
    } catch (error: any) {
      console.error("Gemini Chat Error:", error);
      res.status(500).json({ error: error.message || "Failed to generate AI Shopper recommendation" });
    }
  });

  // API Route: Merchant Center Brand Copywriter
  app.post("/api/gemini/merchant", async (req, res) => {
    try {
      const { action, text, context } = req.body;
      let prompt = "";
      let systemInstruction = "";

      if (action === "enhance_bio") {
        systemInstruction = "You are a soul-stirring, highly premium brand storyteller and copywriting expert specializing in luxury, boutique, and grassroots independent companies. Your writing is engaging, authentic, and emotionally captivating.";
        prompt = `Please transform the following raw draft bio or notes about a Black-owned boutique store into a premium, deeply compelling brand narrative statement for their 'About Us' section. Highlight the owner's devotion to quality, their cultural inspiration, artisanal methods, or grassroots dream. Format it in 2 coherent, beautifully written paragraphs.
        
Store Name: ${context?.storeName || 'This Boutique'}
Category: ${context?.category || 'Boutique'}
Raw Founder Draft: "${text}"`;
      } else if (action === "generate_product_desc") {
        systemInstruction = "You are a professional e-commerce product marketer specializing in writing enchanting, rich product copy that drives customer emotional connection and sales.";
        prompt = `Write a punchy, highly alluring product description in 2-3 elegant sentences. Highlight sensory details, quality, and the pride of ownership.
        
Product Title: "${text}"
Store Name: "${context?.storeName || 'Boutique'}"
Category Focus: ${context?.category || ''}
Store Narrative Backdrop: "${context?.storeStory || ''}"`;
      } else {
        return res.status(400).json({ error: "Unsupported copywriter action" });
      }

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.8,
        }
      });

      res.json({ text: response.text });
    } catch (error: any) {
      console.error("Gemini Merchant Copywriting Error:", error);
      res.status(500).json({ error: error.message || "Failed to craft merchant brand text" });
    }
  });

  // Vite integration as standard middleware for asset routing and HMR
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[BuyBlack Server] Listening on http://localhost:${PORT}`);
  });
}

startServer();

