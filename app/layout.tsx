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

// Inline script — runs before React to prevent flash of wrong theme
const themeScript = `
(function(){
  try {
    var t = localStorage.getItem('theme');
    if (t === 'dark' || (!t && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    }
  } catch(e){}
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
