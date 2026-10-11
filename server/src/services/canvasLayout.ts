/**
 * Zonas dinámicas de cada plantilla (coordenadas relativas 0-1 medidas sobre
 * los PNG originales de server/assets/canvas).
 */

export interface CircleZone { cx: number; cy: number; r: number; }
export interface RectZone { x: number; y: number; w: number; h: number; }
export interface TextSpot { x: number; y: number; size: number; bold?: boolean; italic?: boolean; caps?: boolean; color?: string; glow?: number; maxW?: number; }

export interface TemplateLayout {
  /** Círculos de avatar, en orden de uso */
  avatars?: CircleZone[];
  /** Rectángulos que se pintan de negro para sobrescribir texto impreso */
  plates?: RectZone[];
  /** Placas con degradado suave para texto sobre arte */
  softPlates?: RectZone[];
  /** Barra de progreso: zona interior y color de fondo/lleno */
  bar?: { zone: RectZone; empty: string; fill: string };
  /** Textos dinámicos, en orden de dibujo */
  texts?: TextSpot[];
}

export const LAYOUTS: Record<string, TemplateLayout> = {
  welcome: {
    avatars: [{ cx: 0.815, cy: 0.437, r: 0.086 }],
    plates: [{ x: 0.712, y: 0.662, w: 0.212, h: 0.048 }], // texto «MIEMBRO # 001»
    softPlates: [{ x: 0.285, y: 0.535, w: 0.40, h: 0.15 }], // subtítulo → usuario y grupo
    texts: [
      { x: 0.818, y: 0.695, size: 0.026, caps: true, maxW: 0.20 }, // miembros
      { x: 0.48, y: 0.588, size: 0.040, italic: true, maxW: 0.34 }, // usuario
      { x: 0.48, y: 0.648, size: 0.026, italic: true, color: "#c9c9ce", maxW: 0.34 } // grupo
    ]
  },
  despedida: {
    avatars: [{ cx: 0.188, cy: 0.462, r: 0.086 }],
    softPlates: [{ x: 0.345, y: 0.41, w: 0.35, h: 0.245 }], // poema → usuario y grupo
    texts: [
      { x: 0.52, y: 0.50, size: 0.042, italic: true, maxW: 0.31 },
      { x: 0.52, y: 0.565, size: 0.026, italic: true, color: "#c9c9ce", maxW: 0.31 }
    ]
  },
  ship: {
    avatars: [
      { cx: 0.235, cy: 0.415, r: 0.082 },
      { cx: 0.762, cy: 0.415, r: 0.082 }
    ],
    plates: [
      { x: 0.432, y: 0.342, w: 0.146, h: 0.118 }, // «92%» del corazón
      { x: 0.140, y: 0.630, w: 0.190, h: 0.052 }, // «TU PERFIL»
      { x: 0.680, y: 0.630, w: 0.190, h: 0.052 } // «SU PERFIL»
    ],
    texts: [
      { x: 0.5, y: 0.425, size: 0.075, bold: true }, // porcentaje
      { x: 0.23, y: 0.658, size: 0.026, caps: true, maxW: 0.18 }, // nombre 1
      { x: 0.77, y: 0.658, size: 0.026, caps: true, maxW: 0.18 } // nombre 2
    ]
  },
  gay: {
    avatars: [{ cx: 0.495, cy: 0.357, r: 0.175 }],
    plates: [{ x: 0.365, y: 0.60, w: 0.275, h: 0.115 }], // «84%»
    bar: { zone: { x: 0.250, y: 0.742, w: 0.500, h: 0.030 }, empty: "#232327", fill: "#f4f4f6" },
    texts: [
      { x: 0.5, y: 0.685, size: 0.095, bold: true }, // porcentaje
      { x: 0.5, y: 0.852, size: 0.034, caps: true, glow: 8, maxW: 0.5 } // nombre
    ]
  },
  levelup: {
    avatars: [{ cx: 0.5, cy: 0.283, r: 0.068 }],
    plates: [
      { x: 0.148, y: 0.345, w: 0.155, h: 0.032 }, // «NIVEL ANTERIOR»
      { x: 0.185, y: 0.395, w: 0.08, h: 0.062 }, // «01»
      { x: 0.703, y: 0.345, w: 0.145, h: 0.032 }, // «NIVEL ACTUAL»
      { x: 0.735, y: 0.395, w: 0.08, h: 0.062 } // «02»
    ],
    softPlates: [{ x: 0.32, y: 0.67, w: 0.36, h: 0.105 }], // frase → bio
    texts: [
      { x: 0.2245, y: 0.371, size: 0.020, caps: true, color: "#d8d8dc" }, // etiqueta izq: IQ
      { x: 0.2245, y: 0.443, size: 0.048, bold: true }, // número izq: percent
      { x: 0.7755, y: 0.371, size: 0.020, caps: true, color: "#d8d8dc" }, // etiqueta der: PERFIL
      { x: 0.7755, y: 0.437, size: 0.026, bold: true, caps: true, maxW: 0.13 }, // número der: nombre
      { x: 0.5, y: 0.728, size: 0.026, italic: true, color: "#c9c9ce", maxW: 0.32 } // bio
    ]
  }
};
