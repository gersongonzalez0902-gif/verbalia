/**
 * Mailer · Resend vía fetch (sin SDK) · 01-arquitectura.md §2.
 *
 * 4 plantillas es-ES: verificar email, bienvenida, reset de contraseña,
 * cambio de email (+ el aviso "alguien intentó registrarse" de
 * 02-cuentas-auth.md §5.1).
 *
 * Sin RESEND_API_KEY ⇒ modo dry-run: el correo se registra en los logs
 * del servidor en vez de enviarse (desarrollo sin cuenta de Resend).
 * MAIL_FROM cae a "VerbalIA <onboarding@resend.dev>" (sandbox de Resend:
 * solo entrega al dueño de la cuenta — esperado en pruebas).
 */

const RESEND_ENDPOINT = "https://api.resend.com/emails";

function appUrl(): string {
  return (process.env.APP_URL ?? "http://localhost:3000").replace(/\/+$/, "");
}

function mailFrom(): string {
  return process.env.MAIL_FROM ?? "VerbalIA <onboarding@resend.dev>";
}

export interface MailMessage {
  to: string;
  subject: string;
  html: string;
}

/** Envía (o registra en dry-run). Nunca lanza: el flujo no se rompe por el correo. */
export async function sendMail(msg: MailMessage): Promise<{ sent: boolean; dryRun: boolean }> {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    // Dry-run de desarrollo: el enlace queda en los logs del servidor
    // (así se puede completar la verificación sin cuenta de Resend).
    const link = msg.html.match(/https?:\/\/[^"'\s<]+/)?.[0];
    console.log(
      JSON.stringify({
        mail: { dryRun: true, from: mailFrom(), to: msg.to, subject: msg.subject, ...(link ? { link } : {}) },
      }),
    );
    return { sent: false, dryRun: true };
  }
  try {
    const res = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from: mailFrom(), to: msg.to, subject: msg.subject, html: msg.html }),
    });
    if (!res.ok) {
      console.error(JSON.stringify({ mail: { error: true, status: res.status, to: msg.to } }));
      return { sent: false, dryRun: false };
    }
    return { sent: true, dryRun: false };
  } catch (err) {
    console.error(JSON.stringify({ mail: { error: true, message: err instanceof Error ? err.message : String(err) } }));
    return { sent: false, dryRun: false };
  }
}

/* ============================== Plantillas ============================== */

function layout(title: string, inner: string): string {
  return `<!DOCTYPE html>
<html lang="es"><body style="margin:0;padding:0;background:#0f1226;font-family:system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;">
<div style="max-width:520px;margin:0 auto;padding:32px 20px;color:#f5f3ff;">
  <p style="font-size:20px;font-weight:800;margin:0 0 24px;color:#ff8fa3;">VerbalIA</p>
  <div style="background:#1a1e3a;border-radius:16px;padding:28px;border:1px solid #2c3157;">
    <h1 style="font-size:20px;margin:0 0 14px;color:#f5f3ff;">${title}</h1>
    <div style="font-size:15px;line-height:1.6;color:#d9d6ef;">${inner}</div>
  </div>
  <p style="font-size:12px;color:#8b8fb0;margin-top:20px;">
    VerbalIA · el archipiélago de juegos de lengua · Si no pediste esto, ignora este correo.
  </p>
</div>
</body></html>`;
}

function button(url: string, label: string): string {
  return `<p style="margin:24px 0;"><a href="${url}" style="display:inline-block;background:#ff8fa3;color:#1a1030;font-weight:700;padding:12px 24px;border-radius:999px;text-decoration:none;">${label}</a></p>
<p style="font-size:13px;color:#a9a5cc;word-break:break-all;">Si el botón no funciona, copia este enlace:<br>${url}</p>`;
}

/** Enlace de verificación de email (EMAIL_VERIFY 48 h). */
export function templateVerifyEmail(name: string, token: string): MailMessage {
  const url = `${appUrl()}/?verify=${encodeURIComponent(token)}#/cuenta`;
  return {
    to: "", // lo pone el llamador
    subject: "Confirma tu correo — VerbalIA",
    html: layout(
      `Hola, ${escapeHtml(name)} 👋`,
      `<p>Un paso más para amarrar tu bitácora al barco: confirma tu correo.</p>
      <p>El enlace caduca en 48 horas.</p>
      ${button(url, "Confirmar correo")}`,
    ),
  };
}

/** Bienvenida tras verificar (se envía una sola vez). */
export function templateWelcome(name: string): MailMessage {
  return {
    to: "",
    subject: "¡Bienvenido a bordo! — VerbalIA",
    html: layout(
      `¡Zarpamos, ${escapeHtml(name)}! ⛵`,
      `<p>Tu correo ya está confirmado y tu bitácora queda amarrada a tu cuenta:
      ahora tu progreso viaja contigo entre dispositivos.</p>
      <p>Sigue entrenando en el archipiélago: misiones, repaso inteligente y
      el Bazar del Copista te esperan.</p>
      <p style="margin-top:24px;"><a href="${appUrl()}" style="color:#ff8fa3;font-weight:700;text-decoration:none;">Volver a VerbalIA →</a></p>`,
    ),
  };
}

/** Reset de contraseña (PASSWORD_RESET 1 h). */
export function templatePasswordReset(name: string, token: string): MailMessage {
  const url = `${appUrl()}/?reset=${encodeURIComponent(token)}#/cuenta`;
  return {
    to: "",
    subject: "Recupera tu contraseña — VerbalIA",
    html: layout(
      `Cambio de contraseña`,
      `<p>Hola, ${escapeHtml(name)}. Pediste restablecer tu contraseña.</p>
      <p>El enlace caduca en <strong>1 hora</strong> y se puede usar una sola vez.
      Al usarlo se cerrarán las sesiones de todos tus dispositivos.</p>
      ${button(url, "Elegir contraseña nueva")}`,
    ),
  };
}

/** Confirmación de cambio de email (EMAIL_CHANGE 48 h, va al NUEVO correo). */
export function templateEmailChange(newEmail: string, token: string): MailMessage {
  const url = `${appUrl()}/?verify=${encodeURIComponent(token)}#/cuenta`;
  return {
    to: "",
    subject: "Confirma tu nuevo correo — VerbalIA",
    html: layout(
      `Cambio de correo`,
      `<p>Pediste cambiar el correo de tu cuenta de VerbalIA a
      <strong>${escapeHtml(newEmail)}</strong>.</p>
      <p>Confirma desde este enlace (caduca en 48 h y se usa una sola vez).
      Hasta entonces, tu correo actual sigue siendo el de siempre.</p>
      ${button(url, "Confirmar nuevo correo")}`,
    ),
  };
}

/** Aviso al dueño: alguien intentó registrarse con su correo (§5.1). */
export function templateRegistrationAttempt(name: string): MailMessage {
  return {
    to: "",
    subject: "Alguien intentó registrarse con tu correo — VerbalIA",
    html: layout(
      `Ojo, ${escapeHtml(name)}`,
      `<p>Alguien acaba de intentar crear una cuenta en VerbalIA usando este
      correo. Como la cuenta ya existe, <strong>no se ha hecho nada</strong>:
      tu cuenta sigue igual.</p>
      <p>Si fuiste tú, ya tienes cuenta: inicia sesión normalmente. Si no,
      puedes ignorar este correo con tranquilidad.</p>`,
    ),
  };
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Envía una plantilla con el destinatario puesto. */
export async function sendTemplate(tpl: MailMessage, to: string): Promise<void> {
  await sendMail({ ...tpl, to });
}
