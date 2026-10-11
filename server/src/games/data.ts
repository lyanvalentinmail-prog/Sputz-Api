/** Banco de datos local para trivia, quiz, acertijos, ahorcado y wordle. */

export interface TriviaQuestion {
  category: "ciencia" | "historia" | "geografia" | "tecnologia" | "cine" | "deportes";
  difficulty: "facil" | "medio" | "dificil";
  question: string;
  options: string[];
  answer: string;
}

export const TRIVIA: TriviaQuestion[] = [
  { category: "ciencia", difficulty: "facil", question: "¿Cuál es el símbolo químico del oro?", options: ["Au", "Ag", "Fe", "Or"], answer: "Au" },
  { category: "ciencia", difficulty: "facil", question: "¿Qué gas respiramos principalmente para vivir?", options: ["Oxígeno", "Nitrógeno", "Dióxido de carbono", "Helio"], answer: "Oxígeno" },
  { category: "ciencia", difficulty: "medio", question: "¿Cuántos huesos tiene el cuerpo humano adulto?", options: ["206", "195", "220", "180"], answer: "206" },
  { category: "ciencia", difficulty: "medio", question: "¿Qué planeta es conocido como el planeta rojo?", options: ["Marte", "Venus", "Júpiter", "Mercurio"], answer: "Marte" },
  { category: "ciencia", difficulty: "dificil", question: "¿Cuál es la velocidad aproximada de la luz en el vacío?", options: ["300.000 km/s", "150.000 km/s", "1.000.000 km/s", "30.000 km/s"], answer: "300.000 km/s" },
  { category: "ciencia", difficulty: "dificil", question: "¿Qué partícula tiene carga negativa en el átomo?", options: ["El electrón", "El protón", "El neutrón", "El quark"], answer: "El electrón" },
  { category: "ciencia", difficulty: "facil", question: "¿Cuál es el órgano más grande del cuerpo humano?", options: ["La piel", "El hígado", "El pulmón", "El intestino"], answer: "La piel" },
  { category: "ciencia", difficulty: "medio", question: "¿Qué científico propuso la teoría de la relatividad?", options: ["Albert Einstein", "Isaac Newton", "Nikola Tesla", "Galileo Galilei"], answer: "Albert Einstein" },
  { category: "historia", difficulty: "facil", question: "¿En qué año llegó Colón a América?", options: ["1492", "1512", "1453", "1500"], answer: "1492" },
  { category: "historia", difficulty: "medio", question: "¿Qué civilización construyó Machu Picchu?", options: ["Los incas", "Los mayas", "Los aztecas", "Los olmecas"], answer: "Los incas" },
  { category: "historia", difficulty: "medio", question: "¿En qué año terminó la Segunda Guerra Mundial?", options: ["1945", "1939", "1948", "1950"], answer: "1945" },
  { category: "historia", difficulty: "dificil", question: "¿Quién fue el primer emperador de Roma?", options: ["Augusto", "Julio César", "Nerón", "Calígula"], answer: "Augusto" },
  { category: "historia", difficulty: "facil", question: "¿Qué país regaló la Estatua de la Libertad a Estados Unidos?", options: ["Francia", "España", "Inglaterra", "Italia"], answer: "Francia" },
  { category: "historia", difficulty: "dificil", question: "¿En qué año cayó el Imperio romano de Occidente?", options: ["476", "395", "527", "410"], answer: "476" },
  { category: "historia", difficulty: "medio", question: "¿Qué revolución comenzó en 1789?", options: ["La Revolución francesa", "La Revolución industrial", "La Revolución rusa", "La Revolución americana"], answer: "La Revolución francesa" },
  { category: "geografia", difficulty: "facil", question: "¿Cuál es el río más largo del mundo?", options: ["El Amazonas", "El Nilo", "El Misisipi", "El Yangtsé"], answer: "El Amazonas" },
  { category: "geografia", difficulty: "facil", question: "¿Cuál es la capital de Japón?", options: ["Tokio", "Kioto", "Osaka", "Pekín"], answer: "Tokio" },
  { category: "geografia", difficulty: "medio", question: "¿Qué país tiene forma de bota?", options: ["Italia", "Grecia", "Portugal", "Croacia"], answer: "Italia" },
  { category: "geografia", difficulty: "medio", question: "¿Cuál es el desierto más grande del mundo?", options: ["La Antártida", "El Sahara", "Gobi", "Atacama"], answer: "La Antártida" },
  { category: "geografia", difficulty: "dificil", question: "¿Cuál es la montaña más alta de África?", options: ["Kilimanjaro", "Monte Kenia", "Ras Dashen", "Atlas"], answer: "Kilimanjaro" },
  { category: "geografia", difficulty: "facil", question: "¿En qué continente está Egipto?", options: ["África", "Asia", "Europa", "Oceanía"], answer: "África" },
  { category: "geografia", difficulty: "medio", question: "¿Cuál es el océano más grande?", options: ["El Pacífico", "El Atlántico", "El Índico", "El Ártico"], answer: "El Pacífico" },
  { category: "geografia", difficulty: "dificil", question: "¿Qué país tiene más husos horarios?", options: ["Francia", "Rusia", "Estados Unidos", "China"], answer: "Francia" },
  { category: "tecnologia", difficulty: "facil", question: "¿Qué lenguaje se usa para dar estilo a páginas web?", options: ["CSS", "HTML", "SQL", "Python"], answer: "CSS" },
  { category: "tecnologia", difficulty: "medio", question: "¿Quién fundó Microsoft junto a Paul Allen?", options: ["Bill Gates", "Steve Jobs", "Mark Zuckerberg", "Larry Page"], answer: "Bill Gates" },
  { category: "tecnologia", difficulty: "medio", question: "¿Qué significa HTTP?", options: ["HyperText Transfer Protocol", "High Transfer Text Protocol", "Hyperlink Text Type Protocol", "Home Tool Transfer Protocol"], answer: "HyperText Transfer Protocol" },
  { category: "tecnologia", difficulty: "dificil", question: "¿En qué año se lanzó el primer iPhone?", options: ["2007", "2005", "2009", "2010"], answer: "2007" },
  { category: "tecnologia", difficulty: "facil", question: "¿Qué empresa desarrolló el sistema operativo Android?", options: ["Google", "Apple", "Microsoft", "Samsung"], answer: "Google" },
  { category: "tecnologia", difficulty: "medio", question: "¿Qué estructura de datos usa pares clave-valor?", options: ["Un objeto/diccionario", "Un array", "Una pila", "Una cola"], answer: "Un objeto/diccionario" },
  { category: "tecnologia", difficulty: "dificil", question: "¿Qué lenguaje creó Guido van Rossum?", options: ["Python", "Java", "Ruby", "Perl"], answer: "Python" },
  { category: "cine", difficulty: "facil", question: "¿Quién dirige la película «El padrino»?", options: ["Francis Ford Coppola", "Steven Spielberg", "Martin Scorsese", "Quentin Tarantino"], answer: "Francis Ford Coppola" },
  { category: "cine", difficulty: "medio", question: "¿Qué película ganó el Óscar a mejor película en 2020?", options: ["Parásitos", "1917", "Joker", "Érase una vez en Hollywood"], answer: "Parásitos" },
  { category: "cine", difficulty: "facil", question: "¿Cómo se llama el mago protagonista de Hogwarts?", options: ["Harry Potter", "Gandalf", "Merlín", "Frodo"], answer: "Harry Potter" },
  { category: "cine", difficulty: "medio", question: "¿Qué actor interpreta a Jack Sparrow?", options: ["Johnny Depp", "Brad Pitt", "Tom Cruise", "Orlando Bloom"], answer: "Johnny Depp" },
  { category: "cine", difficulty: "dificil", question: "¿Quién dirigió «El laberinto del fauno»?", options: ["Guillermo del Toro", "Alfonso Cuarón", "Alejandro Iñárritu", "Pedro Almodóvar"], answer: "Guillermo del Toro" },
  { category: "cine", difficulty: "facil", question: "¿Qué estudio creó a Woody y Buzz Lightyear?", options: ["Pixar", "DreamWorks", "Disney Animation", "Illumination"], answer: "Pixar" },
  { category: "deportes", difficulty: "facil", question: "¿Cuántos jugadores tiene un equipo de fútbol en el campo?", options: ["11", "9", "10", "12"], answer: "11" },
  { category: "deportes", difficulty: "medio", question: "¿Cada cuántos años se celebran los Juegos Olímpicos de verano?", options: ["Cada 4 años", "Cada 2 años", "Cada 5 años", "Cada 3 años"], answer: "Cada 4 años" },
  { category: "deportes", difficulty: "medio", question: "¿En qué deporte destaca Rafael Nadal?", options: ["Tenis", "Baloncesto", "Golf", "Natación"], answer: "Tenis" },
  { category: "deportes", difficulty: "dificil", question: "¿Qué país ha ganado más mundiales de fútbol masculino?", options: ["Brasil", "Alemania", "Italia", "Argentina"], answer: "Brasil" },
  { category: "deportes", difficulty: "facil", question: "¿Cómo se llama la liga profesional de baloncesto de EE. UU.?", options: ["NBA", "NFL", "MLB", "NHL"], answer: "NBA" },
  { category: "deportes", difficulty: "dificil", question: "¿Cuánto dura un partido de balonmano?", options: ["60 minutos", "40 minutos", "90 minutos", "48 minutos"], answer: "60 minutos" },
  { category: "historia", difficulty: "facil", question: "¿Qué muro cayó en Berlín en 1989?", options: ["El Muro de Berlín", "La Muralla China", "El Muro de Adriano", "El Muro de las Lamentaciones"], answer: "El Muro de Berlín" },
  { category: "ciencia", difficulty: "facil", question: "¿Cuántos planetas tiene el sistema solar?", options: ["8", "9", "7", "10"], answer: "8" },
  { category: "tecnologia", difficulty: "facil", question: "¿Qué significan las siglas «URL»?", options: ["Uniform Resource Locator", "Universal Reference Link", "Unique Route Location", "User Resource Line"], answer: "Uniform Resource Locator" },
  { category: "geografia", difficulty: "facil", question: "¿Cuál es la capital de España?", options: ["Madrid", "Barcelona", "Sevilla", "Valencia"], answer: "Madrid" },
  { category: "cine", difficulty: "medio", question: "¿Cómo se llama el barco que se hunde en la película «Titanic»?", options: ["Titanic", "Queen Mary", "Lusitania", "Britannic"], answer: "Titanic" },
  { category: "deportes", difficulty: "medio", question: "¿Qué selección ganó el mundial de fútbol de Sudáfrica 2010?", options: ["España", "Países Bajos", "Alemania", "Uruguay"], answer: "España" }
];

