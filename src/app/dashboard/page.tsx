import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  // Get user and redirect depending on role
  const user = await currentUser();

  // Redirect if user has a USER role
  if (user?.privateMetadata?.role === 'USER') redirect('/')
  // Redirect if user has a ADMIN role
  if (user?.privateMetadata?.role === 'ADMIN') redirect('/dashboard/admin')

  return (
    <div>Dashboard Page</div>
  );
}