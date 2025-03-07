// Queries
import CategoryDetails from "@/components/dashboard/forms/categoryDetails";
import DataTable from "@/components/ui/data-table";
import { getAllCategories } from "@/queries/category";
import { Plus } from "lucide-react";
import { columns } from "./columns";

export default async function AdminCategoriesPage() {

  // Fetching categories data from teh database
  const categories = await getAllCategories();

  // Checking if no categories are found
  if (!categories) return null;
  return (
    <DataTable actionButtonText={
      <>
        <Plus size={15} />
        Create category
      </>}
      modalChildren={<CategoryDetails />}
      newTabLink="/dashboard/admin/categories/new"
      filterValue="name"
      data={categories}
      searchPlaceholder="Search category name..."
      columns={columns} />
  );
}
