export const mockData = [
  {
    id: 1,
    category: "formas",
    title: "De Primitivas a Personaje",
    image: "/anim_shapes.jpg",
    explanation: "En animación, todo personaje complejo se puede desglosar en formas primitivas en 3D (esferas, cilindros, cubos). Esto es crucial para mantener la consistencia del volumen cuando el personaje rota en el espacio. Practica dibujando cajas y esferas en diferentes ángulos antes de agregar los detalles del rostro."
  },
  {
    id: 2,
    category: "perspectiva",
    title: "Grilla de Perspectiva (2 Puntos)",
    image: "/anim_perspective.jpg",
    explanation: "El paisajismo y los fondos ('backgrounds' o 'layouts') en animación dependen fuertemente de la perspectiva. Esta imagen muestra cómo se usa una perspectiva de dos puntos de fuga para crear una ciudad o escenario interior. Entender dónde ubicar la línea del horizonte dicta si la 'cámara' está a nivel del suelo, en picado o contrapicado."
  },
  {
    id: 3,
    category: "personajes",
    title: "Model Sheet de Personaje",
    image: "/anim_character.jpg",
    explanation: "Para crear diseños de personajes útiles en animación, se utilizan 'Model Sheets'. Estas hojas de modelo muestran al personaje de frente, perfil, 3/4 y de espaldas, asegurando que cualquier animador del equipo dibuje las proporciones exactamente igual. Nota cómo el diseño se mantiene simple y con formas claras (Shape Language) para facilitar el movimiento continuo."
  }
];

export const categories = [
  { id: "all", name: "Todo" },
  { id: "formas", name: "Formas y Volúmenes" },
  { id: "personajes", name: "Diseño de Personajes" },
  { id: "perspectiva", name: "Perspectiva y Ambientes" }
];
