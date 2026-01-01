
import { GoogleGenAI } from "@google/genai";
import { SaleRecord, Product } from "../types";

// The API key must be obtained exclusively from process.env.API_KEY without modification.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getSalesInsights = async (sales: SaleRecord[], products: Product[]) => {
  const summary = {
    totalSales: sales.length,
    revenue: sales.reduce((acc, s) => acc + s.totalAmount, 0),
    inventoryAlerts: products.filter(p => p.quantity < 10).map(p => p.name),
    recentSales: sales.slice(-5).map(s => ({ date: new Date(s.timestamp).toLocaleString(), amount: s.totalAmount }))
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analyze this sales data for Sellespro POS and provide a 3-point business strategy:
      ${JSON.stringify(summary)}`,
      config: {
        systemInstruction: "You are a senior business analyst for a retail management system. Provide concise, data-driven insights."
      }
    });
    // response.text is a property, not a method.
    return response.text;
  } catch (error) {
    console.error("AI Insights Error:", error);
    return "Unable to load AI insights at this time.";
  }
};
