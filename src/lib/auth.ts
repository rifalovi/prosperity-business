import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import {
  clearFailures,
  getClientIp,
  hashIp,
  isBlocked,
  recordFailure,
} from "@/lib/rate-limit";
import { authConfig } from "@/lib/auth.config";

const MAX_LOGIN_FAILURES = 5;
const LOGIN_WINDOW_MS = 15 * 60 * 1000; // 15 min - Section 4.2 / P-02
const ARTIFICIAL_DELAY_MS = 2000; // anti timing attacks - Section 4.2 / P-02

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

class InvalidCredentialsError extends CredentialsSignin {
  code = "invalid_credentials";
}

class TooManyAttemptsError extends CredentialsSignin {
  code = "too_many_attempts";
}

class AccountSuspendedError extends CredentialsSignin {
  code = "account_suspended";
}

async function delayUntil(start: number, target: number) {
  const remaining = target - (Date.now() - start);
  if (remaining > 0) await new Promise((r) => setTimeout(r, remaining));
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" },
      },
      async authorize(rawCredentials) {
        const started = Date.now();

        // 1. IP + rate limiting (5 échecs / 15 min - Section P-02)
        const h = await headers();
        const ipKey = `login:${hashIp(getClientIp(h))}`;

        if (isBlocked(ipKey, MAX_LOGIN_FAILURES, LOGIN_WINDOW_MS)) {
          await delayUntil(started, ARTIFICIAL_DELAY_MS);
          throw new TooManyAttemptsError();
        }

        // 2. Validation format
        const parsed = credentialsSchema.safeParse(rawCredentials);
        if (!parsed.success) {
          recordFailure(ipKey, LOGIN_WINDOW_MS);
          await delayUntil(started, ARTIFICIAL_DELAY_MS);
          throw new InvalidCredentialsError();
        }
        const { email, password } = parsed.data;

        // 3. Lookup utilisateur
        const user = await prisma.user.findUnique({
          where: { email: email.toLowerCase() },
        });

        // bcrypt même si l'utilisateur n'existe pas, ou si le compte
        // est en attente d'activation (passwordHash null) — anti enumeration.
        const dummyHash = "$2a$12$abcdefghijklmnopqrstuv1234567890ABCDEFGHIJKLMNopqr";
        const passwordOk = await bcrypt.compare(
          password,
          user?.passwordHash ?? dummyHash,
        );

        if (!user || !passwordOk) {
          recordFailure(ipKey, LOGIN_WINDOW_MS);
          await delayUntil(started, ARTIFICIAL_DELAY_MS);
          throw new InvalidCredentialsError();
        }

        if (!user.estActif) {
          await delayUntil(started, ARTIFICIAL_DELAY_MS);
          throw new AccountSuspendedError();
        }

        // 4. Succès - reset compteur + maj dernière connexion
        clearFailures(ipKey);
        await prisma.user.update({
          where: { id: user.id },
          data: { derniereConnexion: new Date() },
        });

        await delayUntil(started, ARTIFICIAL_DELAY_MS);

        return {
          id: user.id,
          email: user.email,
          nomComplet: user.nomComplet,
          role: user.role,
          doitChangerMotDePasse: user.doitChangerMotDePasse,
        };
      },
    }),
  ],
});
