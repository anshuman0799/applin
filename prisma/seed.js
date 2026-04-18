const fs = require("node:fs");
const path = require("node:path");

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return;
  }

  const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    let value = trimmed.slice(separatorIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

loadEnvFile(path.join(process.cwd(), ".env.local"));

const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");

const db = new PrismaClient();

const SEED_USER = {
  email: "anshuman@mailinator.com",
  password: "P@ssw0rd",
  name: "Anshuman Rao",
};

const SEEDED_APPLICATIONS = [
  {
    company: "Stripe",
    role: "Software Engineer, New Grad",
    jobLink: "https://jobs.example.com/stripe-new-grad",
    location: "San Francisco, CA",
    status: "Applied",
    interviewRounds: [],
    recruiterName: "Maya Patel",
    recruiterEmail: "maya.patel@stripe.example",
    recruiterPhone: "+14155550123",
    recruiterSocial: "https://linkedin.com/in/mayapatelrecruiting",
    notes: [],
  },
  {
    company: "Notion",
    role: "Product Engineer",
    jobLink: "https://jobs.example.com/notion-product-engineer",
    location: "Remote",
    status: "Screening",
    interviewRounds: [],
    recruiterName: "Ethan Brooks",
    recruiterEmail: "ethan.brooks@notion.example",
    recruiterPhone: "",
    recruiterSocial: "",
    notes: [
      {
        stage: "Screening",
        content:
          "Recruiter wants stronger examples around end-to-end ownership and shipping velocity.",
      },
    ],
  },
  {
    company: "OpenAI",
    role: "Forward Deployed Engineer",
    jobLink: "https://jobs.example.com/openai-fde",
    location: "San Francisco, CA",
    status: "Interview:1",
    interviewRounds: [],
    recruiterName: "Alicia Gomez",
    recruiterEmail: "alicia.gomez@openai.example",
    recruiterPhone: "+14155550888",
    recruiterSocial: "https://linkedin.com/in/aliciagomezai",
    notes: [
      {
        stage: "Interview",
        content:
          "Prep customer-facing system design examples and one story about ambiguous stakeholder alignment.",
      },
    ],
  },
  {
    company: "Anthropic",
    role: "Software Engineer, Platform",
    jobLink: "https://jobs.example.com/anthropic-platform",
    location: "San Francisco, CA",
    status: "Interview:2",
    interviewRounds: ["Interview Round 1", "Interview Round 2"],
    recruiterName: "Jordan Lee",
    recruiterEmail: "jordan.lee@anthropic.example",
    recruiterPhone: "+14155550777",
    recruiterSocial: "",
    notes: [
      {
        stage: "Interview:1",
        content:
          "Round 1 focused on backend fundamentals and reasoning under ambiguity.",
      },
      {
        stage: "Interview:2",
        content:
          "Current round will likely emphasize scaling infra for model-serving workflows.",
      },
    ],
  },
  {
    company: "Vercel",
    role: "Full Stack Engineer",
    jobLink: "https://jobs.example.com/vercel-fullstack",
    location: "Remote",
    status: "Interview:3",
    interviewRounds: [
      "Interview Round 1",
      "Interview Round 2",
      "Interview Round 3",
    ],
    recruiterName: "Nina Shah",
    recruiterEmail: "nina.shah@vercel.example",
    recruiterPhone: "",
    recruiterSocial: "https://linkedin.com/in/ninashah-recruiting",
    notes: [
      {
        stage: "Interview:1",
        content:
          "Frontend round went well; good signal on React depth and product taste.",
      },
      {
        stage: "Interview:2",
        content:
          "System design feedback: tighten caching tradeoff explanations.",
      },
    ],
  },
  {
    company: "Figma",
    role: "Frontend Engineer",
    jobLink: "https://jobs.example.com/figma-frontend",
    location: "New York, NY",
    status: "Rejected",
    interviewRounds: [],
    recruiterName: "Sophie Chen",
    recruiterEmail: "sophie.chen@figma.example",
    recruiterPhone: "+12125550112",
    recruiterSocial: "",
    notes: [
      {
        stage: "Rejected",
        content:
          "Feedback mentioned stronger visual systems experience would help for similar roles later.",
      },
    ],
  },
  {
    company: "Linear",
    role: "Product Engineer",
    jobLink: "https://jobs.example.com/linear-product-engineer",
    location: "Remote",
    status: "Accepted",
    interviewRounds: [
      "Interview Round 1",
      "Interview Round 2",
      "Interview Round 3",
    ],
    recruiterName: "Rahul Mehta",
    recruiterEmail: "rahul.mehta@linear.example",
    recruiterPhone: "+14155550333",
    recruiterSocial: "https://linkedin.com/in/rahulmehta-hiring",
    notes: [
      {
        stage: "Accepted",
        content:
          "Offer approved. Capture leveling details, compensation structure, and target start date.",
      },
    ],
  },
];

async function main() {
  const hashedPassword = await bcrypt.hash(SEED_USER.password, 12);

  await db.user.deleteMany({
    where: {
      NOT: { email: SEED_USER.email },
    },
  });

  const user = await db.user.upsert({
    where: { email: SEED_USER.email },
    update: {
      name: SEED_USER.name,
      password: hashedPassword,
    },
    create: {
      email: SEED_USER.email,
      name: SEED_USER.name,
      password: hashedPassword,
    },
  });

  await db.application.deleteMany({ where: { userId: user.id } });

  const applications = [];

  for (const application of SEEDED_APPLICATIONS) {
    const createdApplication = await db.application.create({
      data: {
        userId: user.id,
        company: application.company,
        role: application.role,
        jobLink: application.jobLink,
        location: application.location,
        status: application.status,
        interviewRounds: application.interviewRounds,
        recruiterName: application.recruiterName || null,
        recruiterEmail: application.recruiterEmail || null,
        recruiterPhone: application.recruiterPhone || null,
        recruiterSocial: application.recruiterSocial || null,
        notes: {
          create: application.notes,
        },
      },
      include: { notes: true },
    });

    applications.push(createdApplication);
  }

  console.log("Seed complete");
  console.log(`Email: ${SEED_USER.email}`);
  console.log(`Password: ${SEED_USER.password}`);
  console.log(`Seeded applications: ${applications.length}`);
  console.log(
    `Application IDs: ${applications.map((application) => application.id).join(", ")}`,
  );
  console.log(
    `Note IDs: ${applications
      .flatMap((application) => application.notes.map((note) => note.id))
      .join(", ")}`,
  );
}

main()
  .catch((error) => {
    console.error("Seed failed");
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$disconnect();
  });
