import "dotenv/config";
import prisma from "./prisma";

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_USER;
  if (!adminEmail) {
    console.warn("No ADMIN_EMAIL or SMTP_USER configured, skipping seed");
    return;
  }

  const existing = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!existing) {
    await prisma.user.create({ data: { email: adminEmail, role: 'ADMIN', hivePoints: 0 } });
    console.log("Admin user created:", adminEmail);
  } else {
    console.log("Admin exists:", adminEmail);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
