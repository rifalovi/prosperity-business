import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendLeadNotification(lead: {
  nomComplet: string;
  email: string;
  telephone?: string | null;
  sujet: string;
  message: string;
}) {
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL;
  const fromEmail = process.env.RESEND_FROM_EMAIL;

  if (!adminEmail || !fromEmail) {
    throw new Error("ADMIN_NOTIFICATION_EMAIL et RESEND_FROM_EMAIL doivent être configurés");
  }

  return resend.emails.send({
    from: fromEmail,
    to: adminEmail,
    replyTo: lead.email,
    subject: `Nouveau message - ${lead.sujet}`,
    html: `
      <h2>Nouvelle demande de contact</h2>
      <p><strong>De :</strong> ${lead.nomComplet} (${lead.email})</p>
      ${lead.telephone ? `<p><strong>Téléphone :</strong> ${lead.telephone}</p>` : ""}
      <p><strong>Sujet :</strong> ${lead.sujet}</p>
      <hr>
      <p>${lead.message.replace(/\n/g, "<br>")}</p>
    `,
  });
}

export async function sendLeadConfirmation(toEmail: string, nomComplet: string) {
  const fromEmail = process.env.RESEND_FROM_EMAIL;
  if (!fromEmail) throw new Error("RESEND_FROM_EMAIL manquant");

  return resend.emails.send({
    from: fromEmail,
    to: toEmail,
    subject: "Nous avons bien reçu votre message",
    html: `
      <p>Bonjour ${nomComplet},</p>
      <p>Merci d'avoir contacté Prosperity Business. Nous avons bien reçu votre message
      et vous répondrons sous 48h ouvrables.</p>
      <p>À très bientôt,<br>L'équipe Prosperity Business</p>
    `,
  });
}
