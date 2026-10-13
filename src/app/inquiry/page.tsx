import type { Metadata } from "next";
import InquiryThread from "@/components/shop/InquiryThread";

export const metadata: Metadata = { title: "내 문의", robots: { index: false, follow: false } };
export default function InquiryPage() {
  return (
    <section className="container-x py-14 md:py-20">
      <h1 className="display mb-8 text-center text-[1.8rem]">내 문의</h1>
      <InquiryThread />
    </section>
  );
}
