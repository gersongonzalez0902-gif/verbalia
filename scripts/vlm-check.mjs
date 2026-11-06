import * as ZAI from "z-ai-web-dev-sdk";
import fs from "node:fs";

const mod = ZAI.default ?? ZAI;
const zai = await mod.create();
for (const shot of process.argv.slice(2)) {
  const b64 = fs.readFileSync(shot).toString("base64");
  const res = await zai.chat.completions.createVision({
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: "Describe brevemente en español: ¿qué pantalla de app es y se ve correcta o con errores visuales (solapes, texto cortado, botones fuera de sitio)? Máximo 40 palabras." },
          { type: "image_url", image_url: { url: `data:image/png;base64,${b64}` } },
        ],
      },
    ],
  });
  console.log(`== ${shot.split("/").pop()} ==`);
  console.log(res.choices[0]?.message?.content ?? "(sin respuesta)");
}
