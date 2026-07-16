import bcrypt from "bcryptjs";
import { prisma } from "../src/lib/prisma";

async function main() {
  const email = process.env.APP_USER_EMAIL;
  const password = process.env.APP_USER_PASSWORD;

  if (!email || !password) {
    console.log(
      "Skipping seed: APP_USER_EMAIL and APP_USER_PASSWORD are not set"
    );
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: { passwordHash },
    create: { email, passwordHash, name: process.env.APP_USER_NAME },
  });

  console.log(`Seeded user: ${user.email}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
