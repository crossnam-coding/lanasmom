import type { Metadata } from "next";
import ContactForm from "@/components/shop/ContactForm";

export const metadata: Metadata = { title: "문의하기", robots: { index: false, follow: false } };
export default function ContactPage() {
  return (
    <section className="container-x py-14 md:py-20">
      <h1 className="display mb-8 text-center text-[1.8rem]">문의하기</h1>
      <ContactForm />
    </section>
  );
}
