import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { db } from "@/lib/db";
import { validateCredentialSignIn } from "@/lib/credentials-auth";

const googleEnabled = Boolean(
  process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET,
);

export const oauthProviderAvailability = {
  google: googleEnabled,
} as const;

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const validation = await validateCredentialSignIn(
          credentials.email as string,
          credentials.password as string,
        );

        if (validation.status !== "ok") return null;

        return {
          id: validation.user.id,
          email: validation.user.email,
          name: validation.user.name,
        };
      },
    }),
    ...(googleEnabled
      ? [
          Google({
            clientId: process.env.AUTH_GOOGLE_ID!,
            clientSecret: process.env.AUTH_GOOGLE_SECRET!,
          }),
        ]
      : []),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "credentials") {
        return true;
      }

      if (!user.email) {
        return false;
      }

      return true;
    },
    async jwt({ token, user, account }) {
      if (account?.provider === "credentials" && user?.id) {
        token.id = user.id;
        return token;
      }

      if (account && account.provider !== "credentials" && token.email) {
        const dbUser = await db.user.upsert({
          where: { email: token.email },
          create: {
            email: token.email,
            name: token.name,
            password: null,
            emailVerifiedAt: new Date(),
          },
          update: {
            ...(token.name ? { name: token.name } : {}),
            emailVerifiedAt: new Date(),
          },
          select: {
            id: true,
            name: true,
          },
        });

        token.id = dbUser.id;
        token.name = dbUser.name ?? token.name;
        return token;
      }

      if (!token.id && token.email) {
        const existingUser = await db.user.findUnique({
          where: { email: token.email },
          select: {
            id: true,
            name: true,
          },
        });

        if (existingUser) {
          token.id = existingUser.id;
          token.name = existingUser.name ?? token.name;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (token && session.user) session.user.id = token.id as string;
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
});
