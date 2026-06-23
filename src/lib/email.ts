import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

function getSiteUrl(): string {
  // En prod : NEXT_PUBLIC_SITE_URL ou SITE_URL.
  // En dev : http://localhost:3000
  return (
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000")
  );
}

function emailLayout(title: string, bodyHtml: string): string {
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; color: #1a1a1a;">
      <div style="border-bottom: 3px solid #2D5016; padding-bottom: 12px; margin-bottom: 24px;">
        <h1 style="margin: 0; font-size: 20px; color: #2D5016;">Prosperity Business</h1>
      </div>
      <h2 style="font-size: 18px; margin-top: 0;">${title}</h2>
      ${bodyHtml}
      <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 32px 0 16px;">
      <p style="font-size: 12px; color: #6b6b6b; margin: 0;">
        Prosperity Business — Allada, Bénin<br>
        Cet email est automatique, ne répondez pas à cette adresse.
      </p>
    </div>
  `;
}

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

// ────────────────────────────────────────────────────────────────────────────
// Auth & onboarding emails
// ────────────────────────────────────────────────────────────────────────────

interface SendOptions {
  silent?: boolean; // ne lève pas d'erreur si Resend n'est pas configuré
}

async function safeSend(
  to: string,
  subject: string,
  html: string,
  opts: SendOptions = {},
) {
  const fromEmail = process.env.RESEND_FROM_EMAIL;
  if (!fromEmail || !process.env.RESEND_API_KEY) {
    if (opts.silent) {
      console.warn(`[email] RESEND non configuré — email "${subject}" non envoyé à ${to}`);
      return null;
    }
    throw new Error("RESEND_API_KEY et RESEND_FROM_EMAIL doivent être configurés");
  }
  return resend.emails.send({ from: fromEmail, to, subject, html });
}

/**
 * Envoyé à un nouveau membre/partenaire créé par un admin (mode invitation).
 * Le lien permet de définir son mot de passe initial.
 */
export async function sendInvitationEmail(args: {
  email: string;
  nomComplet: string;
  token: string;
  role: "membre" | "partenaire" | "super_admin" | "admin_contenu";
}) {
  const link = `${getSiteUrl()}/inscription/${args.token}`;
  const roleLabel =
    args.role === "partenaire" ? "partenaire"
    : args.role === "membre" ? "membre"
    : "administrateur";

  const body = `
    <p>Bonjour <strong>${args.nomComplet}</strong>,</p>
    <p>Votre compte ${roleLabel} sur la plateforme Prosperity Business vient d'être créé.
    Pour l'activer, définissez votre mot de passe en cliquant sur le bouton ci-dessous :</p>
    <p style="text-align: center; margin: 28px 0;">
      <a href="${link}" style="display: inline-block; background: #2D5016; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 500;">
        Activer mon compte
      </a>
    </p>
    <p style="font-size: 13px; color: #6b6b6b;">
      Ou copiez ce lien dans votre navigateur :<br>
      <a href="${link}" style="color: #2D5016; word-break: break-all;">${link}</a>
    </p>
    <p style="font-size: 13px; color: #6b6b6b;">
      Ce lien expire dans 48 heures. Si vous n'êtes pas à l'origine de cette demande, ignorez ce message.
    </p>
  `;

  return safeSend(args.email, "Activez votre compte Prosperity Business", emailLayout("Bienvenue", body));
}

/**
 * Envoyé quand un admin crée un compte avec un mot de passe initial.
 * Contient les identifiants de connexion. L'utilisateur devra changer
 * son mot de passe à la première connexion.
 */
export async function sendCredentialsEmail(args: {
  email: string;
  nomComplet: string;
  password: string;
  role: "membre" | "partenaire" | "super_admin" | "admin_contenu";
}) {
  const isAdmin = args.role === "super_admin" || args.role === "admin_contenu";
  const loginUrl = `${getSiteUrl()}${isAdmin ? "/admin/login" : "/connexion"}`;
  const body = `
    <p>Bonjour <strong>${args.nomComplet}</strong>,</p>
    <p>Un compte vient d'être créé pour vous sur la plateforme Prosperity Business.
    Voici vos identifiants de connexion :</p>
    <div style="background: #f6f6f4; border: 1px solid #e5e5e5; padding: 16px; margin: 16px 0; border-radius: 8px; font-size: 14px;">
      <p style="margin: 0 0 8px;"><strong>Email :</strong> ${args.email}</p>
      <p style="margin: 0;"><strong>Mot de passe provisoire :</strong>
        <code style="background: #fff; padding: 2px 6px; border-radius: 4px; border: 1px solid #e5e5e5;">${args.password}</code>
      </p>
    </div>
    <p style="text-align: center; margin: 28px 0;">
      <a href="${loginUrl}" style="display: inline-block; background: #2D5016; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 500;">
        Se connecter
      </a>
    </p>
    <p style="font-size: 13px; color: #6b6b6b;">
      Pour votre sécurité, vous devrez <strong>définir votre propre mot de passe</strong>
      dès votre première connexion.
    </p>
  `;
  return safeSend(
    args.email,
    "Vos identifiants Prosperity Business",
    emailLayout("Votre accès à la plateforme", body),
    { silent: true },
  );
}

/**
 * Envoyé quand un utilisateur demande "mot de passe oublié".
 */
export async function sendPasswordResetEmail(args: {
  email: string;
  nomComplet: string;
  token: string;
}) {
  const link = `${getSiteUrl()}/mot-de-passe-reinit/${args.token}`;
  const body = `
    <p>Bonjour <strong>${args.nomComplet}</strong>,</p>
    <p>Vous avez demandé à réinitialiser votre mot de passe. Cliquez sur le bouton ci-dessous pour en choisir un nouveau :</p>
    <p style="text-align: center; margin: 28px 0;">
      <a href="${link}" style="display: inline-block; background: #2D5016; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 500;">
        Réinitialiser mon mot de passe
      </a>
    </p>
    <p style="font-size: 13px; color: #6b6b6b;">
      Ou copiez ce lien :<br>
      <a href="${link}" style="color: #2D5016; word-break: break-all;">${link}</a>
    </p>
    <p style="font-size: 13px; color: #6b6b6b;">
      Ce lien expire dans 1 heure. Si vous n'avez rien demandé, ignorez ce message — votre mot de passe reste inchangé.
    </p>
  `;
  return safeSend(args.email, "Réinitialisation de votre mot de passe", emailLayout("Réinitialisation", body), { silent: true });
}

/**
 * Confirmation envoyée au candidat partenaire dès soumission.
 */
export async function sendCandidatureRecueEmail(args: {
  email: string;
  nomComplet: string;
}) {
  const body = `
    <p>Bonjour <strong>${args.nomComplet}</strong>,</p>
    <p>Merci pour votre intérêt à devenir partenaire de Prosperity Business.</p>
    <p>Votre demande a bien été reçue et sera étudiée par notre équipe.
    Nous reviendrons vers vous sous <strong>5 jours ouvrables</strong>.</p>
    <p>À très bientôt,<br>L'équipe Prosperity Business</p>
  `;
  return safeSend(
    args.email,
    "Votre candidature partenaire est reçue",
    emailLayout("Candidature reçue", body),
    { silent: true },
  );
}

/**
 * Notification à l'admin qu'une nouvelle candidature partenaire arrive.
 */
export async function sendCandidatureAdminNotif(args: {
  nomComplet: string;
  email: string;
  organisation?: string | null;
  secteur?: string | null;
  message: string;
}) {
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL;
  if (!adminEmail) return null;
  const link = `${getSiteUrl()}/admin/candidatures`;
  const body = `
    <p>Nouvelle candidature partenaire reçue :</p>
    <p>
      <strong>${args.nomComplet}</strong> (${args.email})<br>
      ${args.organisation ? `<strong>Organisation :</strong> ${args.organisation}<br>` : ""}
      ${args.secteur ? `<strong>Secteur :</strong> ${args.secteur}<br>` : ""}
    </p>
    <p><em>${args.message.replace(/\n/g, "<br>")}</em></p>
    <p style="margin-top: 20px;"><a href="${link}" style="color: #2D5016;">Traiter la candidature →</a></p>
  `;
  return safeSend(
    adminEmail,
    `Candidature partenaire — ${args.nomComplet}`,
    emailLayout("Nouvelle candidature", body),
    { silent: true },
  );
}

/**
 * Email envoyé quand l'admin approuve une candidature.
 * Contient le lien d'activation du compte (set password initial).
 */
export async function sendCandidatureApprouveeEmail(args: {
  email: string;
  nomComplet: string;
  token: string;
}) {
  const link = `${getSiteUrl()}/inscription/${args.token}`;
  const body = `
    <p>Bonjour <strong>${args.nomComplet}</strong>,</p>
    <p>Excellente nouvelle : votre candidature a été <strong>acceptée</strong>.
    Bienvenue dans le réseau Prosperity Business !</p>
    <p>Pour activer votre espace partenaire et choisir votre mot de passe, cliquez ici :</p>
    <p style="text-align: center; margin: 28px 0;">
      <a href="${link}" style="display: inline-block; background: #2D5016; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 500;">
        Activer mon compte partenaire
      </a>
    </p>
    <p style="font-size: 13px; color: #6b6b6b;">
      Lien direct : <a href="${link}" style="color: #2D5016; word-break: break-all;">${link}</a><br>
      Ce lien expire dans 7 jours.
    </p>
  `;
  return safeSend(
    args.email,
    "Votre candidature partenaire est acceptée",
    emailLayout("Candidature acceptée 🎉", body),
    { silent: true },
  );
}

/**
 * Email poli quand l'admin rejette une candidature.
 */
export async function sendCandidatureRejeteeEmail(args: {
  email: string;
  nomComplet: string;
}) {
  const body = `
    <p>Bonjour <strong>${args.nomComplet}</strong>,</p>
    <p>Nous avons étudié votre candidature avec attention et nous ne sommes malheureusement
    pas en mesure de l'accepter pour le moment.</p>
    <p>Ce n'est pas un refus définitif : n'hésitez pas à recontacter notre équipe
    pour échanger sur d'autres formes de collaboration ou pour soumettre une nouvelle
    candidature plus tard.</p>
    <p>Nous vous remercions pour l'intérêt porté à Prosperity Business.</p>
    <p>Cordialement,<br>L'équipe Prosperity Business</p>
  `;
  return safeSend(
    args.email,
    "Suite à votre candidature partenaire",
    emailLayout("Réponse à votre candidature", body),
    { silent: true },
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Modération du profil public (membres & partenaires)
// ────────────────────────────────────────────────────────────────────────────

/**
 * Envoyé quand un admin publie le profil public d'un membre/partenaire.
 */
export async function sendProfilPublicPublieEmail(args: {
  email: string;
  nomComplet: string;
  role: "membre" | "partenaire";
  slug: string;
}) {
  const publicUrl = `${getSiteUrl()}/${
    args.role === "partenaire" ? "partenaires" : "membres"
  }/${args.slug}`;
  const body = `
    <p>Bonjour <strong>${args.nomComplet}</strong>,</p>
    <p>Bonne nouvelle : votre profil public a été validé et est désormais
    visible sur le site Prosperity Business.</p>
    <p style="text-align: center; margin: 28px 0;">
      <a href="${publicUrl}" style="display: inline-block; background: #2D5016; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 500;">
        Voir mon profil en ligne
      </a>
    </p>
    <p style="font-size: 13px; color: #6b6b6b;">
      Lien direct : <a href="${publicUrl}" style="color: #2D5016; word-break: break-all;">${publicUrl}</a>
    </p>
    <p style="font-size: 13px; color: #6b6b6b;">
      Vous pouvez modifier votre profil à tout moment depuis votre espace.
      Toute modification d'un profil publié le repasse en validation avant
      d'être à nouveau visible.
    </p>
  `;
  return safeSend(
    args.email,
    "Votre profil public est en ligne 🎉",
    emailLayout("Profil publié", body),
    { silent: true },
  );
}

/**
 * Envoyé quand un admin refuse la publication d'un profil public.
 * Le motif (notes_admin) est affiché à l'utilisateur.
 */
export async function sendProfilPublicRefuseEmail(args: {
  email: string;
  nomComplet: string;
  role: "membre" | "partenaire";
  motif: string;
}) {
  const editUrl = `${getSiteUrl()}/${
    args.role === "partenaire" ? "partenaire" : "espace"
  }/profil`;
  const body = `
    <p>Bonjour <strong>${args.nomComplet}</strong>,</p>
    <p>Votre demande de publication de profil public n'a pas pu être validée
    en l'état.</p>
    <div style="background: #f6f6f4; border-left: 3px solid #2D5016; padding: 12px 16px; margin: 16px 0; border-radius: 4px;">
      <p style="margin: 0; font-size: 14px;"><strong>Motif :</strong><br>${args.motif.replace(/\n/g, "<br>")}</p>
    </div>
    <p style="text-align: center; margin: 28px 0;">
      <a href="${editUrl}" style="display: inline-block; background: #2D5016; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 500;">
        Modifier mon profil
      </a>
    </p>
    <p style="font-size: 13px; color: #6b6b6b;">
      Une fois les ajustements faits, soumettez à nouveau votre profil :
      nous le réexaminerons rapidement.
    </p>
  `;
  return safeSend(
    args.email,
    "Votre profil public nécessite des ajustements",
    emailLayout("Profil à ajuster", body),
    { silent: true },
  );
}
