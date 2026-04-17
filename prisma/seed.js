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

async function main() {
  const email = process.env.SEED_USER_EMAIL || "postman-tester@example.com";
  const password = process.env.SEED_USER_PASSWORD || "testpass123";
  const name = process.env.SEED_USER_NAME || "Postman Tester";
  const hashedPassword = await bcrypt.hash(password, 12);

  const defaultApplications = [
    {
      company: "OpenAI",
      role: "Software Engineer",
      jobLink: "https://example.com/jobs/openai-se",
      location: "San Francisco, CA",
      status: "Interview",
      interviewRounds: ["Recruiter Screen", "Round 1", "Round 2"],
      notes: [
        { content: "Recruiter call complete. Waiting on onsite schedule." },
      ],
    },
    {
      company: "Anthropic",
      role: "Forward Deployed Engineer",
      jobLink: "https://example.com/jobs/anthropic-fde",
      location: "San Francisco, CA",
      status: "Applied",
      interviewRounds: [],
      notes: [
        { content: "Submitted through careers page with referral attached." },
      ],
    },
    {
      company: "Example Corp",
      role: "Product Engineer",
      jobLink: "https://example.com/jobs/product-engineer",
      location: "Remote",
      status: "Screening",
      interviewRounds: [],
      notes: [
        { content: "Application submitted through company careers page." },
      ],
    },
    {
      company: "Northstar AI",
      role: "Platform Engineer",
      jobLink: "https://example.com/jobs/platform-engineer",
      location: "New York, NY",
      status: "Rejected",
      interviewRounds: [],
      notes: [{ content: "Received rejection after hiring manager review." }],
    },
    {
      company: "Studio Labs",
      role: "Frontend Engineer",
      jobLink: "https://example.com/jobs/frontend-engineer",
      location: "Remote",
      status: "Accepted",
      interviewRounds: ["Recruiter Screen", "Panel", "Final"],
      notes: [{ content: "Offer accepted. Start date under discussion." }],
    },
    {
      company: "Orbit Systems",
      role: "Backend Engineer",
      jobLink: "https://example.com/jobs/backend-engineer",
      location: "Austin, TX",
      status: "Withdrawn",
      interviewRounds: [],
      notes: [{ content: "Withdrew after accepting another opportunity." }],
    },
  ];

  const user = await db.user.upsert({
    where: { email },
    update: {
      name,
      password: hashedPassword,
    },
    create: {
      email,
      name,
      password: hashedPassword,
    },
  });

  await db.application.deleteMany({ where: { userId: user.id } });

  const applications = [];

  for (const application of defaultApplications) {
    const createdApplication = await db.application.create({
      data: {
        userId: user.id,
        company: application.company,
        role: application.role,
        jobLink: application.jobLink,
        location: application.location,
        status: application.status,
        interviewRounds: application.interviewRounds,
        notes: {
          create: application.notes,
        },
      },
      include: { notes: true },
    });

    applications.push(createdApplication);
  }

  console.log("Seed complete");
  console.log(`Email: ${email}`);
  console.log(`Password: ${password}`);
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
