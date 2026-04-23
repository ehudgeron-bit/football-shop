type BadgeVariant = "orange" | "green" | "blue" | "gray";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  orange: "bg-orange-50 text-orange-600",
  green: "bg-green-50 text-green-700",
  blue: "bg-blue-50 text-blue-700",
  gray: "bg-surface-secondary text-text-secondary",
};

export function Badge({ children, variant = "gray", className = "" }: BadgeProps) {
  return (
    <span
      className={`inline-block rounded-4 px-2 py-0.5 text-xs font-medium ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
