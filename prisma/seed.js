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

  const applicationOne = await db.application.create({
    data: {
      userId: user.id,
      company: "OpenAI",
      role: "Software Engineer",
      jobLink: "https://example.com/jobs/openai-se",
      location: "San Francisco, CA",
      status: "Interview Round 2",
      notes: {
        create: [
          {
            content: "Recruiter call complete. Waiting on onsite schedule.",
          },
        ],
      },
    },
    include: { notes: true },
  });

  const applicationTwo = await db.application.create({
    data: {
      userId: user.id,
      company: "Example Corp",
      role: "Product Engineer",
      jobLink: "https://example.com/jobs/product-engineer",
      location: "Remote",
      status: "Screening",
      notes: {
        create: [
          {
            content: "Application submitted through company careers page.",
          },
        ],
      },
    },
    include: { notes: true },
  });

  console.log("Seed complete");
  console.log(`Email: ${email}`);
  console.log(`Password: ${password}`);
  console.log(`Application IDs: ${applicationOne.id}, ${applicationTwo.id}`);
  console.log(
    `Note IDs: ${applicationOne.notes[0].id}, ${applicationTwo.notes[0].id}`,
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
