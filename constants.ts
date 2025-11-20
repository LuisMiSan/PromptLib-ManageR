import { PromptEntry, Category, AIModel } from './types';

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