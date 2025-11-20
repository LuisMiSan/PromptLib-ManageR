export enum AIModel {
  ChatGPT = 'ChatGPT',
  Gemini = 'Gemini 2.5 Flash',
  GeminiLite = 'Gemini Flash Lite',
  GeminiPro = 'Gemini 3 Pro (Thinking)',
  Claude = 'Claude',
  Other = 'Other'
}

export enum Category {
  Marketing = 'Marketing y Contenido',
  Productivity = 'Productividad y Organización',
  Creativity = 'Creatividad y Generación de Ideas',
  Analysis = 'Análisis de Data',
  Development = 'Desarrollo y Código',
  Other = 'Otros'
}

export interface PromptEntry {
  id: string;
  category: Category | string;
  name: string;
  objective: string;
  inputType: string;
  persona: string;
  recommendedAi: AIModel;
  description: string;
  content: string; // The actual prompt text
  variables: string[]; // e.g., ["Tone", "Audience"]
  usageExamples: string;
  tags: string[];
}

export type PromptFormData = Omit<PromptEntry, 'id'>;