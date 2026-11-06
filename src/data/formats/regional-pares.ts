/**
 * Curated data · Pares de regionalismos para la Memoria del Puerto.
 * Dos palabras que nombran lo mismo en países distintos.
 */

export interface RegionalPar {
  a: string;
  b: string;
  note: string;
}

export const REGIONAL_PARES: RegionalPar[] = [
  { a: "plátano", b: "banana", note: "España y el Cono Sur; en México, en medio, dicen banano." },
  { a: "palta", b: "aguacate", note: "Chile, Perú y Argentina frente a México y España." },
  { a: "autobús", b: "colectivo", note: "España dice autobús; Argentina, colectivo; México, camión." },
  { a: "coche", b: "carro", note: "España con coche; gran parte de América con carro." },
  { a: "piscina", b: "pileta", note: "La pileta argentina y la piscina española comparten cloro." },
  { a: "ordenador", b: "computadora", note: "España ordena; América computa. La máquina, igual de lenta." },
  { a: "judía", b: "frijol", note: "Alubia y judía en España; frijol en México y Centroamérica." },
  { a: "maíz", b: "elote", note: "El elote mexicano es la mazorca; el maíz es el grano." },
  { a: "jersey", b: "chompa", note: "El jersey español; la chompa peruana; el pullman chileno es otra cosa." },
  { a: "chamarra", b: "chaqueta", note: "México abriga con chamarra; España con chaqueta." },
  { a: "refresco", b: "gaseosa", note: "México refresca; el Cono Sur burbujea en gaseosa." },
  { a: "lindo", b: "bonito", note: "Lindo suena a Argentina y a cariño; bonito va con todo." },
  { a: "vosotros", b: "ustedes", note: "España pluraliza en pareja; América lo resuelve todo con ustedes." },
  { a: "vos", b: "tú", note: "El voseo rioplatense y el tú peninsular se entienden de maravilla." },
  { a: "guagua", b: "bebé", note: "Canarias y el Caribe traen guagua; el resto del mapa, bebé." },
  { a: "camión", b: "camioneta", note: "En México el camión es urbano; la camioneta, ranchera." },
  { a: "boquerón", b: "anchoa", note: "Mediterráneo con boquerón fresco; Italia con anchoa en salazón." },
  { a: "papa", b: "patata", note: "América dice papa, la palabra quechua original." },
  { a: "ananá", b: "piña", note: "El guaraní ananá del Cono Sur; la piña española, de la fruta del pino." },
  { a: "frutilla", b: "fresa", note: "La frutilla rioplatense y la fresa española son la misma rosa roja." },
  { a: "durazno", b: "melocotón", note: "Durazno en América; melocotón en España; ambos con pelo." },
  { a: "grifo", b: "llave", note: "El grifo español abre la llave americana del agua." },
  { a: "departamento", b: "piso", note: "Argentina y México viven en departamento; España, en piso." },
  { a: "zumo", b: "jugo", note: "España exprime zumo; América bebe jugo de la misma naranja." },
];
