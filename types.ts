
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

// Interfaces para el sistema de traducción
export interface TranslationDictionary {
  app: {
    home: string;
    newPrompt: string;
    editPrompt: string;
    admin: string;
    title: string;
    searchPlaceholder: string;
    allCategories: string;
    db: {
      local: string;
      persistent: string;
      connecting: string;
      indexed: string;
    };
    backupDesc: string;
    restoreDesc: string;
    stats: {
      total: string;
      categories: string;
      models: string;
    }
  };
  table: {
    identity: string;
    objective: string;
    engine: string;
    sourceCode: string;
    metadata: string;
    controls: string;
    emptyTitle: string;
    emptyDesc: string;
    entriesLoaded: string;
    systemReady: string;
    copy: string;
    copied: string;
    close: string;
    openAction: string; // New field for the primary button
  };
  form: {
    editTitle: string;
    newTitle: string;
    systemId: string;
    abort: string;
    save: string;
    dragDrop: {
      analyzing: string;
      analyzingSub: string;
      title: string;
      desc: string;
    };
    sections: {
      core: string;
      vars: string;
      engineering: string;
    };
    labels: {
      designation: string;
      category: string;
      engine: string;
      persona: string;
      variables: string;
      tags: string;
      objective: string;
      inputFormat: string;
      content: string;
      notes: string;
    };
    buttons: {
      audio: string;
      audioPlaying: string;
      optimize: string;
      optimizing: string;
      add: string;
      pdf: string;
    };
    placeholders: {
      name: string;
      persona: string;
      variable: string;
      tag: string;
      objective: string;
      input: string;
      content: string;
      notes: string;
    };
    status: {
      ready: string;
      varsDetected: string;
    }
  };
  admin: {
    title: string;
    subtitle: string;
    columns: {
      name: string;
      category: string;
      preview: string;
      actions: string;
    };
    buttons: {
      improveAi: string;
      edit: string;
      delete: string;
      export: string;
      import: string; // Restore Backup
      smartImport: string; // New AI Import
      processing: string;
      reset: string;
    };
    empty: string;
    dataManagement: string;
  };
}