import MainLayout from "@/layouts/MainLayout";
import RequireAuth from "@/components/RequireAuth";

export default function Layout({ children }) {
  return (
    <RequireAuth>
      <MainLayout>{children}</MainLayout>
    </RequireAuth>
  );
}
