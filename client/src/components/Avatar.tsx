import { initials } from "../lib/format";

export function Avatar({
  name,
  color,
  size = "md",
  ring = false,
}: {
  name: string;
  color: string;
  size?: "sm" | "md" | "lg" | "xl";
  ring?: boolean;
}) {
  const sizes = {
    sm: "h-7 w-7 text-[11px]",
    md: "h-9 w-9 text-xs",
    lg: "h-12 w-12 text-sm",
    xl: "h-16 w-16 text-lg",
  };

  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full font-bold text-white ${sizes[size]} ${
        ring ? "ring-2 ring-white dark:ring-surface-dark-raised" : ""
      }`}
      style={{
        background: `linear-gradient(135deg, ${color}, ${color}cc)`,
        boxShadow: `0 2px 10px -2px ${color}66`,
      }}
      aria-hidden
    >
      {initials(name)}
    </div>
  );
}
