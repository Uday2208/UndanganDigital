"use client";

import { useEffect, useState } from "react";
import { CalendarDays, Gift, Heart, House, Images, MessageCircle, type LucideIcon } from "lucide-react";

export type NavIconKey = "home" | "couple" | "event" | "gallery" | "gift" | "wishes";

export interface NavItem {
  id: string;
  label: string;
  icon: NavIconKey;
}

const ICONS: Record<NavIconKey, LucideIcon> = {
  home: House,
  couple: Heart,
  event: CalendarDays,
  gallery: Images,
  gift: Gift,
  wishes: MessageCircle,
};

export function BottomNav({ items }: { items: NavItem[] }) {
  const [activeId, setActiveId] = useState<string>(items[0]?.id ?? "");

  useEffect(() => {
    const elements = items
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => el !== null);
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      { rootMargin: "-35% 0px -55% 0px", threshold: [0, 0.25, 0.5, 1] },
    );
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [items]);

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 mx-auto w-full max-w-[520px]">
      <nav
        aria-label="Navigasi undangan"
        className="pointer-events-auto border-t border-gold/25 bg-ink/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-sm"
      >
        <ul className="flex items-stretch justify-around">
          {items.map((item) => {
            const Icon = ICONS[item.icon];
            const active = item.id === activeId;
            return (
              <li key={item.id} className="min-w-0 flex-1">
                <a
                  href={`#${item.id}`}
                  onClick={() => setActiveId(item.id)}
                  aria-current={active ? "location" : undefined}
                  className={`relative flex min-h-14 flex-col items-center justify-center gap-1 px-1 text-[10px] tracking-wide transition-colors ${
                    active ? "text-gold-light" : "text-mist hover:text-cream"
                  }`}
                >
                  {active ? <span aria-hidden="true" className="absolute inset-x-4 top-0 h-px bg-gold-light" /> : null}
                  <Icon aria-hidden="true" className="size-5" strokeWidth={active ? 2 : 1.5} />
                  <span className="max-w-full truncate">{item.label}</span>
                </a>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
