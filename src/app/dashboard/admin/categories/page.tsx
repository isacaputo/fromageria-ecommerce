// Queries
import { getAllCategories } from "@/queries/category";

export default async function AdminCategoriesPage() {

  // Fetching categories data from teh database
  const categories = await getAllCategories();

  // Checking if no categories are found
  if (!categories) return null;
  return (
    <div>
      <h1>Admin Categories Page</h1>
    </div>
  );
}
