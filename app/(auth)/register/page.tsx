import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AuthPanel } from "@/components/auth/auth-panel";
import { RegisterForm } from "@/components/auth/register-form";

export default async function RegisterPage() {
  const session = await auth();

  if (session?.user?.id) {
    redirect("/applications");
  }

  return (
    <AuthPanel
      breadcrumbs={[{ label: "Home", href: "/" }, { label: "Create account" }]}
      eyebrow="Get started"
      title="Create your Applin workspace"
      description="Set up your account and start tracking openings, custom interview rounds, and notes without spreadsheet drift."
      sideTitle="A modern tracker should feel focused, not overwhelming."
      sideCopy="This interface is designed to feel crisp and calm while still holding the details that matter when your pipeline gets busy."
    >
      <RegisterForm />
    </AuthPanel>
  );
}
