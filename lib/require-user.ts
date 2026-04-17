import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export type AuthenticatedUser = {
  id: string;
  name?: string | null;
  email?: string | null;
};

export async function requireUser() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  return {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
  } satisfies AuthenticatedUser;
}
