import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AuthPanel } from "@/components/auth/auth-panel";
import { RegisterForm } from "@/components/auth/register-form";

export default async function RegisterPage() {
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
      breadcrumbs={[{ label: "Home", href: "/" }, { label: "Create account" }]}
      eyebrow="Get started"
      title="Create your Applin workspace"
      description="Start with a board built for real job searches: flexible stages, interview rounds, recruiter context, stage notes, and a list view for filtering everything."
      sideTitle="Build a clearer job-search system from day one."
      sideCopy="Applin is designed for searches that get complex fast. Instead of stitching together docs, spreadsheets, and scattered notes, you get one calm operating surface for every opportunity."
      sideStats={[
        { label: "Stages", value: "Flexible pipeline" },
        { label: "Notes", value: "Stage-aware context" },
        { label: "List view", value: "Fast filtering" },
      ]}
      sideHighlights={[
        {
          title: "Track the real pipeline",
          copy: "Applied, screening, interview rounds, rejected, withdrawn, accepted. The workflow reflects how hiring actually behaves.",
        },
        {
          title: "Keep recruiter context attached",
          copy: "Store recruiter names, contact details, and profile links alongside the application instead of hunting later.",
        },
        {
          title: "Grow without losing readability",
          copy: "Board, list, and detail views stay aligned as your search expands across more roles and more interview loops.",
        },
      ]}
    >
      <RegisterForm oauthProviders={oauthProviders} />
    </AuthPanel>
  );
}
