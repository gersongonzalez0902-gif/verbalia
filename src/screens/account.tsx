"use client";

/**
 * Pantalla de Cuenta · 02-cuentas-auth.md.
 *
 * Accesible desde Ajustes y desde la portada (sin cuenta):
 * - Sin sesión: registro e inicio de sesión. La unión bitácora↔barco es
 *   AUTOMÁTICA y silenciosa al iniciar sesión (syncOnLogin): sin botones
 *   de migración, sin modales.
 * - Con sesión: estado del correo + reenvío de verificación, cambio de
 *   contraseña, dispositivos activos (cerrar sesión en otros), cambio de
 *   email, sincronización manual (tranquilidad) y borrado de cuenta con
 *   anonimización.
 * - Enlaces de correo: ?verify=… (verificar/cambiar email) y ?reset=…
 *   (contraseña nueva) se procesan automáticamente al abrir la pantalla.
 *
 * Sin sesión y sin red, la app se comporta IDÉNTICA a hoy: esta pantalla
 * solo añade; nunca exige nada para jugar.
 */

import { useCallback, useEffect, useState } from "react";
import { useGameStore } from "@/store/game-store";
import { useOnlineStore } from "@/store/online-store";
import { useUiStore } from "@/store/ui-store";
import { useToast } from "@/hooks/use-toast";
import { api, ApiError, type SessionItemDto } from "@/lib/api-client";
import { createOnlineStatus, offlineNotice } from "@/lib/online-status";
import { afterLogin, syncNow } from "@/services/sync";
import { loadSyncMeta } from "@/services/storage";
import { ScreenHeader } from "@/components/game/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  BadgeCheck,
  KeyRound,
  Laptop,
  LogOut,
  MailWarning,
  RefreshCw,
  ShieldAlert,
  UserRound,
  WifiOff,
} from "lucide-react";

/* ============================== Ayudantes ============================== */

function errorText(err: unknown): string {
  if (err instanceof ApiError) return err.message;
  return "Algo se torció. Inténtalo de nuevo.";
}

function timeAgo(iso: string): string {
  const s = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (s < 60) return "hace un momento";
  if (s < 3600) return `hace ${Math.floor(s / 60)} min`;
  if (s < 86400) return `hace ${Math.floor(s / 3600)} h`;
  return `hace ${Math.floor(s / 86400)} d`;
}

/* ============================== Pantalla ============================== */

