import type { ReactNode } from "react";
import { DividerOrnament } from "@/components/Ornament";

/** Layar status bertema (loading / error / not-found). */
export function StateScreen({
  title,
  message,
  action,
  pulse = false,
}: {
  title: string;
  message: string;
  action?: ReactNode;
  pulse?: boolean;
}) {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-ink px-8 text-center">
      <div className="max-w-xs">
        <div className={pulse ? "animate-breathe" : undefined}>
          <DividerOrnament />
        </div>
        <h1 className="mt-6 font-serif text-3xl text-gold-light">{title}</h1>
        <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-mist">{message}</p>
        {action ? <div className="mt-8">{action}</div> : null}
      </div>
    </main>
  );
}
