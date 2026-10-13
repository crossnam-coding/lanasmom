import type { Metadata } from "next";
import LoginView from "@/components/shop/LoginView";

export const metadata: Metadata = { title: "로그인", robots: { index: false, follow: false } };

export default function LoginPage() {
  return (
    <section className="container-x py-14 md:py-20">
      <h1 className="display mb-6 text-center text-[1.8rem]">로그인</h1>
      <LoginView />
    </section>
  );
}
