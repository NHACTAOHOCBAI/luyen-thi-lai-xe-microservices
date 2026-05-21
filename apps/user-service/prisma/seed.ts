import { Gender, LicenseTier, PrismaClient, Role } from '@prisma/user-client';

const prisma = new PrismaClient();

const adminId = 'seed-user-admin-0001';
const studentId = 'seed-user-student-0001';

async function main(): Promise<void> {
  await prisma.userProfile.upsert({
    where: { email: 'seed-admin@local.dev' },
    update: {
      fullName: 'Seed Admin',
      role: Role.ADMIN,
      isActive: true,
    },
    create: {
      id: adminId,
      fullName: 'Seed Admin',
      email: 'seed-admin@local.dev',
      role: Role.ADMIN,
      gender: Gender.OTHER,
      isActive: true,
    },
  });

  await prisma.userProfile.upsert({
    where: { email: 'seed-student@local.dev' },
    update: {
      fullName: 'Seed Student',
      role: Role.STUDENT,
      isActive: true,
    },
    create: {
      id: studentId,
      fullName: 'Seed Student',
      email: 'seed-student@local.dev',
      role: Role.STUDENT,
      gender: Gender.MALE,
      isActive: true,
    },
  });

  await prisma.studentDetail.upsert({
    where: { studentId },
    update: {
      licenseTier: LicenseTier.B2,
      notes: 'Seeded local student profile',
    },
    create: {
      studentId,
      licenseTier: LicenseTier.B2,
      notes: 'Seeded local student profile',
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
