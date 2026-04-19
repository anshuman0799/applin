import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

export async function validateCredentialSignIn(
  email: string,
  password: string,
) {
  const normalizedEmail = email.trim().toLowerCase();
  const user = await db.user.findUnique({
    where: { email: normalizedEmail },
    select: {
      id: true,
      email: true,
      name: true,
      password: true,
      emailVerifiedAt: true,
    },
  });

  if (!user?.password) {
    return { status: "invalid" as const };
  }

  const passwordMatch = await bcrypt.compare(password, user.password);

  if (!passwordMatch) {
    return { status: "invalid" as const };
  }

  if (!user.emailVerifiedAt) {
    return {
      status: "unverified" as const,
      email: user.email,
    };
  }

  return {
    status: "ok" as const,
    user,
  };
}
