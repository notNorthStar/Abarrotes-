// Obras de la galería del login: SVG originales en public/arte. El humor es intencional.

// `acento`: color de la pintura para el formulario; debe dar 3:1 sobre blanco (hay prueba).
export type Obra = { archivo: string; titulo: string; tecnica: string; estilo: string; acento: string; cedula: string }

export const OBRAS: Obra[] = [
  {
    archivo: 'lata-de-chiles-suprematista.svg',
    titulo: 'Lata de chiles en suspensión (rajas descendentes)',
    tecnica: 'Óleo y salmuera sobre lámina de hojalata',
    estilo: 'Suprematismo',
    acento: '#2E7D4F',
    cedula: 'La artista libera al chile de su envase y al espectador de toda esperanza de botana.',
  },
  {
    archivo: 'bolillo-cubista.svg',
    titulo: 'Bolillo visto desde todos sus ángulos a la vez',
    tecnica: 'Óleo y migajón sobre papel de estraza',
    estilo: 'Cubismo analítico',
    acento: '#9A5B13',
    cedula: 'Fragmenta la corteza para interrogar al migajón: ¿pan para el susto o susto para el pan?',
  },
  {
    archivo: 'refresco-color-field.svg',
    titulo: 'Sin título (refresco de cola al tiempo)',
    tecnica: 'Jarabe y gas carbónico sobre lienzo sin imprimar',
    estilo: 'Color field',
    acento: '#7A2E1A',
    cedula: 'Dos campos de color contemplan su propia tibieza. La espuma, como toda ilusión, no dura.',
  },
  {
    archivo: 'jitomate-gestual.svg',
    titulo: 'Jitomate saladet n.º 5 (el que quedó al fondo de la caja)',
    tecnica: 'Puré y acrílico sobre huacal desarmado',
    estilo: 'Expresionismo gestual',
    acento: '#B9382A',
    cedula: 'El gesto furioso denuncia el precio por kilo; lo que escurre es, técnicamente, merma.',
  },
  {
    archivo: 'huevo-op-art.svg',
    titulo: 'Kilo de huevo: vibración de 18 piezas (a veces 17)',
    tecnica: 'Clara, yema y esmalte sobre cartón de huevo',
    estilo: 'Op art',
    acento: '#B5760F',
    cedula: 'La retina oscila entre la clara y la yema, igual que el precio entre lunes y viernes.',
  },
  {
    archivo: 'bascula-constructivista.svg',
    titulo: 'La báscula no miente (el pulgar sí)',
    tecnica: 'Gouache y notas de remisión sobre cartón',
    estilo: 'Constructivismo',
    acento: '#A82E24',
    cedula: 'Diagonales al servicio del pueblo; el fiel de la balanza, al servicio de quien despacha.',
  },
  {
    archivo: 'fiado-neoplasticista.svg',
    titulo: 'Composición en rojo, maíz y azul con cuenta pendiente',
    tecnica: 'Esmalte y bolígrafo sobre libreta de pasta dura',
    estilo: 'Neoplasticismo',
    acento: '#284A73',
    cedula: 'La retícula ordena el universo; la celda roja recuerda que doña Lupita debe tres semanas.',
  },
  {
    archivo: 'escoba-sumi-e.svg',
    titulo: 'Escoba recargada, hora del cierre',
    tecnica: 'Tinta y polvo de banqueta sobre papel de estraza',
    estilo: 'Sumi-e',
    acento: '#6B4A22',
    cedula: 'Un solo trazo, sin corregir: el barrido de las 9 p. m. tampoco admite segunda pasada.',
  },
]
