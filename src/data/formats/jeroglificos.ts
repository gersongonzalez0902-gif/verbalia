import type { JeroglificosExercise } from "@/types";

/**
 * Pack · Jeroglíficos Modernos (Biblioteca Infinita) · Etapa 2 completa
 * ----------------------------------------------------------------
 * 40 mensajes cifrados tal como circulan de verdad en chats,
 * redes y carteleras: emojis que sustituyen palabras, cifras
 * homófonas (2, 100, x) y abreviaturas de la lengua viva.
 * Descifrar es leer con el ojo de hoy.
 */

/* [cifrado, correcta, distractor1, distractor2, dificultad] */
const ROWS: [string, string, string, string, number][] = [
  // ---- d1 · emojis literales ----
  ["🐱🌙💤", "El gato duerme cuando hay luna.", "El gato ladra a la luna despierto.", "La luna persigue gatos dormidos.", 1],
  ["☕+🥐 8️⃣am", "Café con croissant a las ocho.", "El croissant se toma el café a las ocho.", "Ocho cafés con croissant a la una.", 1],
  ["🌊☀️🏖️", "Mar con sol en la playa.", "El sol se ahoga en la playa.", "Playa sin mar bajo la sombrilla.", 1],
  ["🚲💨🛒", "Voy rápido en bici al mercado.", "La bici lleva la compra andando.", "El mercado persigue bicis deprisa.", 1],
  ["📖🦉💡", "El búho lee con una idea.", "El libro enseña búhos brillantes.", "La idea lee búhos escritos.", 1],
  ["🌧️☔...", "Llueve y llueve sin parar.", "El paraguas hace lluvia eterna.", "Llueven paraguas sin paracaídas.", 1],
  ["🐟🍞🧂", "Pescado con pan y sal.", "El pan pesca sal con limón.", "La sal come pan frito con pez.", 1],
  ["🧭🗺️🧳", "Brújula, mapa y maleta: viaje.", "La maleta dibuja mapas con brújula.", "El mapa viaja sin maleta norte.", 1],
  // ---- d2 · homófonos numéricos ----
  ["2LLO xq t kiero", "Te lo digo porque te quiero.", "Dos lejos porque tecao quiero.", "Te lo cuento dos veces querido.", 2],
  ["100pre tngo 2do pa ti", "Siempre tengo tiempo para ti.", "Cien pretextos tengo dos para ti.", "Siempre dos teñidos para cien.", 2],
  ["A2! salu2 dl 🌊", "Adiós, saludos del mar.", "Hasta dos, saludos del fideo.", "Adiós, dos sales del muelle.", 2],
  ["tb kiero ir d viaje", "También quiero ir de viaje.", "Tengo quiero ir de viaje doble.", "Te boleto quiero viaje dar.", 2],
  ["mñn t eo en el 🚢", "Mañana te veo en el barco.", "Menudo te veo en el ebrio barco.", "Mañana te odio en el navío.", 2],
  ["dnd stás? 1⚓", "¿Dónde estás? Te espero en el ancla.", "Dónde estás: una noche sin ancla.", "¿Dinero estás? Uno anclado.", 2],
  ["grx x todo, bn t lo dgo", "Gracias por todo, bien te lo digo.", "Grados por todo, bien te lo dieron.", "Gracias por todo: ben te lo dije.", 2],
  ["sí? o n0 kieres", "¿Sí? O no quieres.", "Cero quieres dieciséis.", "Si no, kieres cero.", 2],
  // ---- d3 · abreviaturas y quirk ----
  ["q tl? t djo 1 sorpresa", "¿Qué tal? Te dejo una sorpresa.", "Qué tal te dejo una operación.", "¿Queso tal? Te dejo una sorpresa.", 3],
  ["1mom, ya t cnto q pas0", "Un momento, ya te cuento qué pasó.", "Un minuto, ya te canto para qué caso.", "Uno maso: ya te condiciono el pazo.", 3],
  ["xfa nlaza el 🚤", "Por favor, amarra la lancha.", "Por fa, enlaza el bocho.", "Por la favor, lanza la cleta.", 3],
  ["msj d 📮: t spro a ls 7", "Mensaje del buzón: te espero a las siete.", "Mensaje del búho: te espero a las seis.", "Masaje del buzone: te espero las sietes.", 3],
  ["dpoz t lgo, voy al 🛒", "Después te leo, voy al mercado.", "Deporte te logo: voy al océano.", "De paso te lavo, voy al mono.", 3],
  ["bs! n t olvides d nsotr0s", "Besos, no te olvides de nosotros.", "Vas: no te ovides del norte.", "Base: no te divides de nosotros.", 3],
  ["wsp? dm tu 📍", "¿WhatsApp? Dame tu ubicación.", "¿Guasap? De mi tu zenaida.", "¿Uasap? Deben tu cero.", 3],
  ["toy cn l 🦉, n mola", "Estoy con el búho, me mola.", "Tengo con el búho, no me mola nada.", "Toy con el búho: en molar.", 3],
  // ---- d4 · mezcla con ironía ----
  ["cn mi 🧠+☕ ya sta l dia", "Con mi cabeza y café, ya está el día.", "Con mi cerebro más café ya estate.", "Con mi baño y café el día ya.", 4],
  ["q ✨! n l salí 1 🐙 dl 🎒", "¡Qué pasada! En la sala salió un pulpo del bolso.", "¡Qué chispa! No, el salmón, un pulpo del saco.", "¡Qué estrella! Nunca salí de un pulpo azul.", 4],
  ["stá t0do bn? dme sñl d vida", "¿Está todo bien? Dame señal de vida.", "Está todo bendecido: deme señal de vida.", "¿Está tenue? Dame señal de vista.", 4],
  ["flte 1 🎟️ xa l cncierto", "Falta una entrada para el concierto.", "Falto un calendario por el concierto.", "Faute una tarifa hacia el cantero.", 4],
  ["el 🌊 stá pa t0mar 📷s", "El mar está para tomar fotos.", "El mar está para tomar brasas.", "El óleo está para tomar fadas.", 4],
  ["n c ntrstó… m salí cn 🎣", "No se encontró…, me salí con caña.", "En cine entraron: me salí con cebolla.", "Noche encontrada: me salió con caña.", 4],
  // ---- d5 · jeroglíficos dobles y seseo de chat ----
  ["1 bso = 1000 🌊 d krio", "Un beso igual a mil mares de cariño.", "Un beso escupe mil millas de cario", "Uno besa cien océanos de criterio.", 5],
  ["t qro + q l 🌞 a ls 🌊s", "Te quiero más que el sol a las olas.", "Te quiero más que el sol del asombro.", "Te caigo más que el sol entre olas.", 5],
  ["sñr 🦅 dl 🌊: dl2 a casa", "Señor águila del mar: del dos a casa.", "Señor agujero: del delta a la casa.", "Señor mago del mar: del sol a la cascada.", 5],
  ["cn 🐚s y 🌊s s scribe 1 pema", "Con conchas y olas se escribe un poema.", "Con conchas y olas sesescribe una demora.", "Conchas y olas suscriben un problema.", 5],
  ["l 📚 100pres tiene la rspsta", "La biblioteca siempre tiene la respuesta.", "El libro cien press tiene la restada.", "La libreta siempre tiene la respeta.", 5],
  ["plnta 🌱 tus duds xa rglarlas", "Planta tus dudas para regarlas.", "Plancha tus dudas para regalarlas.", "Planta tus dudas para apegarlas.", 5],
  ["🦆s n l 🏞️: sñl d q l plnas stá viva", "Patos en el paisaje: señal de que la playa está viva.", "Patios en el paje: señal de plasma estabilizada.", "Patos en el pasaje: señal de peleas vividas.", 5],
  ["el 🧭 no s prsta, s nsña", "La brújula no se presta, se enseña.", "El brújula no se pierde, se piensa.", "El cóndor no se presta, se enseña.", 5],
  // ---- d5 · poema de cierre ----
  ["quien tl? bn, spro; tu ksmo stás?", "¿Qué tal? Bien, espero; ¿tú cómo estás?", "Quien tal: bien espero tu como está.", "Quién tal bien: espero tu cosmos está.", 5],
];

function cefrOf(d: number): JeroglificosExercise["cefr"] {
  return d <= 1 ? "A2" : d === 2 ? "B1" : d === 3 ? "B1" : d === 4 ? "B2" : "C1";
}

export const JEROGLIFICOS_PACK: JeroglificosExercise[] = ROWS.map(
  ([cipher, correct, wrong1, wrong2, d], i) => ({
    id: `jg-${String(i + 1).padStart(2, "0")}`,
    type: "jeroglificos" as const,
    skill: "lectura" as const,
    difficulty: d as JeroglificosExercise["difficulty"],
    cefr: cefrOf(d),
    prompt: "Descifra el mensaje",
    explanation:
      "El chat escribe como suena y como cabe: emojis por palabras, cifras por sonidos y abreviaturas por prisa. Leerlo es traducir la lengua viva.",
    tags: ["jeroglíficos", "chat", "lectura"],
    cipher,
    options: [correct, wrong1, wrong2],
    answerIndex: 0,
  }),
);
