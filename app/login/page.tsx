import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth/AuthForm";
import { getCurrentUser } from "@/lib/auth/dal";

export const metadata = {
  title: "ContentPilot — Login",
};

export default async function LoginPage() {
  if (await getCurrentUser()) redirect("/");

  return (
    <main className="flex-1 flex items-center justify-center px-6 py-16">
      <AuthForm />
    </main>
  );
}
