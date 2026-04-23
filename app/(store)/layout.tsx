import { StorefrontHeader } from "@/components/store/StorefrontHeader";
import { StorefrontFooter } from "@/components/store/StorefrontFooter";

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <StorefrontHeader />
      <main className="flex-1">{children}</main>
      <StorefrontFooter />
    </div>
  );
}