export interface Riddle { riddle: string; answer: string; }

export const RIDDLES: Riddle[] = [
  { riddle: "Cuanto más le quitas, más grande se hace. ¿Qué es?", answer: "Un agujero" },
  { riddle: "Tengo ciudades pero no casas, montañas pero no árboles y agua pero no peces. ¿Qué soy?", answer: "Un mapa" },
  { riddle: "Cuanto más hay de mí, menos ves. ¿Qué soy?", answer: "La oscuridad" },
  { riddle: "Siempre vengo pero nunca llego. ¿Qué soy?", answer: "El mañana" },
  { riddle: "Tiene dientes pero no puede morder. ¿Qué es?", answer: "Un peine" },
  { riddle: "Cuanto más seca, más moja. ¿Qué es?", answer: "Una toalla" },
  { riddle: "Sube pero nunca baja. ¿Qué es?", answer: "La edad" },
  { riddle: "Tengo llaves pero no abro puertas. ¿Qué soy?", answer: "Un piano" },
  { riddle: "Es tuyo pero los demás lo usan más que tú. ¿Qué es?", answer: "Tu nombre" },
  { riddle: "Cuanto más grande, menos se ve. ¿Qué es?", answer: "La sombra al mediodía" },
  { riddle: "Nace en el río y muere en el mar. ¿Qué es?", answer: "El agua dulce" },
  { riddle: "Vuela sin alas, silba sin boca, golpea sin manos. ¿Qué es?", answer: "El viento" },
  { riddle: "Tiene ojos y no ve, tiene agua y no es pez. ¿Qué es?", answer: "Una patata" },
  { riddle: "En medio del mar estoy, sin ser isla ni pez. ¿Qué letra soy?", answer: "La letra A" },
  { riddle: "Blanca por dentro, verde por fuera, si quieres que te lo diga, espera. ¿Qué es?", answer: "La pera" },
  { riddle: "Dos madres y dos hijas, cada una con un sombrero, y solo hay tres sombreros. ¿Cómo es posible?", answer: "Son abuela, madre e hija" },
  { riddle: "Si me nombras, desaparezco. ¿Qué soy?", answer: "El silencio" },
  { riddle: "Corre pero nunca camina, tiene boca pero nunca habla. ¿Qué es?", answer: "Un río" },
  { riddle: "Se rompe cada vez que se pronuncia. ¿Qué es?", answer: "Una promesa" },
  { riddle: "Mientras más lo compartes, más lo tienes. ¿Qué es?", answer: "El conocimiento" }
];

