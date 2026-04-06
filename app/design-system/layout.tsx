import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Design system",
  description: "Subtle settings UI tokens and components",
};

export default function DesignSystemLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      {children}
    </div>
  );
}
