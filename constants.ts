import { PromptEntry, Category, AIModel, TranslationDictionary } from './types';

export const MOCK_PROMPTS: PromptEntry[] = [
  {
    id: '1',
    category: Category.Marketing,
    name: 'Post de LinkedIn',
    objective: 'Escribir un post persuasivo en LinkedIn sobre un nuevo producto',
    inputType: 'Características del producto',
    persona: 'Copywriter Senior experto en B2B',
    recommendedAi: AIModel.ChatGPT,
    description: 'Usar estructura AIDA para maximizar engagement.',
    content: 'Actúa como un [Rol]. Escribe una publicación de LinkedIn sobre [Producto]. Usa un gancho fuerte en la primera línea. El objetivo es [Objetivo]. Usa párrafos cortos y emojis estratégicos. Termina con una llamada a la acción preguntando [Pregunta].',
    variables: ['Rol', 'Producto', 'Objetivo', 'Pregunta'],
    usageExamples: '',
    tags: ['Redes Sociales', 'Ventas', 'Persuasión']
  },
  {
    id: '2',
    category: Category.Productivity,
    name: 'Asuntos de email',
    objective: 'Crear líneas de asunto efectivas para correos electrónicos de ventas en frío',
    inputType: 'Propuesta de valor',
    persona: 'Especialista en Email Marketing',
    recommendedAi: AIModel.Claude,
    description: 'Generar 10 opciones variando entre curiosidad y beneficio directo.',
    content: 'Genera 10 líneas de asunto para un correo de ventas frías dirigido a [Cargo del Cliente]. La propuesta de valor principal es [Beneficio]. Los asuntos deben ser cortos (menos de 50 caracteres), intrigantes y evitar palabras spam.',
    variables: ['Cargo del Cliente', 'Beneficio'],
    usageExamples: '',
    tags: ['Email', 'Ventas', 'Corto']
  },
  {
    id: '3',
    category: Category.Creativity,
    name: 'Resumen de reuniones',
    objective: 'Resumir reuniones de manera estructurada y con acciones concretas',
    inputType: 'Transcripción de la reunión',
    persona: 'Project Manager eficiente',
    recommendedAi: AIModel.Gemini,
    description: 'Ideal para ventanas de contexto largas.',
    content: 'Analiza la siguiente transcripción de reunión: [Transcripción]. \n1. Extrae los 3 puntos clave discutidos.\n2. Lista todas las tareas asignadas en formato tabla (Quién, Qué, Para cuándo).\n3. Identifica cualquier bloqueo o riesgo mencionado.\n4. Redacta un email de seguimiento formal para los asistentes.',
    variables: ['Transcripción'],
    usageExamples: '',
    tags: ['Gestión', 'Resumen', 'Accionable']
  },
  {
    id: '4',
    category: Category.Analysis,
    name: 'Planificación de proyectos',
    objective: 'Diseñar un plan de proyecto estructurado desde cero',
    inputType: 'Objetivo del proyecto',
    persona: 'Director de Operaciones',
    recommendedAi: AIModel.Gemini,
    description: '',
    content: 'Crea un plan de proyecto detallado para [Nombre del Proyecto]. Incluye fases, hitos principales, recursos necesarios y una estimación de riesgos potenciales. El plazo total es de [Duración].',
    variables: ['Nombre del Proyecto', 'Duración'],
    usageExamples: '',
    tags: ['Planificación', 'Estrategia']
  }
];

