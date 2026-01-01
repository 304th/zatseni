import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email?: string | null;
      name?: string | null;
      image?: string | null;
      phone?: string | null;
      role: string;
      plan: string;
    };
  }

  interface User {
    role?: string;
    plan?: string;
    phone?: string | null;
    telegramId?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role?: string;
    plan?: string;
    phone?: string | null;
  }
}
