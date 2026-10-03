import { PrismaClient, CategoryType } from '@prisma/client';

/**
 * Seeds a default set of categories for a specific user.
 * @param prisma The PrismaClient instance
 * @param userId The ID of the user to seed categories for
 */
export async function seedDefaultCategories(prisma: PrismaClient, userId: string) {
  const defaultCategories = [
    {
      name: 'Food',
      icon: '🍔',
      color: '#FF6B6B',
      type: CategoryType.EXPENSE,
      isDefault: true,
    },
    {
      name: 'Transport',
      icon: '🚗',
      color: '#4DABF7',
      type: CategoryType.EXPENSE,
      isDefault: true,
    },
    {
      name: 'Shopping',
      icon: '🛍️',
      color: '#FCC419',
      type: CategoryType.EXPENSE,
      isDefault: true,
    },
    {
      name: 'Bills',
      icon: '💵',
      color: '#FF922B',
      type: CategoryType.EXPENSE,
      isDefault: true,
    },
    {
      name: 'Salary',
      icon: '💰',
      color: '#51CF66',
      type: CategoryType.INCOME,
      isDefault: true,
    },
    {
      name: 'Other',
      icon: '🏷️',
      color: '#845EF7',
      type: CategoryType.BOTH,
      isDefault: true,
    },
  ];

  await prisma.category.createMany({
    data: defaultCategories.map((category) => ({
      ...category,
      userId,
    })),
  });
}
