"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type ToastTone = "neutral" | "success" | "error";

type ToastRecord = {
  id: number;
  message: string;
  tone: ToastTone;
};

type ToastContextValue = {
  showToast: (message: string, tone?: ToastTone) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastRecord[]>([]);
  const nextToastIdRef = useRef(1);
  const timeoutsRef = useRef<Map<number, number>>(new Map());

  const removeToast = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));

    const timeoutId = timeoutsRef.current.get(id);

    if (timeoutId) {
      window.clearTimeout(timeoutId);
      timeoutsRef.current.delete(id);
    }
  }, []);

  const showToast = useCallback(
    (message: string, tone: ToastTone = "neutral") => {
      const id = nextToastIdRef.current;
      nextToastIdRef.current += 1;

      setToasts((current) => [...current, { id, message, tone }]);

      const timeoutId = window.setTimeout(() => {
        removeToast(id);
      }, 2200);

      timeoutsRef.current.set(id, timeoutId);
    },
    [removeToast],
  );

  useEffect(() => {
    return () => {
      for (const timeoutId of timeoutsRef.current.values()) {
        window.clearTimeout(timeoutId);
      }

      timeoutsRef.current.clear();
    };
  }, []);

  const contextValue = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={contextValue}>
      {children}

      <div className="pointer-events-none fixed inset-x-0 bottom-5 z-50 flex flex-col items-center gap-2 px-4">
        {toasts.map((toast) => {
          const toneClass =
            toast.tone === "success"
              ? "bg-emerald-950 text-emerald-50"
              : toast.tone === "error"
                ? "bg-rose-950 text-rose-50"
                : "bg-stone-950 text-white";

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto rounded-full px-4 py-2 text-sm font-medium shadow-[0_18px_40px_rgba(28,25,23,0.24)] ${toneClass}`}
            >
              {toast.message}
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useAppToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useAppToast must be used within a ToastProvider.");
  }

  return context;
}
