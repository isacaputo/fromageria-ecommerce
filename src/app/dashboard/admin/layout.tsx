import Header from "@/components/dashboard/header/header";
import Sidebar from "@/components/dashboard/sidebar/sidebar";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";


export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {

  // Block non ADMIN users from accessing the page
  const user = await currentUser();
  if (user?.privateMetadata?.role !== 'ADMIN') redirect('/');
  return (
    <div className='w-full h-full'>
      <Sidebar isAdmin />
      <div className='w-full ml-[300px]'>
        <Header />
        <div className='w-full mt-[75px] p-4'>{children}</div>
      </div>
    </div>
  );
}