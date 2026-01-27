import { GoogleGenAI, Type, Modality } from "@google/genai";
import { PromptFormData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- HELPERS PARA AUDIO ---
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}
// --------------------------

// Helper: Convert File to Base64 string (for Images/PDF)
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
  });
};

// Helper: Read text file content
const fileToText = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsText(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

// Helper: Extract text from DOCX using Mammoth
const fileToDocxText = async (file: File): Promise<string> => {
  if ((window as any).mammoth) {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await (window as any).mammoth.extractRawText({ arrayBuffer });
      return result.value;
    } catch (e) {
      console.error("Mammoth extraction failed:", e);
      throw new Error("No se pudo leer el archivo Word.");
    }
  }
  throw new Error("La librería Mammoth no está cargada.");
};

const cleanJSON = (text: string) => {
  if (!text) return "{}";
  return text.replace(/```json\s*|\s*```/g, "").trim();
};

export const optimizePromptContent = async (currentData: PromptFormData): Promise<string> => {
  try {
    const promptInstructions = `
      Actúa como un ingeniero de prompts experto.
      Objetivo: ${currentData.objective}
      Rol: ${currentData.persona}
      Contenido: ${currentData.content || "No especificado"}
      
      Escribe una versión optimizada y profesional de este prompt. 
      Solo devuelve el texto optimizado.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: promptInstructions,
      config: {
        thinkingConfig: { thinkingBudget: 1024 } 
      }
    });

    return response.text || currentData.content;
  } catch (error) {
    console.error("Error optimizing:", error);
    throw error;
  }
};

export const generateTags = async (objective: string, category: string): Promise<string[]> => {
  try {
    const promptInstructions = `
      Genera 3 etiquetas cortas para: ${category}, ${objective}.
      Separadas por comas.
    `;
    const response = await ai.models.generateContent({
      model: 'gemini-flash-lite-latest', 
      contents: promptInstructions,
    });
    const text = response.text || "";
    return text.split(',').map(tag => tag.trim()).filter(t => t.length > 0);
  } catch (error) {
    return ["AI", "Productivity"];
  }
};

const getFileContentPart = async (file: File): Promise<any> => {
  if (file.type.startsWith('image/') || file.type === 'application/pdf') {
     const base64Data = await fileToBase64(file);
     return {
        inlineData: { data: base64Data, mimeType: file.type }
      };
  } else if (file.name.endsWith('.docx') || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      const docText = await fileToDocxText(file);
      return { text: `Contenido Word:\n${docText}` };
  } else {
      const textContent = await fileToText(file);
      return { text: `Contenido:\n${textContent}` };
  }
};

// --- FUNCIÓN CLAVE MEJORADA PARA BATCH ---
export const extractMultiplePromptsFromFile = async (file: File): Promise<Partial<PromptFormData>[]> => {
  try {
    const contentPart = await getFileContentPart(file);
    const modelToUse = 'gemini-3-pro-preview'; 

    const promptInstruction = `
      TAREA CRÍTICA: EXTRACCIÓN Y SEPARACIÓN DE PROMPTS.

      El documento contiene una LISTA NUMERADA de prompts (ej: "1. Título", "2. Título").
      
      TU OBJETIVO ES SEPARARLOS. NO LOS FUSIONES.
      Si el documento dice:
      "1. Prompt A..."
      "2. Prompt B..."
      
      Debes devolver UN ARRAY JSON con 2 objetos.
      
      Estructura para cada objeto:
      {
        "name": "El título que aparece junto al número (sin el número)",
        "objective": "Objetivo deducido",
        "persona": "Rol deducido",
        "content": "EL TEXTO INTEGRO DEL PROMPT. Solo el contenido de ese número.",
        "tags": ["tag1", "tag2"]
      }

      Analiza el documento completo y extrae TODOS los items numerados como entradas independientes.
    `;

    const response = await ai.models.generateContent({
      model: modelToUse,
      contents: [
        contentPart,
        { text: promptInstruction }
      ],
      config: {
        thinkingConfig: { thinkingBudget: 16000 }, // Pensar profundo para segmentar bien
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              objective: { type: Type.STRING },
              persona: { type: Type.STRING },
              content: { type: Type.STRING },
              tags: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ['name', 'content']
          }
        }
      }
    });

    if (response.text) {
      const parsed = JSON.parse(cleanJSON(response.text));
      return Array.isArray(parsed) ? parsed : [parsed];
    }
    throw new Error("No response");

  } catch (error) {
    console.error("Batch extraction error:", error);
    throw error;
  }
};

// Mantenemos esta por compatibilidad, pero internamente llamará a la lógica de batch si detecta listas?
// No, mejor mantenerla simple para casos donde el usuario solo quiere extraer 1 cosa específica.
export const extractPromptFromFile = async (file: File): Promise<Partial<PromptFormData>> => {
  // Alias to batch but taking first one to be safe, or separate logic.
  // We keep separate logic for simplicity in "Single Prompt Mode"
  try {
    const contentPart = await getFileContentPart(file);
    const promptInstruction = `Extrae 1 prompt de este archivo en JSON: name, objective, persona, content, tags.`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [contentPart, { text: promptInstruction }],
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            objective: { type: Type.STRING },
            persona: { type: Type.STRING },
            content: { type: Type.STRING },
            tags: { type: Type.ARRAY, items: { type: Type.STRING } }
          }
        }
      }
    });
    if (response.text) return JSON.parse(cleanJSON(response.text));
    throw new Error("No data");
  } catch (e) { throw e; }
};

export const generateSpeechFromText = async (text: string): Promise<void> => {
  if (!text) return;
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
      },
    });
    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) return;
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 24000});
    const audioBuffer = await decodeAudioData(decode(base64Audio), ctx, 24000, 1);
    const source = ctx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(ctx.destination);
    source.start();
  } catch (error) { console.error("TTS Error", error); }
};