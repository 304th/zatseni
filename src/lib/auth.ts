import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import YandexProvider from "next-auth/providers/yandex";
import VKProvider from "next-auth/providers/vk";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";
import crypto from "crypto";

// Telegram auth data verification
function verifyTelegramAuth(
  data: Record<string, string>,
  botToken: string
): boolean {
  const { hash, ...rest } = data;
  if (!hash) return false;

  const secret = crypto.createHash("sha256").update(botToken).digest();
  const checkString = Object.keys(rest)
    .sort()
    .map((k) => `${k}=${rest[k]}`)
    .join("\n");
  const hmac = crypto
    .createHmac("sha256", secret)
    .update(checkString)
    .digest("hex");

  return hmac === hash;
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as NextAuthOptions["adapter"],
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    // Email/password login
    CredentialsProvider({
      id: "credentials",
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email и пароль обязательны");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password) {
          throw new Error("Пользователь не найден");
        }

        const isValid = await bcrypt.compare(credentials.password, user.password);

        if (!isValid) {
          throw new Error("Неверный пароль");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          plan: user.plan,
          phone: user.phone,
          phoneVerified: user.phoneVerified ? true : false,
          createdAt: user.createdAt,
        };
      },
    }),

    // Phone OTP login
    CredentialsProvider({
      id: "phone",
      name: "phone",
      credentials: {
        userId: { label: "User ID", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.userId) {
          throw new Error("Пользователь не найден");
        }

        // User already verified via /api/auth/phone/verify-otp
        const user = await prisma.user.findUnique({
          where: { id: credentials.userId },
        });

        if (!user) {
          throw new Error("Пользователь не найден");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          plan: user.plan,
          phone: user.phone,
          phoneVerified: user.phoneVerified ? true : false,
          createdAt: user.createdAt,
        };
      },
    }),

    // Telegram login
    CredentialsProvider({
      id: "telegram",
      name: "telegram",
      credentials: {
        telegramData: { label: "Telegram Data", type: "text" },
        plan: { label: "Plan", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.telegramData) {
          throw new Error("Данные Telegram не получены");
        }

        const botToken = process.env.TELEGRAM_BOT_TOKEN;
        if (!botToken) {
          throw new Error("Telegram не настроен");
        }

        const data = JSON.parse(credentials.telegramData);

        // Verify hash
        if (!verifyTelegramAuth(data, botToken)) {
          throw new Error("Неверные данные Telegram");
        }

        // Check auth_date freshness (24h)
        const authDate = parseInt(data.auth_date);
        if (Date.now() / 1000 - authDate > 86400) {
          throw new Error("Данные авторизации устарели");
        }

        const telegramId = data.id.toString();

        // Find or create user
        let user = await prisma.user.findUnique({
          where: { telegramId },
        });

        if (!user) {
          const plan = credentials.plan || "start";
          user = await prisma.user.create({
            data: {
              telegramId,
              name: data.first_name + (data.last_name ? " " + data.last_name : ""),
              image: data.photo_url,
              plan: ["start", "business", "network"].includes(plan) ? plan : "start",
            },
          });
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          plan: user.plan,
          phone: user.phone,
          phoneVerified: user.phoneVerified ? true : false,
          createdAt: user.createdAt,
        };
      },
    }),

    // Yandex OAuth
    ...(process.env.YANDEX_CLIENT_ID && process.env.YANDEX_CLIENT_SECRET
      ? [
          YandexProvider({
            clientId: process.env.YANDEX_CLIENT_ID,
            clientSecret: process.env.YANDEX_CLIENT_SECRET,
          }),
        ]
      : []),

    // VK OAuth
    ...(process.env.VK_CLIENT_ID && process.env.VK_CLIENT_SECRET
      ? [
          VKProvider({
            clientId: process.env.VK_CLIENT_ID,
            clientSecret: process.env.VK_CLIENT_SECRET,
          }),
        ]
      : []),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      // For OAuth providers, set default plan for new users
      if (account?.provider === "yandex" || account?.provider === "vk") {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email || undefined },
        });

        if (!existingUser && user.email) {
          // Will be created by adapter, but we can set defaults via update after
          // The adapter creates user first, then account
        }
      }
      return true;
    },
    async jwt({ token, user, account, trigger }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role;
        token.plan = (user as { plan?: string }).plan;
        token.phone = (user as { phone?: string | null }).phone;
        token.phoneVerified = (user as { phoneVerified?: boolean }).phoneVerified;
        token.createdAt = (user as { createdAt?: Date }).createdAt?.toISOString();
      }

      // Refresh user data on session update
      if (trigger === "update" && token.id) {
        const freshUser = await prisma.user.findUnique({
          where: { id: token.id as string },
        });
        if (freshUser) {
          token.role = freshUser.role;
          token.plan = freshUser.plan;
          token.phone = freshUser.phone;
          token.phoneVerified = freshUser.phoneVerified ? true : false;
          token.createdAt = freshUser.createdAt.toISOString();
        }
      }

      // For OAuth users, fetch role/plan from DB
      if (account?.provider === "yandex" || account?.provider === "vk") {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
        });
        if (dbUser) {
          token.role = dbUser.role;
          token.plan = dbUser.plan;
          token.phone = dbUser.phone;
          token.phoneVerified = dbUser.phoneVerified ? true : false;
          token.createdAt = dbUser.createdAt.toISOString();
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.plan = token.plan as string;
        session.user.phone = token.phone as string | null | undefined;
        session.user.phoneVerified = token.phoneVerified as boolean | undefined;
        session.user.createdAt = token.createdAt as string | undefined;
      }
      return session;
    },
  },
  events: {
    async createUser({ user }) {
      // Set default plan for OAuth users
      await prisma.user.update({
        where: { id: user.id },
        data: { plan: "start" },
      });
    },
  },
};
