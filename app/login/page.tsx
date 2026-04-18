import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AuthPanel } from "@/components/auth/auth-panel";
import { LoginForm } from "@/components/auth/login-form";

export default async function LoginPage() {
  const session = await auth();

  if (session?.user?.id) {
    redirect("/applications");
  }

  return (
    <AuthPanel
      breadcrumbs={[{ label: "Home", href: "/" }, { label: "Sign in" }]}
      eyebrow="Welcome back"
      title="Sign in to your job search command center"
      description="Track every opportunity, keep each stage readable, and walk into interviews with all your context in one place."
      sideTitle="Clean pipeline tracking for messy, real-world hiring loops."
      sideCopy="Applin is built for search seasons where every company runs a different process. Keep the UI calm while the search gets complex."
    >
      <LoginForm />
    </AuthPanel>
  );
}
