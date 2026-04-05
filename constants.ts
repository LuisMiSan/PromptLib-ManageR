import { PromptEntry, Category, AIModel, TranslationDictionary } from './types';

export const MOCK_PROMPTS: PromptEntry[] = [
  {
    id: '1',
    type: 'prompt',
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
    type: 'prompt',
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
    type: 'prompt',
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
    type: 'prompt',
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
  },
  {
    id: '5',
    type: 'prompt',
    category: Category.Development,
    name: 'Arquitecto de Apps Full-Stack',
    objective: 'Diseñar la arquitectura completa de una aplicación web moderna',
    inputType: 'Descripción de la idea',
    persona: 'Arquitecto de Software Senior',
    recommendedAi: AIModel.GeminiPro,
    description: 'Genera un blueprint técnico detallado incluyendo stack, DB y API.',
    content: 'Actúa como un Arquitecto de Software Senior. Diseña la arquitectura para una aplicación de [Tipo de App]. La aplicación debe incluir [Funcionalidades Clave]. \n\nProporciona:\n1. Stack tecnológico recomendado.\n2. Estructura de base de datos (Entidades y Relaciones).\n3. Definición de endpoints de API principales.\n4. Estrategia de despliegue y escalabilidad.',
    variables: ['Tipo de App', 'Funcionalidades Clave'],
    usageExamples: 'App de delivery, App de gestión de inventarios',
    tags: ['Arquitectura', 'Backend', 'Diseño Técnico']
  },
  {
    id: '6',
    type: 'skill',
    category: Category.WebInteraction,
    name: 'Buscador de Vuelos Agéntico',
    objective: 'Buscar y comparar vuelos en tiempo real usando herramientas externas',
    inputType: 'Origen, Destino, Fechas',
    persona: 'Agente de Viajes Inteligente',
    recommendedAi: AIModel.Gemini,
    description: 'Skill que permite al agente buscar vuelos reales mediante una API.',
    content: 'Eres un Agente de Viajes experto. Tu objetivo es encontrar las mejores opciones de vuelo para el usuario.',
    systemInstruction: 'Actúa como un asistente de viajes. Usa la herramienta search_flights para obtener datos reales. Compara precios y escalas antes de dar una recomendación final.',
    tools: JSON.stringify([
      {
        name: "search_flights",
        description: "Busca vuelos disponibles entre dos ciudades en fechas específicas",
        parameters: {
          type: "OBJECT",
          properties: {
            origin: { type: "STRING", description: "Código IATA de la ciudad de origen" },
            destination: { type: "STRING", description: "Código IATA de la ciudad de destino" },
            departure_date: { type: "STRING", description: "Fecha de salida en formato YYYY-MM-DD" }
          },
          required: ["origin", "destination", "departure_date"]
        }
      }
    ], null, 2),
    variables: ['Origen', 'Destino', 'Fecha'],
    usageExamples: 'Vuelos de Madrid a Tokyo el 20 de Mayo',
    tags: ['Agente', 'Tools', 'Viajes']
  },
  {
    id: '7',
    type: 'skill',
    category: Category.Automation,
    name: 'Analista de Repositorios GitHub',
    objective: 'Analizar la estructura y calidad de un repositorio de código',
    inputType: 'URL del Repositorio',
    persona: 'Ingeniero de QA / DevOps',
    recommendedAi: AIModel.GeminiPro,
    description: 'Skill para interactuar con la API de GitHub y auditar código.',
    content: 'Analiza el repositorio proporcionado y genera un reporte de salud técnica.',
    systemInstruction: 'Eres un auditor de código. Usa fetch_repo_structure para entender el proyecto y analyze_file para revisar archivos críticos.',
    tools: JSON.stringify([
      {
        name: "fetch_repo_structure",
        description: "Obtiene el árbol de archivos de un repositorio de GitHub",
        parameters: {
          type: "OBJECT",
          properties: {
            repo_url: { type: "STRING", description: "URL completa del repositorio" }
          },
          required: ["repo_url"]
        }
      },
      {
        name: "analyze_file",
        description: "Lee y analiza el contenido de un archivo específico",
        parameters: {
          type: "OBJECT",
          properties: {
            file_path: { type: "STRING", description: "Ruta del archivo dentro del repo" }
          },
          required: ["file_path"]
        }
      }
    ], null, 2),
    variables: ['Repo URL'],
    usageExamples: 'Analizar https://github.com/facebook/react',
    tags: ['Agente', 'GitHub', 'Código']
  },
  {
    id: '8',
    type: 'skill',
    category: Category.Analysis,
    name: 'Analista de Datos SQL',
    objective: 'Consultar bases de datos SQL y generar reportes visuales',
    inputType: 'Pregunta en lenguaje natural',
    persona: 'Data Scientist Senior',
    recommendedAi: AIModel.GeminiPro,
    description: 'Skill para traducir lenguaje natural a SQL y ejecutar consultas seguras.',
    content: 'Ayuda al usuario a entender sus datos ejecutando consultas SQL precisas.',
    systemInstruction: 'Eres un experto en SQL. Usa execute_query para obtener datos y generate_chart para visualizarlos. Siempre valida la seguridad de la consulta antes de ejecutarla.',
    tools: JSON.stringify([
      {
        name: "execute_query",
        description: "Ejecuta una consulta SQL de solo lectura en la base de datos",
        parameters: {
          type: "OBJECT",
          properties: {
            sql: { type: "STRING", description: "La consulta SQL a ejecutar" }
          },
          required: ["sql"]
        }
      },
      {
        name: "generate_chart",
        description: "Crea un gráfico a partir de un conjunto de datos",
        parameters: {
          type: "OBJECT",
          properties: {
            data: { type: "ARRAY", items: { type: "OBJECT" }, description: "Array de objetos con los datos" },
            type: { type: "STRING", enum: ["bar", "line", "pie"], description: "Tipo de gráfico" },
            title: { type: "STRING", description: "Título del gráfico" }
          },
          required: ["data", "type"]
        }
      }
    ], null, 2),
    variables: ['Pregunta'],
    usageExamples: '¿Cuáles fueron las ventas totales por mes el año pasado?',
    tags: ['Data', 'SQL', 'Visualización']
  },
  {
    id: '9',
    type: 'skill',
    category: Category.WebInteraction,
    name: 'Investigador de Mercado Agéntico',
    objective: 'Realizar investigaciones profundas en la web sobre temas específicos',
    inputType: 'Tema de investigación',
    persona: 'Analista de Mercado Estratégico',
    recommendedAi: AIModel.Gemini,
    description: 'Skill que combina búsqueda web y extracción de contenido para reportes.',
    content: 'Investiga el tema solicitado y proporciona un resumen ejecutivo con fuentes.',
    systemInstruction: 'Usa google_search para encontrar fuentes relevantes y fetch_url_content para leer los detalles. Sintetiza la información evitando duplicados.',
    tools: JSON.stringify([
      {
        name: "google_search",
        description: "Busca en la web usando Google Search",
        parameters: {
          type: "OBJECT",
          properties: {
            query: { type: "STRING", description: "Términos de búsqueda" }
          },
          required: ["query"]
        }
      },
      {
        name: "fetch_url_content",
        description: "Extrae el texto principal de una página web",
        parameters: {
          type: "OBJECT",
          properties: {
            url: { type: "STRING", description: "URL de la página a leer" }
          },
          required: ["url"]
        }
      }
    ], null, 2),
    variables: ['Tema'],
    usageExamples: 'Tendencias actuales en inteligencia artificial generativa 2026',
    tags: ['Investigación', 'Web', 'Reporte']
  },
  {
    id: '10',
    type: 'skill',
    category: Category.Automation,
    name: 'Gestor de Calendario Inteligente',
    objective: 'Gestionar eventos y disponibilidad en el calendario',
    inputType: 'Instrucción de agenda',
    persona: 'Asistente Ejecutivo Virtual',
    recommendedAi: AIModel.Gemini,
    description: 'Skill para automatizar la creación y consulta de eventos.',
    content: 'Gestiona mi agenda de manera eficiente, evitando conflictos de horario.',
    systemInstruction: 'Usa list_events para revisar mi disponibilidad y create_event para agendar nuevas citas. Confirma siempre los detalles antes de finalizar.',
    tools: JSON.stringify([
      {
        name: "list_events",
        description: "Lista los eventos del calendario para un rango de fechas",
        parameters: {
          type: "OBJECT",
          properties: {
            start_date: { type: "STRING", description: "Fecha inicio ISO" },
            end_date: { type: "STRING", description: "Fecha fin ISO" }
          },
          required: ["start_date", "end_date"]
        }
      },
      {
        name: "create_event",
        description: "Crea un nuevo evento en el calendario",
        parameters: {
          type: "OBJECT",
          properties: {
            summary: { type: "STRING", description: "Título del evento" },
            start_time: { type: "STRING", description: "Inicio ISO" },
            end_time: { type: "STRING", description: "Fin ISO" },
            location: { type: "STRING", description: "Ubicación opcional" }
          },
          required: ["summary", "start_time", "end_time"]
        }
      }
    ], null, 2),
    variables: ['Instrucción'],
    usageExamples: 'Agenda una reunión con el equipo de diseño mañana a las 10am',
    tags: ['Productividad', 'Calendario', 'Automatización']
  }
];

