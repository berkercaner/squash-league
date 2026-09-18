import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { CheckCircle2, XCircle, X } from "lucide-react";
import { cn } from "./format";

interface Toast {
  id: number;
  message: string;
  tone: "success" | "error";
}

interface ToastContextValue {
  showToast: (message: string, tone?: "success" | "error") => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

let idCounter = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, tone: "success" | "error" = "success") => {
    const id = ++idCounter;
    setToasts((prev) => [...prev, { id, message, tone }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  }, []);

  const dismiss = (id: number) => setToasts((prev) => prev.filter((t) => t.id !== id));

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex flex-col items-center gap-2 px-4 sm:bottom-6">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              "animate-pop-in pointer-events-auto flex w-full max-w-sm items-center gap-2.5 rounded-xl border px-4 py-3 shadow-card-hover backdrop-blur",
              t.tone === "success"
                ? "border-emerald-200 bg-emerald-50/95 text-emerald-800 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-300"
                : "border-rose-200 bg-rose-50/95 text-rose-800 dark:border-rose-400/20 dark:bg-rose-400/10 dark:text-rose-300"
            )}
          >
            {t.tone === "success" ? (
              <CheckCircle2 size={18} className="shrink-0" />
            ) : (
              <XCircle size={18} className="shrink-0" />
            )}
            <span className="flex-1 text-sm font-medium">{t.message}</span>
            <button onClick={() => dismiss(t.id)} className="shrink-0 opacity-60 hover:opacity-100">
              <X size={15} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
