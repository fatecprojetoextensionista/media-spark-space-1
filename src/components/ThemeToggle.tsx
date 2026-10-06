import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

interface ThemeToggleProps {
  className?: string;
}

const BASE =
  "inline-flex h-10 min-w-10 items-center justify-center gap-2 rounded-full border border-input bg-transparent px-3 text-[0.85rem] font-semibold text-foreground transition-colors hover:bg-muted focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-ring";

export function ThemeToggle({ className = "" }: ThemeToggleProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <span aria-hidden="true" className={`inline-block h-10 w-10 ${className}`} />;
  }

  const isDark = resolvedTheme === "dark";
  const target = isDark ? "claro" : "escuro";
  const Icon = isDark ? Sun : Moon;

  const handleClick = () => {
    setTheme(isDark ? "light" : "dark");
    setMessage(`Modo ${target} ativado`);
  };

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        aria-label={`Trocar para modo ${target}`}
        className={`${BASE} ${className}`}
      >
        <Icon size={16} aria-hidden="true" />
        <span>Modo {target}</span>
      </button>
      <span role="status" className="sr-only">
        {message}
      </span>
    </>
  );
}
