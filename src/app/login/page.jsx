import Login from "@/views/Auth/Login";
import RedirectIfAuthenticated from "../../components/RedirectLoginPage";

export const metadata = {
  title: "Login | Central Node",
};

export default function LoginPage() {
  return (
    <RedirectIfAuthenticated>
      <Login />
    </RedirectIfAuthenticated>
  );
}
