export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <h1>Dashboard</h1>
      <main>{children}</main>
    </div>
  );
}