/** Palabras para el ahorcado (sin acentos para simplificar). */
export const HANGMAN_WORDS = [
  "murcielago", "ordenador", "biblioteca", "televisión", "aventura", "montaña", "guitarra",
  "universo", "elefante", "chocolate", "primavera", "submarino", "laberinto", "mariposa",
  "volcanes", "estrella", "ventana", "pelicula", "telefono", "bicicleta", "hospital",
  "zanahoria", "dinosaurio", "programador", "teclado", "paraguas", "escalera", "refresco",
  "canguro", "brujula", "farola", "gaviota", "invierno", "jardin", "llave", "maleta",
  "naranja", "oceanos", "pastel", "quimica", "reloj", "sabado", "tesoro", "velero",
  "zorro", "abeja", "bosque", "castillo", "delfin", "espejo", "faro", "hoja"
];

/** Palabras ocultas para wordle (5 letras, español, sin acentos). */
export const WORDLE_SOLUTIONS = [
  "gatos", "perro", "casas", "libro", "playa", "campo", "fuego", "verde", "noche", "lunar",
  "marzo", "pluma", "lapiz", "mesas", "silla", "techo", "pared", "banco", "bolsa", "carta",
  "clave", "danza", "duque", "firma", "globo", "hueso", "islas", "joven", "leche", "madre",
  "nieve", "padre", "queso", "ramos", "sabio", "tigre", "virus", "zonas", "ritmo", "signo",
  "torre", "barco", "cable", "cinta", "dulce", "feliz", "norte", "surco", "llave", "raton",
  "cisne", "burro", "casco", "mosca", "pulpo", "fresa", "melon", "copas", "dardo", "funda",
  "gafas", "hielo", "jaula", "loros", "mango", "nubes", "ruido", "rueda", "tarta"
];

