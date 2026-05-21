import {
  CourseStatus,
  LicenseCategory,
  PrismaClient,
} from '@prisma/course-client';

const prisma = new PrismaClient();

const courseId = 'seed-course-b2-0001';
const lessonId = 'seed-lesson-b2-0001';
const seedAdminId = 'seed-user-admin-0001';

async function main(): Promise<void> {
  await prisma.course.upsert({
    where: { id: courseId },
    update: {
      title: 'Khoi dong khoa B2',
      status: CourseStatus.ACTIVE,
      totalLessons: 1,
    },
    create: {
      id: courseId,
      title: 'Khoi dong khoa B2',
      description: 'Du lieu seed local cho course-service',
      licenseCategory: LicenseCategory.B2,
      totalLessons: 1,
      duration: '30 ngay',
      tuitionFee: '1500000',
      capacity: 30,
      status: CourseStatus.ACTIVE,
      createdById: seedAdminId,
    },
  });

  await prisma.lesson.upsert({
    where: { id: lessonId },
    update: {
      title: 'Buoi hoc dau tien',
      order: 1,
    },
    create: {
      id: lessonId,
      courseId,
      title: 'Buoi hoc dau tien',
      content: 'Gioi thieu tong quan khoa hoc va lo trinh hoc',
      order: 1,
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
