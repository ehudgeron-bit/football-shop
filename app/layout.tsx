import type { Metadata } from "next";
import { Providers } from "@/components/Providers";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Football Shop | חולצות כדורגל",
    template: "%s | Football Shop",
  },
  description: "חולצות כדורגל מקוריות — ליגות, קבוצות ונבחרות מהשורה הראשונה",
  keywords: ["חולצות כדורגל", "חולצות ספורט", "כדורגל", "ניקה", "אדידס"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // dir="rtl" is set globally — this is a Hebrew-first site
    <html lang="he" dir="rtl">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
