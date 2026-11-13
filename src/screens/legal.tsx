"use client";

/**
 * Privacidad y cookies · Políticas legales de VERBALIA.
 * La app es 100 % local: no hay cuentas, ni servidores, ni rastreadores.
 * Aquí se explica en lenguaje claro qué se guarda, dónde y cómo borrarse.
 */

import { ScreenHeader } from "@/components/game/app-shell";
import { sfx } from "@/services/audio";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useUiStore } from "@/store/ui-store";
import { useGameStore } from "@/store/game-store";
import { Cookie, HardDrive, Lock, ShieldCheck, Trash2, UserCheck } from "lucide-react";

export function LegalScreen() {
  const navigate = useUiStore((s) => s.navigate);
  const resetAll = useGameStore((s) => s.resetAll);

  return (
    <div>
      <ScreenHeader title="Privacidad y cookies" subtitle="Políticas en lenguaje claro" backTo={{ name: "settings" }} />

      <main className="mx-auto w-full max-w-2xl px-4 pb-28 pt-4">
        {/* Resumen de un vistazo */}
        <section className="card-aurora rounded-3xl border bg-card p-4" aria-label="Resumen">
          <div className="flex items-start gap-3.5">
            <span className="gloss flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-white" style={{ background: "linear-gradient(150deg, color-mix(in oklch, var(--primary) 76%, white 18%), var(--primary))" }} aria-hidden>
              <ShieldCheck className="h-6 w-6" />
            </span>
            <div>
              <h2 className="type-h2 leading-tight">Lo importante, en tres líneas</h2>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                VerbalIA funciona por completo en tu dispositivo. No pedimos cuentas ni correo, no enviamos datos a
                ningún servidor y no usamos publicidad ni rastreadores. Tu progreso se guarda solo en este aparato.
              </p>
            </div>
          </div>
        </section>

        <Tabs defaultValue="privacidad" className="mt-4" onValueChange={() => sfx.tap()}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="privacidad" className="font-bold">
              <Lock className="mr-1.5 h-4 w-4" aria-hidden /> Privacidad
            </TabsTrigger>
            <TabsTrigger value="cookies" className="font-bold">
              <Cookie className="mr-1.5 h-4 w-4" aria-hidden /> Cookies
            </TabsTrigger>
          </TabsList>

          {/* ===== Política de privacidad ===== */}
          <TabsContent value="privacidad" className="mt-4 space-y-4">
            <LegalBlock icon={<UserCheck className="h-4 w-4" aria-hidden />} title="1. Qué datos guardamos">
              <p>Solo los necesarios para que tu aventura continúe donde la dejaste:</p>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li><strong>Perfil:</strong> nombre, foto (opcional), biografía y preferencias de juego.</li>
                <li><strong>Progreso:</strong> XP, nivel, palabras aprendidas, misiones, logros y récords.</li>
                <li><strong>Ajustes:</strong> tema, volúmenes y opciones de accesibilidad.</li>
              </ul>
              <p className="mt-2">Ningún dato personal sensible: jamás te pedimos correo, teléfono ni dirección.</p>
            </LegalBlock>

            <LegalBlock icon={<HardDrive className="h-4 w-4" aria-hidden />} title="2. Dónde se guarda">
              <p>
                Todo vive en el almacenamiento interno de tu navegador, en este dispositivo. No subimos nada a la nube,
                no hay bases de datos externas y nadie más puede leer tu progreso. Si usas la copia de seguridad
                exportada, ese archivo lo controlas tú: guárdalo donde quieras.
              </p>
            </LegalBlock>

            <LegalBlock icon={<ShieldCheck className="h-4 w-4" aria-hidden />} title="3. Quién puede verlo">
              <p>
                Solo tú. La aplicación no incluye analítica, publicidad ni rastreadores de terceros, y no comparte
                información con nadie. Si algún día se añadiera una función en línea, esta política se actualizaría
                antes, pidiendo tu consentimiento expreso.
              </p>
            </LegalBlock>

            <LegalBlock icon={<Trash2 className="h-4 w-4" aria-hidden />} title="4. Tus derechos (y cómo ejercerlos)">
              <p>
                Como todo es local, el control es total e inmediato: puedes exportar tu copia desde el perfil o los
                ajustes, y borrar absolutamente todo cuando quieras. El borrado es instantáneo y definitivo.
              </p>
              <Button
                variant="destructive"
                className="mt-3 font-bold"
                onClick={async () => {
                  sfx.wrong(true);
                  await resetAll();
                  navigate({ name: "welcome" });
                }}
              >
                <Trash2 className="mr-2 h-4 w-4" aria-hidden /> Borrar todos mis datos ahora
              </Button>
            </LegalBlock>

            <LegalBlock icon={<UserCheck className="h-4 w-4" aria-hidden />} title="5. Menores">
              <p>
                VerbalIA es apta para navegantes de todas las edades y no recoge datos de menores: no hay registro,
                ni contacto, ni perfiles públicos. La foto de perfil, si la subes, nunca sale del dispositivo.
              </p>
            </LegalBlock>
          </TabsContent>

          {/* ===== Política de cookies ===== */}
          <TabsContent value="cookies" className="mt-4 space-y-4">
            <LegalBlock icon={<Cookie className="h-4 w-4" aria-hidden />} title="1. Usamos cookies">
              <p>
                No usamos cookies de seguimiento, analítica ni publicidad. La app tampoco emplea píxeles ni
                identificadores de terceros.
              </p>
            </LegalBlock>

            <LegalBlock icon={<HardDrive className="h-4 w-4" aria-hidden />} title="2. Almacenamiento local">
              <p>
                Para recordar tu progreso usamos el almacenamiento del navegador (similar a una cookie técnica, pero
                sin caducidad y sin salir del dispositivo). Sirve para guardar tu partida, tus ajustes y tus canciones
                de la estación de música.
              </p>
            </LegalBlock>

            <LegalBlock icon={<ShieldCheck className="h-4 w-4" aria-hidden />} title="3. Cómo eliminarlo">
              <p>
                Puedes vaciarlo desde el propio juego (Ajustes → Tus datos → Borrar todo) o desde tu navegador, en el
                menú de privacidad, eligiendo «Datos de sitios». Al borrarlo, la aventura empieza de cero.
              </p>
            </LegalBlock>

            <p className="rounded-2xl bg-secondary px-4 py-3 text-xs leading-relaxed text-secondary-foreground">
              Última actualización de estas políticas: con la versión actual del juego. Si el funcionamiento cambia,
              esta pantalla será lo primero en contártelo.
            </p>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

function LegalBlock({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <section className="card-aurora rounded-2xl border bg-card p-4">
      <h3 className="flex items-center gap-2 text-sm font-bold">
        <span className="chip-icon flex h-8 w-8 items-center justify-center rounded-lg">{icon}</span>
        {title}
      </h3>
      <div className="mt-2.5 space-y-1.5 text-sm leading-relaxed text-muted-foreground">{children}</div>
    </section>
  );
}
