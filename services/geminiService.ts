
import { GoogleGenAI, Type } from "@google/genai";
import { Bank, Expense } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

const getExpenseSchema = (userCategories: string[]) => ({
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      name: { type: Type.STRING, description: 'Nombre del establecimiento' },
      date: { type: Type.STRING, description: 'Fecha YYYY-MM-DD' },
      amount: { type: Type.NUMBER, description: 'Monto' },
      currency: { type: Type.STRING, description: 'PEN o USD' },
      category: { 
        type: Type.STRING, 
        description: `Categoría. Debe ser una de estas: ${userCategories.join(', ')}` 
      }
    },
    required: ['name', 'amount', 'currency', 'category']
  }
});

const getCorrectionsContext = (corrections: Record<string, string>) => {
  const entries = Object.entries(corrections);
  if (entries.length === 0) return "";
  return `\nIMPORTANTE: El usuario ha corregido previamente estas categorizaciones, respétalas si aparecen nombres similares:\n${entries.map(([name, cat]) => `- "${name}" DEBE SER "${cat}"`).join('\n')}`;
};

export const analyzeDocumentStatement = async (
  fileBase64: string,
  mimeType: string,
  bank: Bank,
  periodMonth: string,
  periodYear: string,
  userCategories: string[],
  corrections: Record<string, string>
): Promise<Partial<Expense>[]> => {
  const model = 'gemini-3-pro-preview';
  
  const prompt = `
    Analiza este estado de cuenta del banco ${bank} (${periodMonth}/${periodYear}).
    Extrae consumos y compras. 
    IGNORA: Pagos a la tarjeta o abonos.
    Categoriza cada gasto usando EXCLUSIVAMENTE esta lista: ${userCategories.join(', ')}.${getCorrectionsContext(corrections)}
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: [{ inlineData: { data: fileBase64, mimeType } }, { text: prompt }],
      config: {
        responseMimeType: "application/json",
        responseSchema: getExpenseSchema(userCategories)
      }
    });

    return JSON.parse(response.text || '[]');
  } catch (error) {
    console.error("Error analyzing document:", error);
    throw error;
  }
};

export const categorizeExpenseName = async (
  name: string, 
  userCategories: string[], 
  corrections: Record<string, string>
): Promise<string> => {
  // Primero revisamos si ya existe una corrección exacta para este nombre
  if (corrections[name]) return corrections[name];

  const model = 'gemini-3-flash-preview';
  const prompt = `Categoriza "${name}" en una de estas opciones: ${userCategories.join(', ')}.${getCorrectionsContext(corrections)}\nResponde solo con el nombre de la categoría.`;

  try {
    const response = await ai.models.generateContent({ model, contents: prompt });
    return response.text?.trim() || 'Otros';
  } catch (error) {
    return 'Otros';
  }
};
