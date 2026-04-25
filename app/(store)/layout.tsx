import { StorefrontHeader } from "@/components/store/StorefrontHeader";
import { StorefrontFooter } from "@/components/store/StorefrontFooter";

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <StorefrontHeader />
      {/* No top padding — hero is full-viewport and header is fixed/transparent */}
      <div className="flex-1">{children}</div>
      <StorefrontFooter />
    </div>
  );
}
