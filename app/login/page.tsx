import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AuthPanel } from "@/components/auth/auth-panel";
import { LoginForm } from "@/components/auth/login-form";

export default async function LoginPage() {
  const session = await auth();
  const oauthProviders = {
    google: Boolean(
      process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET,
    ),
  };

  if (session?.user?.id) {
    redirect("/applications");
  }

  return (
    <AuthPanel
      breadcrumbs={[{ label: "Home", href: "/" }, { label: "Sign in" }]}
      eyebrow="Welcome back"
      title="Sign in to your application workspace"
      description="Pick up exactly where you left off with your board, recruiter context, interview rounds, and stage notes already in place."
      sideTitle="Return to a hiring pipeline that stays organized under pressure."
      sideCopy="Applin keeps the full search surface connected: the board for momentum, the list for filtering, and each role dossier for the details you need before every decision and interview."
      sideStats={[
        { label: "Board", value: "Stage movement" },
        { label: "Dossiers", value: "Notes + recruiters" },
        { label: "Interviews", value: "Round-by-round context" },
      ]}
      sideHighlights={[
        {
          title: "Review your search at a glance",
          copy: "See applied, active, inactive, and accepted roles without jumping across spreadsheets or docs.",
        },
        {
          title: "Open the exact role context fast",
          copy: "Recruiter details, linked notes, and current stage context stay attached to each application.",
        },
        {
          title: "Walk into interviews prepared",
          copy: "Use round-aware notes and current-round status tracking to prep with the right context every time.",
        },
      ]}
    >
      <LoginForm oauthProviders={oauthProviders} />
    </AuthPanel>
  );
}
