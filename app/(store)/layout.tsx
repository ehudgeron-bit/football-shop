import { StorefrontHeader } from "@/components/store/StorefrontHeader";
import { StorefrontFooter } from "@/components/store/StorefrontFooter";
import { AnnouncementBar } from "@/components/store/AnnouncementBar";

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <AnnouncementBar />
      <StorefrontHeader />
      <main className="flex-1">{children}</main>
      <StorefrontFooter />
    </div>
  );
}