export const TRANSLATIONS: Record<'es' | 'en', TranslationDictionary> = {
  es: {
    app: {
      home: 'Inicio',
      newPrompt: 'Nuevo Prompt',
      editPrompt: 'Editar Prompt',
      title: 'Gestor',
      searchPlaceholder: 'Buscar en la base de datos...',
      allCategories: 'Todas las Categorías',
      stats: {
        total: 'Total Prompts',
        categories: 'Categorías',
        models: 'Modelos IA'
      }
    },
    table: {
      identity: 'Identidad',
      objective: 'Objetivo',
      engine: 'Motor',
      sourceCode: 'Código Fuente',
      metadata: 'Metadatos',
      controls: 'Controles',
      emptyTitle: 'Sistema Vacío',
      emptyDesc: 'Inicializa tu primer protocolo para comenzar.',
      entriesLoaded: 'ENTRADAS CARGADAS',
      systemReady: 'SISTEMA LISTO',
      copy: 'Copiar Código',
      copied: 'Copiado',
      close: 'Cerrar'
    },
    form: {
      editTitle: 'Modificar Protocolo',
      newTitle: 'Inicializar Nuevo Protocolo',
      systemId: 'ID Sistema',
      abort: 'Cancelar',
      save: 'Ejecutar Guardado',
      dragDrop: {
        analyzing: 'ANALIZANDO DATOS...',
        analyzingSub: 'Red neuronal extrayendo patrones',
        title: 'Autocompletado IA',
        desc: 'Arrastra un archivo para extraer automáticamente la estructura del prompt usando modelos de Visión.'
      },
      sections: {
        core: 'Parámetros Base',
        vars: 'Variables Dinámicas y Etiquetas',
        engineering: 'Ingeniería de Prompts'
      },
      labels: {
        designation: 'Designación del Prompt',
        category: 'Categoría',
        engine: 'Motor Recomendado',
        persona: 'Persona / Rol',
        variables: 'Variables (Auto)',
        tags: 'Etiquetas del Sistema',
        objective: 'Objetivo Principal',
        inputFormat: 'Formato de Entrada',
        content: 'Contenido del Prompt',
        notes: 'Notas Adicionales'
      },
      buttons: {
        audio: 'REPRODUCIR TTS',
        audioPlaying: 'AUDIO...',
        optimize: 'MEJORA IA',
        optimizing: 'OPTIMIZANDO...',
        add: 'Añadir'
      },
      placeholders: {
        name: 'Ej: Generador de Contenido Viral',
        persona: 'Ej: Especialista SEO Senior',
        variable: 'Añadir variable...',
        tag: 'Añadir etiqueta...',
        objective: '¿Cuál es el objetivo específico de esta secuencia?',
        input: 'Ej: Texto plano, URL, CSV, Imagen...',
        content: '// Ingresa la secuencia aquí...\n// Usa [corchetes] para variables.\n\nActúa como un [Rol]. Escribe un análisis técnico de...',
        notes: 'Instrucciones de uso, contexto, restricciones...'
      },
      status: {
        ready: 'LISTO PARA PROCESAR',
        varsDetected: 'Variables entre [corchetes] detectadas.'
      }
    }
  },
  en: {
    app: {
      home: 'System_Root',
      newPrompt: 'New_Sequence',
      editPrompt: 'Edit_Protocol',
      title: 'Lib Manager',
      searchPlaceholder: 'Search database...',
      allCategories: 'All Categories',
      stats: {
        total: 'Total Units',
        categories: 'Categories',
        models: 'AI Engines'
      }
    },
    table: {
      identity: 'Identity',
      objective: 'Objective',
      engine: 'Engine',
      sourceCode: 'Source Code',
      metadata: 'Metadata',
      controls: 'Controls',
      emptyTitle: 'System Empty',
      emptyDesc: 'Initialize your first protocol prompt to begin.',
      entriesLoaded: 'ENTRIES LOADED',
      systemReady: 'SYSTEM READY',
      copy: 'Copy Source',
      copied: 'Copied',
      close: 'Close'
    },
    form: {
      editTitle: 'Modify Protocol',
      newTitle: 'Initialize New Protocol',
      systemId: 'System ID',
      abort: 'Abort',
      save: 'Execute Save',
      dragDrop: {
        analyzing: 'ANALYZING DATA...',
        analyzingSub: 'Neural network is extracting patterns',
        title: 'AI Auto-Fill',
        desc: 'Drop a file to automatically extract prompt structure using Vision models.'
      },
      sections: {
        core: 'Core Parameters',
        vars: 'Dynamic Vars & Tags',
        engineering: 'Prompt Engineering'
      },
      labels: {
        designation: 'Prompt Designation',
        category: 'Category',
        engine: 'Recommended Engine',
        persona: 'Persona / Role',
        variables: 'Variables (Auto)',
        tags: 'System Tags',
        objective: 'Primary Objective',
        inputFormat: 'Input Format',
        content: 'Prompt Content',
        notes: 'Additional Notes'
      },
      buttons: {
        audio: 'TTS_PLAY',
        audioPlaying: 'AUDIO_OUT...',
        optimize: 'AI_ENHANCE',
        optimizing: 'OPTIMIZING...',
        add: 'Add'
      },
      placeholders: {
        name: 'Ex: Viral Content Generator',
        persona: 'Ex: Senior SEO Specialist',
        variable: 'Add variable...',
        tag: 'Add tag...',
        objective: 'What is the specific goal of this sequence?',
        input: 'Ex: Raw Text, URL, CSV, Image...',
        content: '// Enter prompt sequence here...\n// Use [brackets] for variables.\n\nAct as a [Role]. Write a technical analysis of...',
        notes: 'Usage instructions, context, constraints...'
      },
      status: {
        ready: 'READY TO PROCESS',
        varsDetected: 'Variables in [brackets] auto-detected.'
      }
    }
  }
};