/** Palabras admitidas como intento (soluciones + lista común). */
export const WORDLE_ALLOWED = new Set([
  "abeja", "abrir", "acero", "actor", "aguas", "aguja", "aires", "almas", "amiga", "andar",
  "arana", "arbol", "arena", "baila", "bambu", "banco", "banda", "barba", "barco", "barro",
  "besos", "bolsa", "boton", "brasa", "burro", "cable", "cabra", "cajon", "calle", "calor",
  "campo", "canto", "carne", "carta", "casas", "casco", "cerdo", "cesta", "cielo", "cinco",
  "cinta", "cisne", "clave", "clavo", "cobra", "coger", "comer", "copas", "coral", "corre",
  "corte", "costa", "crear", "cruce", "cueva", "cupon", "danza", "dardo", "dedos", "dejar",
  "dolor", "donde", "dueno", "dulce", "duque", "echar", "falso", "farsa", "feliz", "feria",
  "fibra", "final", "firma", "flaco", "fondo", "fresa", "fuego", "funda", "gafas", "ganar",
  "gasto", "gatos", "girar", "globo", "golpe", "gorda", "grano", "grito", "guapo", "herir",
  "hielo", "hongo", "hotel", "hueso", "igual", "islas", "jarra", "jaula", "jefes", "joven",
  "jugar", "jugos", "junco", "lagos", "lanas", "lanza", "lapiz", "largo", "latas", "leche",
  "lente", "libre", "libro", "limon", "linea", "llave", "lobos", "loros", "lucha", "lunar",
  "lunas", "lupas", "madre", "mando", "manga", "mango", "marca", "marco", "marzo", "matar",
  "mayor", "media", "mejor", "melon", "menor", "mente", "mesas", "metal", "meter", "micro",
  "mismo", "mitad", "mosca", "motor", "mover", "mujer", "multa", "nacer", "nariz", "naves",
  "negro", "nieto", "nieve", "ninos", "noble", "noche", "norte", "novio", "nubes", "nuera",
  "oeste", "oidos", "opera", "orden", "oreja", "oveja", "padre", "pagar", "palma", "panal",
  "papel", "pared", "paros", "pasta", "patas", "patio", "pausa", "peine", "pelos", "penas",
  "perla", "perro", "piano", "picos", "pilar", "pinar", "pinta", "pisos", "placa", "plano",
  "plata", "plato", "playa", "pluma", "pobre", "poder", "pollo", "polvo", "poner", "presa",
  "primo", "pulpo", "punto", "queso", "radio", "ramas", "ramos", "rango", "raton", "ratos",
  "rayos", "reina", "reloj", "retos", "ritmo", "rueda", "ruido", "sabio", "sabor", "sacar",
  "salas", "salir", "salta", "salud", "santo", "sapos", "secos", "selva", "senal", "serie",
  "serio", "setas", "signo", "silla", "sitio", "sobre", "solar", "sonar", "sopas", "suave",
  "subir", "sumas", "surco", "tacos", "tallo", "tarta", "tazas", "techo", "temas", "temor",
  "tener", "terco", "texto", "tibio", "tieso", "tigre", "tocar", "todos", "tomar", "toros",
  "torre", "traer", "tramo", "trapo", "trece", "tribu", "trigo", "trono", "tubos", "turco",
  "unido", "vacio", "valle", "vapor", "vario", "vasos", "veces", "velas", "venir", "verde",
  "verso", "viaje", "vidas", "viejo", "vigor", "vinos", "virus", "vista", "volar", "yates",
  "yerno", "zonas", "zorro"
]);

/** Cartas del juego de memoria. */
export const MEMORY_SYMBOLS = ["🍎", "🍋", "🍇", "🍒", "🥝", "🍉", "🍍", "🥑"];
