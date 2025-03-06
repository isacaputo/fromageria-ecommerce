'use server';

import { db } from '@/lib/db';
import { currentUser } from '@clerk/nextjs/server';
import { Category } from '@prisma/client';

// Function: upsertCategory
// Description: Upserts a category into the database, updating if it exists or creating a new one if does not.
// Permission Level: Admin only
// Parameters:
//   - category: Category object containing details of the category to be upserted.
// Returns: Updated or newly created category details.
export const upsertCategory = async (category: Category) => {
  try {
    const user = await currentUser();
    if (!user) throw new Error('Unauthenticated');

    if (user.privateMetadata.role !== 'ADMIN') throw new Error('Unauthorized');

    if (!category) throw new Error('Category is required');

    const existingCategory = await db.category.findFirst({
      where: {
        AND: [
          {
            OR: [
              {
                name: category.name,
              },
              { url: category.url },
            ],
          },
          { NOT: { id: category.id } },
        ],
      },
    });
    if (existingCategory) {
      let errorMessage = '';
      if (existingCategory.name === category.name) {
        errorMessage = 'A category with the same name already exists. ';
      } else if (existingCategory.url === category.url) {
        errorMessage = 'A category with the same url already exists. ';
      }
      throw new Error(errorMessage);
    }

    const categoryDetails = await db.category.upsert({
      where: { id: category.id },
      update: category,
      create: category,
    });
    return categoryDetails;
  } catch (err) {
    console.error(err);
    throw new Error();
  }
};

// Function: getAllCategories
// Description: Retrieves all categories from the database.
// Permission Level: Public
// Returns: Array of categories sorted by updatedAt date in descending order.
export const getAllCategories = async () => {
  // Retrieve all categories from the database
  const categories = await db.category.findMany({
    orderBy: {
      updatedAt: 'desc',
    },
  });
  return categories;
};
