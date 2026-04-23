import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-surface-secondary">
      <header className="border-b border-surface-tertiary bg-white px-6 py-4">
        <Link href="/" className="text-xl font-bold tracking-tight">
          ⚽ Football Shop
        </Link>
      </header>
      <div className="flex flex-1 items-center justify-center p-6">
        {children}
      </div>
    </div>
  );
}