export function AccountScreen() {
  const navigate = useUiStore((s) => s.navigate);
  const { toast } = useToast();
  const online = useOnlineStore();
  const hasProfile = useGameStore((s) => s.hasProfile);

  const [tab, setTab] = useState<"login" | "register">("login");
  const [busy, setBusy] = useState(false);

  // Estado de red honesto (Área 4.4): sin conexión, el formulario de
  // cuenta se avisa antes de intentarlo; el juego no depende de esto.
  const [netOnline, setNetOnline] = useState(true);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const status = createOnlineStatus(window);
    setNetOnline(status.online);
    return status.subscribe(setNetOnline);
  }, []);

  // Formularios
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [currentPw, setCurrentPw] = useState("");
  const [nextPw, setNextPw] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [resetPw, setResetPw] = useState("");

  // Datos
  const [sessions, setSessions] = useState<SessionItemDto[] | null>(null);
  const [lastSynced, setLastSynced] = useState<number | null>(null);

  const reloadSessions = useCallback(async () => {
    if (!useOnlineStore.getState().user) return;
    try {
      const { items } = await api.auth.sessions();
      setSessions(items);
    } catch {
      setSessions(null);
    }
  }, []);

  useEffect(() => {
    void reloadSessions();
    const meta = loadSyncMeta();
    setLastSynced(meta.lastSyncedAt);
  }, [reloadSessions, online.user?.id]);

  /* ---------- Enlaces de correo (?verify= / ?reset=) ---------- */
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const verify = params.get("verify");
    const reset = params.get("reset");
    if (!verify && !reset) return;

    // Limpiar la URL para no re-procesar el token al recargar.
    window.history.replaceState(null, "", window.location.pathname + window.location.hash);

    if (verify) {
      void (async () => {
        setBusy(true);
        try {
          const res = await api.auth.verify(verify);
          await online.refreshUser();
          toast({
            title: res.emailChanged ? "Correo actualizado" : "¡Correo confirmado!",
            description: res.emailChanged
              ? "Tu nuevo correo ya es el oficial de tu cuenta."
              : "Tu bitácora queda amarrada a tu cuenta. ¡Bienvenido a bordo!",
          });
        } catch (err) {
          toast({
            title: "El enlace no funcionó",
            description: errorText(err),
            variant: "destructive",
          });
        } finally {
          setBusy(false);
        }
      })();
    } else if (reset) {
      setTab("login");
      setPassword("");
      window.setTimeout(() => {
        const el = document.getElementById("reset-password-panel");
        el?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 200);
      // El token se usa al enviar el formulario de reset.
      (window as unknown as { __verbaliaResetToken?: string }).__verbaliaResetToken = reset;
    }
  }, []);

  /* ---------- Registro / login ---------- */

  const doRegister = async () => {
    setBusy(true);
    online.setAuthError(null);
    try {
      const res = await api.auth.register(email.trim(), password, displayName.trim());
      online.setUser(res.user);
      setPassword("");
      toast({
        title: "¡Cuenta creada!",
        description: "Mira tu correo para confirmarla (también puedes seguir jugando ya).",
      });
      await afterLogin();
    } catch (err) {
      online.setAuthError(errorText(err));
    } finally {
      setBusy(false);
    }
  };

  const doLogin = async () => {
    setBusy(true);
    online.setAuthError(null);
    try {
      const res = await api.auth.login(email.trim(), password);
      online.setUser(res.user);
      setPassword("");
      toast({ title: `¡Hola de nuevo, ${res.user.displayName}!`, description: "Sesión iniciada." });
      await afterLogin();
    } catch (err) {
      online.setAuthError(errorText(err));
    } finally {
      setBusy(false);
    }
  };

  /** P0-3 (Área 16.1): al cerrar sesión se pregunta qué hacer con la
   *  bitácora de este aparato — conservarla o borrarla del todo. */
  const [logoutOpen, setLogoutOpen] = useState(false);

  const doLogout = async (wipeLocal: boolean) => {
    await online.logoutLocal();
    setSessions(null);
    setLogoutOpen(false);
    if (wipeLocal) {
      await useGameStore.getState().resetAll();
      navigate({ name: "welcome" });
      toast({
        title: "Sesión cerrada y aparato limpio",
        description: "Tu bitácora sigue en el barco: al entrar de nuevo, todo vuelve.",
      });
    } else {
      toast({ title: "Sesión cerrada", description: "Tu bitácora local sigue intacta en este dispositivo." });
    }
  };

  /* ---------- Verificación / contraseña / correo ---------- */

  const doResend = async () => {
    setBusy(true);
    try {
      const res = await api.auth.resendVerification();
      toast({
        title: res.alreadyVerified ? "Ya estaba confirmado" : "Correo reenviado",
        description: res.alreadyVerified ? "Tu correo ya está confirmado." : "Mira tu bandeja de entrada (y el spam).",
      });
    } catch (err) {
      toast({ title: "No se pudo reenviar", description: errorText(err), variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  const doForgot = async () => {
    if (!email.trim()) {
      toast({ title: "Escribe tu correo arriba", description: "Y pulsamos «Recordar contraseña»." });
      return;
    }
    setBusy(true);
    try {
      await api.auth.forgotPassword(email.trim());
      toast({
        title: "Si ese correo existe…",
        description: "Le acabamos de mandar un enlace para restablecer la contraseña (caduca en 1 hora).",
      });
    } catch (err) {
      toast({ title: "No se pudo pedir", description: errorText(err), variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  const doResetFromEmail = async () => {
    const token = (window as unknown as { __verbaliaResetToken?: string }).__verbaliaResetToken;
    if (!token) return;
    setBusy(true);
    try {
      await api.auth.resetPassword(token, resetPw);
      (window as unknown as { __verbaliaResetToken?: string }).__verbaliaResetToken = undefined;
      setResetPw("");
      await online.refreshUser();
      toast({
        title: "Contraseña restablecida",
        description: "Se cerró la sesión en todos los dispositivos y entraste con la nueva.",
      });
    } catch (err) {
      toast({ title: "No se pudo restablecer", description: errorText(err), variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  const doChangePassword = async () => {
    setBusy(true);
    try {
      await api.auth.changePassword(currentPw, nextPw);
      setCurrentPw("");
      setNextPw("");
      toast({ title: "Contraseña actualizada", description: "Tus sesiones siguen activas." });
    } catch (err) {
      toast({ title: "No se pudo cambiar", description: errorText(err), variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  const doChangeEmail = async () => {
    setBusy(true);
    try {
      await api.auth.changeEmail(newEmail.trim(), currentPw);
      setNewEmail("");
      setCurrentPw("");
      toast({
        title: "Revisa tu nuevo correo",
        description: "Hemos mandado un enlace de confirmación (caduca en 48 h). Hasta entonces, tu correo actual sigue siendo el de siempre.",
      });
    } catch (err) {
      toast({ title: "No se pudo iniciar el cambio", description: errorText(err), variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  /* ---------- Dispositivos ---------- */

  const doRevoke = async (s: SessionItemDto) => {
    setBusy(true);
    try {
      await api.auth.revokeSession(s.id);
      if (s.current) {
        await online.logoutLocal();
        setSessions(null);
        toast({ title: "Sesión cerrada", description: "Cerraste también esta." });
      } else {
        await reloadSessions();
        toast({ title: "Dispositivo desconectado", description: s.deviceHint });
      }
    } catch (err) {
      toast({ title: "No se pudo cerrar", description: errorText(err), variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  /* ---------- Sync / borrado ---------- */

  const doSyncNow = async () => {
    setBusy(true);
    try {
      await syncNow();
      setLastSynced(loadSyncMeta().lastSyncedAt);
      toast({ title: "Sincronizado", description: "Tu bitácora local y la del barco son la misma." });
    } catch {
      toast({ title: "Sin conexión con el barco", description: "Se reintentará solo al recuperar la red.", variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  const doDeleteAccount = async () => {
    setBusy(true);
    try {
      await api.auth.deleteAccount(currentPw);
      setCurrentPw("");
      await online.refreshUser();
      setSessions(null);
      toast({
        title: "Cuenta borrada",
        description: "Tus datos quedaron anonimizados. Si fue un error, tienes 30 días para arrepentirte respondiendo al correo de despedida.",
      });
    } catch (err) {
      toast({ title: "No se pudo borrar", description: errorText(err), variant: "destructive" });
      setBusy(false);
    }
  };

  /* ============================== Render ============================== */

  const user = online.user;
  const resetPending = typeof window !== "undefined" && Boolean((window as unknown as { __verbaliaResetToken?: string }).__verbaliaResetToken);

  return (
    <div>
      <ScreenHeader title="Cuenta" backTo={{ name: "settings" }} />

      <main className="mx-auto w-full max-w-2xl space-y-6 px-4 pb-28 pt-4">
        {/* ===== Cargando sesión: esqueleto con la forma del panel (Área 1.3) ===== */}
        {!online.authChecked && (
          <div className="card-aurora relative overflow-hidden rounded-3xl border bg-card p-5" role="status" aria-live="polite">
            <span className="sr-only">Mirando si hay sesión…</span>
            <div className="mb-4 flex items-center gap-3">
              <Skeleton className="size-12 shrink-0 rounded-2xl" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-3 w-1/4" />
              </div>
            </div>
            <Skeleton className="mb-2.5 h-10 w-full rounded-2xl" />
            <Skeleton className="h-10 w-full rounded-2xl" />
          </div>
        )}

        {/* ===== Sin sesión: login / registro ===== */}
        {online.authChecked && !user && (
          <section className="card-aurora relative overflow-hidden rounded-3xl border bg-card p-5" aria-labelledby="entrar">
            <h2 id="entrar" className="type-h2 flex items-center gap-2">
              <UserRound className="h-5 w-5 text-primary" aria-hidden /> Entrar al barco
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Con una cuenta, tu bitácora viaja sola entre dispositivos: al
              entrar, la del barco y la de este aparato se unen sin perder
              nada. Sin cuenta, el juego funciona exactamente igual que
              siempre.
            </p>

            {!netOnline && (
              <p
                className="mt-3 flex items-start gap-2 rounded-2xl border border-amber-500/40 bg-amber-500/10 p-3 text-sm font-semibold text-amber-500"
                role="status"
              >
                <WifiOff className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                {offlineNotice()}
              </p>
            )}

            <Tabs value={tab} onValueChange={(v) => setTab(v as "login" | "register")} className="mt-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Iniciar sesión</TabsTrigger>
                <TabsTrigger value="register">Crear cuenta</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="mt-4 space-y-3">
              {tab === "register" && (
                <div>
                  <Label htmlFor="reg-name" className="text-sm font-bold">Nombre de navegante</Label>
                  <Input
                    id="reg-name"
                    className="mt-1"
                    placeholder="Marina"
                    autoComplete="nickname"
                    maxLength={40}
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                  />
                </div>
              )}
              <div>
                <Label htmlFor="auth-email" className="text-sm font-bold">Correo</Label>
                <Input
                  id="auth-email"
                  className="mt-1"
                  type="email"
                  placeholder="tu@correo.com"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="auth-pw" className="text-sm font-bold">Contraseña</Label>
                <Input
                  id="auth-pw"
                  className="mt-1"
                  type="password"
                  placeholder="Mínimo 8 caracteres"
                  autoComplete={tab === "login" ? "current-password" : "new-password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") void (tab === "login" ? doLogin() : doRegister());
                  }}
                />
              </div>

              {online.lastAuthError && (
                <p className="text-sm font-semibold text-destructive" role="alert">{online.lastAuthError}</p>
              )}

              <Button
                className="w-full"
                disabled={busy || !netOnline || !email.trim() || !password || (tab === "register" && !displayName.trim())}
                onClick={() => void (tab === "login" ? doLogin() : doRegister())}
              >
                {tab === "login" ? "Iniciar sesión" : "Crear cuenta"}
              </Button>

              {!netOnline && (
                <p className="text-center text-xs text-muted-foreground">
                  Los botones de cuenta se activan al volver la red.
                </p>
              )}

              {tab === "login" && (
                <Button variant="ghost" className="w-full text-sm" disabled={busy} onClick={() => void doForgot()}>
                  Recordar contraseña (por correo)
                </Button>
              )}

              {/* Entrada con Google: llega en una ola posterior (Área 4.5).
                  El botón ya ocupa su lugar, pero nunca se hace pasar por
                  activo: está deshabilitado y lo dice. */}
              <div className="flex items-center gap-3 pt-1" aria-hidden="true">
                <span className="h-px flex-1 bg-border" />
                <span className="text-xs font-semibold text-muted-foreground">o</span>
                <span className="h-px flex-1 bg-border" />
              </div>
              <Button variant="outline" className="w-full" disabled aria-disabled="true">
                Continuar con Google
                <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-xs font-bold text-muted-foreground">
                  Pronto
                </span>
              </Button>
              <p className="sr-only">
                La entrada con Google llegará en una ola posterior; de momento, usa el correo.
              </p>
              <p className="pt-1 text-center text-xs text-muted-foreground">
                Solo pedimos lo imprescindible: correo, un nombre visible y tu
                progreso. Sin rastreadores ni publicidad; exportar y borrar
                siempre a mano.
              </p>
            </div>
          </section>
        )}

        {/* ===== Restablecer contraseña desde enlace de correo ===== */}
        {online.authChecked && !user && resetPending && (
          <section id="reset-password-panel" className="card-aurora relative overflow-hidden rounded-3xl border bg-card p-5" aria-labelledby="reset-pw">
            <h2 id="reset-pw" className="type-h2 flex items-center gap-2">
              <KeyRound className="h-5 w-5 text-primary" aria-hidden /> Contraseña nueva
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Llegaste desde el enlace de recuperación: elige tu contraseña nueva
              (se cerrará la sesión en todos los dispositivos).
            </p>
            <div className="mt-3 space-y-3">
              <div>
                <Label htmlFor="reset-pw-input" className="text-sm font-bold">Contraseña nueva</Label>
                <Input
                  id="reset-pw-input"
                  className="mt-1"
                  type="password"
                  placeholder="Mínimo 8 caracteres"
                  autoComplete="new-password"
                  value={resetPw}
                  onChange={(e) => setResetPw(e.target.value)}
                />
              </div>
              <Button className="w-full" disabled={busy || !resetPw} onClick={() => void doResetFromEmail()}>
                Guardar contraseña nueva
              </Button>
            </div>
          </section>
        )}

        {/* ===== Con sesión: datos de la cuenta ===== */}
        {online.authChecked && user && (
          <>
            <section className="card-aurora relative overflow-hidden rounded-3xl border bg-card p-5" aria-labelledby="mi-cuenta">
              <h2 id="mi-cuenta" className="type-h2 flex items-center gap-2">
                <UserRound className="h-5 w-5 text-primary" aria-hidden /> Tu cuenta
              </h2>

              <dl className="mt-3 space-y-2 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-muted-foreground">Navegante</dt>
                  <dd className="font-bold">{user.displayName}</dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-muted-foreground">Correo</dt>
                  <dd className="flex items-center gap-1.5 font-semibold">
                    {user.email}
                    {user.emailVerified ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400">
                        <BadgeCheck className="h-3.5 w-3.5" aria-hidden /> confirmado
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-400">
                        <MailWarning className="h-3.5 w-3.5" aria-hidden /> sin confirmar
                      </span>
                    )}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-muted-foreground">Tu identificador</dt>
                  <dd className="font-mono text-xs font-bold">{user.handle}</dd>
                </div>
              </dl>

              {!user.emailVerified && (
                <div className="mt-3">
                  <Button variant="outline" disabled={busy} onClick={() => void doResend()}>
                    Reenviar correo de confirmación
                  </Button>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Sin confirmar puedes jugar igual; solo hace falta para subir
                    tu bitácora antigua y para funciones comunitarias.
                  </p>
                </div>
              )}

              <div className="mt-4 flex flex-wrap gap-2">
                <Button variant="outline" disabled={busy} onClick={() => void doSyncNow()}>
                  <RefreshCw className="mr-1.5 h-4 w-4" aria-hidden /> Sincronizar ahora
                </Button>
                <Button variant="ghost" disabled={busy} onClick={() => setLogoutOpen(true)}>
                  <LogOut className="mr-1.5 h-4 w-4" aria-hidden /> Cerrar sesión
                </Button>
              </div>

              {/* Área 16.1 · P0-3: cerrar sesión pregunta qué hacer con la
               * copia local — conservarla o borrarla del todo. */}
              <AlertDialog open={logoutOpen} onOpenChange={setLogoutOpen}>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>¿Cerrar sesión?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Tu bitácora queda a salvo en el barco. ¿Y la copia de este
                      aparato? Conservarla te deja jugar igual sin cuenta; borrarla
                      deja este aparato limpio (al entrar de nuevo, todo vuelve
                      desde el barco).
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter className="flex-col gap-2 sm:flex-row">
                    <AlertDialogCancel className="sm:flex-1">Cancelar</AlertDialogCancel>
                    <Button
                      variant="outline"
                      className="sm:flex-1"
                      disabled={busy}
                      onClick={() => void doLogout(false)}
                    >
                      Cerrar sesión
                    </Button>
                    <Button
                      variant="destructive"
                      className="sm:flex-1"
                      disabled={busy}
                      onClick={() => void doLogout(true)}
                    >
                      Cerrar y borrar este aparato
                    </Button>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              <p className="mt-2 text-xs text-muted-foreground">
                {lastSynced
                  ? `Última sincronización ${timeAgo(new Date(lastSynced).toISOString())}.`
                  : "Aún no se ha sincronizado en este dispositivo."}
              </p>
            </section>

            {/* ===== Contraseña ===== */}
            <section className="card-aurora relative overflow-hidden rounded-3xl border bg-card p-5" aria-labelledby="seguridad">
              <h2 id="seguridad" className="type-h2 flex items-center gap-2">
                <KeyRound className="h-5 w-5 text-primary" aria-hidden /> Contraseña y correo
              </h2>

              <div className="mt-3 space-y-3">
                <div>
                  <Label htmlFor="cur-pw" className="text-sm font-bold">Contraseña actual</Label>
                  <Input
                    id="cur-pw"
                    className="mt-1"
                    type="password"
                    autoComplete="current-password"
                    value={currentPw}
                    onChange={(e) => setCurrentPw(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="next-pw" className="text-sm font-bold">Contraseña nueva</Label>
                  <Input
                    id="next-pw"
                    className="mt-1"
                    type="password"
                    placeholder="Mínimo 8, que no sea famosa"
                    autoComplete="new-password"
                    value={nextPw}
                    onChange={(e) => setNextPw(e.target.value)}
                  />
                </div>
                <Button variant="outline" disabled={busy || !currentPw || !nextPw} onClick={() => void doChangePassword()}>
                  Cambiar contraseña
                </Button>

                <div className="border-t pt-3">
                  <Label htmlFor="new-email" className="text-sm font-bold">Cambiar de correo</Label>
                  <Input
                    id="new-email"
                    className="mt-1"
                    type="email"
                    placeholder="nuevo@correo.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    Usaremos tu contraseña actual y mandaremos un enlace al
                    NUEVO correo para confirmar (48 h).
                  </p>
                  <Button
                    variant="outline"
                    className="mt-2"
                    disabled={busy || !newEmail.trim() || !currentPw}
                    onClick={() => void doChangeEmail()}
                  >
                    Iniciar cambio de correo
                  </Button>
                </div>
              </div>
            </section>

            {/* ===== Dispositivos ===== */}
            <section className="card-aurora relative overflow-hidden rounded-3xl border bg-card p-5" aria-labelledby="dispositivos">
              <h2 id="dispositivos" className="type-h2 flex items-center gap-2">
                <Laptop className="h-5 w-5 text-primary" aria-hidden /> Dispositivos con sesión
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Puedes cerrar la sesión de cualquier equipo desde aquí
                («¿te dejaste la sesión abierta en la tablet?»).
              </p>

              {sessions === null ? (
                <p className="mt-3 text-sm text-muted-foreground" role="status">Cargando…</p>
              ) : sessions.length === 0 ? (
                <p className="mt-3 text-sm text-muted-foreground">Sin sesiones (raro, pero posible).</p>
              ) : (
                <ul className="mt-3 space-y-2">
                  {sessions.map((s) => (
                    <li
                      key={s.id}
                      className="flex items-center justify-between gap-3 rounded-2xl border bg-background/40 px-3 py-2.5"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold">
                          {s.deviceHint || "Navegador"} {s.current && <span className="text-xs font-bold text-primary">· este</span>}
                        </p>
                        <p className="text-xs text-muted-foreground">Activo {timeAgo(s.lastSeenAt)}</p>
                      </div>
                      <Button variant="ghost" size="sm" disabled={busy} onClick={() => void doRevoke(s)}>
                        Cerrar
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {/* ===== Zona peligrosa ===== */}
            <section className="relative overflow-hidden rounded-3xl border border-destructive/40 bg-card p-5" aria-labelledby="peligrosa">
              <h2 id="peligrosa" className="type-h2 flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-destructive" aria-hidden /> Borrar cuenta
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Se anonimizan tus datos y se borra tu progreso del barco. Tu
                bitácora local de este dispositivo NO se toca. Tienes 30 días
                para arrepentirte respondiendo al correo de despedida.
              </p>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="mt-3" disabled={busy}>
                    Borrar mi cuenta
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>¿Borrar la cuenta de verdad?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Confirma con tu contraseña. Esta acción anonimiza la cuenta
                      (no se puede deshacer desde la app; 30 días por correo).
                      La bitácora local de este dispositivo se conserva.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <div>
                    <Label htmlFor="del-pw" className="text-sm font-bold">Tu contraseña</Label>
                    <Input
                      id="del-pw"
                      className="mt-1"
                      type="password"
                      value={currentPw}
                      onChange={(e) => setCurrentPw(e.target.value)}
                    />
                  </div>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Mejor no</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      disabled={!currentPw}
                      onClick={(e) => {
                        e.preventDefault();
                        void doDeleteAccount();
                      }}
                    >
                      Borrar definitivamente
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
