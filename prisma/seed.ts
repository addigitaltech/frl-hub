import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const db = new PrismaClient();

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;
  const name = process.env.SEED_ADMIN_NAME || 'FRL Super Admin';

  if (!email || !password) {
    throw new Error(
      'Set SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD in your environment before seeding. ' +
        'No default credentials are hardcoded here on purpose.'
    );
  }
  if (password.length < 12) {
    throw new Error('SEED_ADMIN_PASSWORD must be at least 12 characters.');
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const admin = await db.user.upsert({
    where: { email: email.toLowerCase() },
    update: {},
    create: {
      name,
      email: email.toLowerCase(),
      passwordHash,
      role: Role.SUPER_ADMIN,
    },
  });
  console.log(`Seeded SUPER_ADMIN: ${admin.email}`);

  await db.settings.upsert({
    where: { id: 'default' },
    update: {},
    create: { id: 'default' }, // schema defaults fill org name, colors, etc.
  });
  console.log('Seeded default Settings row.');
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