export const TRANSLATIONS: Record<'es' | 'en', TranslationDictionary> = {
  es: {
    app: {
      home: 'Inicio',
      newPrompt: 'Nueva Secuencia',
      editPrompt: 'Editar Protocolo',
      admin: 'Admin Console',
      title: 'Skill Hub',
      searchPlaceholder: 'Buscar en la base de datos...',
      allCategories: 'Todas las Categorías',
      db: {
        local: 'Local (Temp)',
        persistent: 'Persistente (Perm)',
        connecting: 'Conectando...',
        indexed: 'IndexedDB',
        cloud: 'Supabase Cloud (Activo)'
      },
      backupDesc: 'Descargar Base de Datos (JSON)',
      restoreDesc: 'Restaurar Base de Datos',
      stats: {
        total: 'Unidades Totales',
        categories: 'Categorías',
        models: 'Motores IA'
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
      copy: 'Copiar',
      copied: 'Copiado',
      close: 'Cerrar',
      openAction: 'Editar / Usar'
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
        engineering: 'Ingeniería Agéntica'
      },
      labels: {
        designation: 'Designación',
        category: 'Categoría',
        engine: 'Motor Recomendado',
        persona: 'Persona / Rol',
        variables: 'Variables (Auto)',
        tags: 'Etiquetas del Sistema',
        objective: 'Objetivo Principal',
        inputFormat: 'Formato de Entrada',
        content: 'Contenido / Prompt',
        notes: 'Notas Adicionales',
        type: 'Tipo de Entrada',
        systemInstruction: 'Instrucción del Sistema (Agente)',
        tools: 'Declaración de Herramientas (JSON)'
      },
      buttons: {
        audio: 'REPRODUCIR TTS',
        audioPlaying: 'AUDIO...',
        optimize: 'MEJORA IA',
        optimizing: 'OPTIMIZANDO...',
        add: 'Añadir',
        pdf: 'DESCARGAR PDF'
      },
      placeholders: {
        name: 'Ej: Buscador de Vuelos Agéntico',
        persona: 'Ej: Agente de Viajes Inteligente',
        variable: 'Añadir variable...',
        tag: 'Añadir etiqueta...',
        objective: '¿Qué problema resuelve esta capacidad?',
        input: 'Ej: JSON, URL, Parámetros...',
        content: '// Prompt base o instrucciones generales...',
        notes: 'Instrucciones de uso, límites, APIs necesarias...'
      },
      status: {
        ready: 'LISTO PARA PROCESAR',
        varsDetected: 'Variables entre [corchetes] detectadas.'
      }
    },
    admin: {
      title: 'Gestor de Base de Datos',
      subtitle: 'Acceso directo, backups y optimización',
      columns: {
        name: 'Nombre',
        category: 'Categoría',
        preview: 'Vista Previa',
        actions: 'Acciones de IA / Gestión'
      },
      buttons: {
        improveAi: 'Mejorar con IA',
        edit: 'Editar',
        delete: 'Eliminar',
        export: 'Exportar Backup',
        import: 'Restaurar JSON',
        smartImport: 'Importar Lote (AI)',
        processing: 'PROCESANDO LOTE...',
        reset: 'Resetear Fábrica'
      },
      empty: 'No hay registros en la base de datos.',
      dataManagement: 'Gestión de Datos'
    },
    cloud: {
      title: 'Conexión a Nube (Supabase)',
      desc: 'Conecta tu propia base de datos Postgres para sincronización permanente entre dispositivos.',
      urlPlaceholder: 'https://tu-proyecto.supabase.co',
      keyPlaceholder: 'Pegar ANON PUBLIC KEY (No usar service_role)',
      connect: 'Conectar Cloud',
      disconnect: 'Desconectar',
      sync: 'Subir Locales a Nube',
      status: {
        connected: 'Conectado a Supabase',
        disconnected: 'Solo Local (IndexedDB)',
        error: 'Error de Conexión (Revisar Keys)'
      }
    },
    auth: {
      login: 'Iniciar Sesión con Google',
      logout: 'Cerrar Sesión',
      welcome: 'Bienvenido',
    }
  },
  en: {
    app: {
      home: 'System_Root',
      newPrompt: 'New_Sequence',
      editPrompt: 'Edit_Protocol',
      admin: 'Admin Console',
      title: 'Skill Hub',
      searchPlaceholder: 'Search database...',
      allCategories: 'All Categories',
      db: {
        local: 'Local (Temp)',
        persistent: 'Persistent (Perm)',
        connecting: 'Connecting...',
        indexed: 'IndexedDB',
        cloud: 'Supabase Cloud (Active)'
      },
      backupDesc: 'Download Database (JSON)',
      restoreDesc: 'Restore Database',
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
      copy: 'Copy',
      copied: 'Copied',
      close: 'Close',
      openAction: 'Edit / Use'
    },
    form: {
      editTitle: 'Modify Protocol',
      newTitle: 'Initialize New Protocol',
      systemId: 'System ID',
      abort: 'Abort',
      save: 'Execute Save',
      dragDrop: {
        analyzing: 'ANALIZING DATA...',
        analyzingSub: 'Neural network is extracting patterns',
        title: 'AI Auto-Fill',
        desc: 'Drop a file to automatically extract prompt structure using Vision models.'
      },
      sections: {
        core: 'Core Parameters',
        vars: 'Dynamic Vars & Tags',
        engineering: 'Agentic Engineering'
      },
      labels: {
        designation: 'Designation',
        category: 'Category',
        engine: 'Recommended Engine',
        persona: 'Persona / Role',
        variables: 'Variables (Auto)',
        tags: 'System Tags',
        objective: 'Primary Objective',
        inputFormat: 'Input Format',
        content: 'Content / Prompt',
        notes: 'Additional Notes',
        type: 'Entry Type',
        systemInstruction: 'System Instruction (Agent)',
        tools: 'Tool Declarations (JSON)'
      },
      buttons: {
        audio: 'TTS_PLAY',
        audioPlaying: 'AUDIO_OUT...',
        optimize: 'AI_ENHANCE',
        optimizing: 'OPTIMIZING...',
        add: 'Add',
        pdf: 'DOWNLOAD PDF'
      },
      placeholders: {
        name: 'Ex: Agentic Flight Search',
        persona: 'Ex: Smart Travel Agent',
        variable: 'Add variable...',
        tag: 'Add tag...',
        objective: 'What capability does this agent provide?',
        input: 'Ex: JSON, URL, Parameters...',
        content: '// Base prompt or general instructions...',
        notes: 'Usage instructions, limits, required APIs...'
      },
      status: {
        ready: 'READY TO PROCESS',
        varsDetected: 'Variables in [brackets] auto-detected.'
      }
    },
    admin: {
      title: 'Database Manager',
      subtitle: 'Direct access, backups and optimization',
      columns: {
        name: 'Name',
        category: 'Category',
        preview: 'Preview',
        actions: 'AI Actions / Manage'
      },
      buttons: {
        improveAi: 'Improve with AI',
        edit: 'Edit',
        delete: 'Delete',
        export: 'Export JSON',
        import: 'Restore JSON',
        smartImport: 'Batch Import (AI)',
        processing: 'PROCESSING BATCH...',
        reset: 'Factory Reset'
      },
      empty: 'No entries in database.',
      dataManagement: 'Data Management'
    },
    cloud: {
      title: 'Cloud Connection (Supabase)',
      desc: 'Connect your own Postgres database for permanent sync across devices.',
      urlPlaceholder: 'https://your-project.supabase.co',
      keyPlaceholder: 'Paste ANON PUBLIC KEY (Do NOT use service_role)',
      connect: 'Connect Cloud',
      disconnect: 'Disconnect',
      sync: 'Upload Local to Cloud',
      status: {
        connected: 'Connected to Supabase',
        disconnected: 'Local Only (IndexedDB)',
        error: 'Connection Error (Check Keys)'
      }
    },
    auth: {
      login: 'Login with Google',
      logout: 'Logout',
      welcome: 'Welcome',
    }
  }
};
