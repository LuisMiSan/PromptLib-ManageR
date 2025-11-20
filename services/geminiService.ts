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
      // Remove data url prefix (e.g. "data:image/png;base64,")
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

// Helper: Extract text from DOCX using Mammoth (loaded in index.html)
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

// FEATURE: Think more when needed (Reasoning)
export const optimizePromptContent = async (currentData: PromptFormData): Promise<string> => {
  try {
    const promptInstructions = `
      Actúa como un ingeniero de prompts experto y meticuloso.
      Tengo un borrador de un prompt o una idea para un prompt con los siguientes detalles:
      
      - Objetivo: ${currentData.objective}
      - Rol/Persona: ${currentData.persona}
      - Contenido actual: ${currentData.content || "No especificado aún"}
      
      Por favor, piensa paso a paso cómo mejorar esto. Escribe una versión optimizada y profesional de este prompt. 
      Usa técnicas de prompt engineering (claridad, contexto, pasos, formato de salida).
      Solo devuelve el texto del prompt optimizado, sin explicaciones adicionales.
    `;

    // Usamos Gemini 3 Pro con Thinking Budget para tareas complejas de razonamiento
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: promptInstructions,
      config: {
        thinkingConfig: {
          thinkingBudget: 32768 // Max thinking budget for heavy reasoning
        }
      }
    });

    return response.text || currentData.content;
  } catch (error) {
    console.error("Error optimizing prompt with Gemini:", error);
    throw error;
  }
};

// FEATURE: Fast AI responses (Low Latency)
export const generateTags = async (objective: string, category: string): Promise<string[]> => {
  try {
    const promptInstructions = `
      Genera 3 etiquetas (tags) cortas y relevantes para un prompt de IA basado en:
      Categoría: ${category}
      Objetivo: ${objective}
      
      Devuelve solo las etiquetas separadas por comas. Ejemplo: "Email, Ventas, Formal".
    `;

    // Usamos Gemini Flash Lite para respuestas rápidas (Low Latency)
    const response = await ai.models.generateContent({
      model: 'gemini-flash-lite-latest', 
      contents: promptInstructions,
    });

    const text = response.text || "";
    return text.split(',').map(tag => tag.trim()).filter(t => t.length > 0);
  } catch (error) {
    console.error("Error generating tags:", error);
    return ["AI", "Productivity"];
  }
};

// FEATURE: Analyze images (Multimodal with Vision)
export const extractPromptFromFile = async (file: File): Promise<Partial<PromptFormData>> => {
  try {
    let contentPart;
    let modelToUse = 'gemini-2.5-flash'; // Default for text/docs

    // 1. Handle Images (Use Gemini 3 Pro for advanced vision as requested)
    if (file.type.startsWith('image/')) {
      modelToUse = 'gemini-3-pro-preview';
      const base64Data = await fileToBase64(file);
      contentPart = {
        inlineData: {
          data: base64Data,
          mimeType: file.type
        }
      };
    } 
    // 2. Handle PDF
    else if (file.type === 'application/pdf') {
      const base64Data = await fileToBase64(file);
      contentPart = {
        inlineData: {
          data: base64Data,
          mimeType: file.type
        }
      };
    }
    // 3. Handle Word Documents (.docx)
    else if (file.name.endsWith('.docx') || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      const docText = await fileToDocxText(file);
      contentPart = { text: `Contenido del archivo Word:\n${docText}` };
    }
    // 4. Handle Text Files
    else {
      const textContent = await fileToText(file);
      contentPart = { text: `Contenido del archivo:\n${textContent}` };
    }

    const promptInstruction = `
      Analiza el archivo proporcionado. Parece contener un prompt, una idea para un prompt, o un documento del cual se puede extraer un prompt útil.
      
      Tu tarea es extraer la información y estructurarla para una biblioteca de prompts.
      1. Identifica el objetivo principal.
      2. Identifica el rol o persona sugerida.
      3. Extrae o redacta el contenido del prompt.
      4. Sugiere 3 tags relevantes.
      5. Sugiere un nombre corto para el prompt.
      
      Responde estrictamente en formato JSON.
    `;

    const response = await ai.models.generateContent({
      model: modelToUse,
      contents: [
        contentPart,
        { text: promptInstruction }
      ],
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            objective: { type: Type.STRING },
            persona: { type: Type.STRING },
            content: { type: Type.STRING },
            tags: { 
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ['name', 'objective', 'content', 'tags']
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text);
    }
    throw new Error("No response text from Gemini");

  } catch (error) {
    console.error("Error extracting from file:", error);
    throw error;
  }
};

// FEATURE: Generate speech (TTS)
export const generateSpeechFromText = async (text: string): Promise<void> => {
  if (!text) return;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' }, // 'Puck', 'Charon', 'Kore', 'Fenrir', 'Zephyr'
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) throw new Error("No audio data received");

    const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 24000});
    const outputNode = outputAudioContext.createGain();
    
    const audioBuffer = await decodeAudioData(
      decode(base64Audio),
      outputAudioContext,
      24000,
      1,
    );
    
    const source = outputAudioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(outputNode);
    outputNode.connect(outputAudioContext.destination);
    source.start();

  } catch (error) {
    console.error("Error generating speech:", error);
    throw error;
  }
};