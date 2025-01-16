"use client";

import { Header1 } from "@/components/ui/header";
import { PageContainer } from "@/components/ui/page-container";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PageContainer>
      <Header1 />
      <main className="container py-6 mt-20">
        {children}
      </main>
    </PageContainer>
  );
} 