"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, MotionConfig } from "framer-motion";
import { Pause, Play } from "lucide-react";
import { BottomNav, type NavItem } from "@/components/BottomNav";
import { Cover } from "@/components/Cover";

interface InvitationShellProps {
  groomName: string;
  brideName: string;
  dateLabel: string;
  guest: string;
  coverImage: string | null;
  musicUrl: string | null;
  musicTitle: string | null;
  navItems: NavItem[];
  children: ReactNode;
}

export function InvitationShell({
  groomName,
  brideName,
  dateLabel,
  guest,
  coverImage,
  musicUrl,
  musicTitle,
  navItems,
  children,
}: InvitationShellProps) {
  const [opened, setOpened] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const noticeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Kunci scroll selama cover tampil.
  useEffect(() => {
    if (opened) return;
    const html = document.documentElement;
    const previous = html.style.overflow;
    html.style.overflow = "hidden";
    return () => {
      html.style.overflow = previous;
    };
  }, [opened]);

  useEffect(
    () => () => {
      if (noticeTimer.current) clearTimeout(noticeTimer.current);
    },
    [],
  );

  const showNotice = useCallback((text: string) => {
    setNotice(text);
    if (noticeTimer.current) clearTimeout(noticeTimer.current);
    noticeTimer.current = setTimeout(() => setNotice(null), 3500);
  }, []);

  // Mencoba memutar musik. Penolakan browser tidak boleh merusak UI / menampilkan error teknis.
  const tryPlay = useCallback(
    (announceFailure: boolean) => {
      const audio = audioRef.current;
      if (!audio) return;
      try {
        const result = audio.play();
        if (result && typeof result.then === "function") {
          result.catch(() => {
            setPlaying(false);
            if (announceFailure) showNotice("Musik belum dapat diputar. Silakan coba lagi.");
          });
        }
      } catch {
        setPlaying(false);
        if (announceFailure) showNotice("Musik belum dapat diputar. Silakan coba lagi.");
      }
    },
    [showNotice],
  );

  const handleOpen = () => {
    setOpened(true);
    window.scrollTo(0, 0);
    tryPlay(false); // dipanggil langsung dari interaksi user (klik BUKA UNDANGAN)
  };

  const toggleMusic = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      tryPlay(true);
    } else {
      audio.pause();
    }
  };

  return (
    <MotionConfig reducedMotion="user">
      <AnimatePresence>
        {!opened ? (
          <Cover
            key="cover"
            groomName={groomName}
            brideName={brideName}
            dateLabel={dateLabel}
            guest={guest}
            coverImage={coverImage}
            onOpen={handleOpen}
          />
        ) : null}
      </AnimatePresence>

      {musicUrl ? (
        <audio
          ref={audioRef}
          src={musicUrl}
          loop
          preload="none"
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
        />
      ) : null}

      <div
        className="mx-auto min-h-dvh w-full max-w-[520px] bg-ink-soft pb-28 sm:border-x sm:border-gold/15"
        inert={!opened}
      >
        {children}
      </div>

      {opened ? (
        <>
          <BottomNav items={navItems} />

          {musicUrl ? (
            <div className="pointer-events-none fixed inset-x-0 top-0 z-40 mx-auto w-full max-w-[520px]">
              <div className="pointer-events-auto absolute right-4 top-[max(1rem,env(safe-area-inset-top))] flex items-center gap-2">
                {notice ? (
                  <p role="status" className="rounded-full bg-ink/95 px-3 py-1.5 text-[11px] text-cream">
                    {notice}
                  </p>
                ) : null}
                <button
                  type="button"
                  onClick={toggleMusic}
                  aria-pressed={playing}
                  aria-label={playing ? "Jeda musik" : "Putar musik"}
                  title={musicTitle ?? undefined}
                  className="flex size-11 items-center justify-center rounded-full border border-gold/60 bg-ink/90 text-gold-light transition-colors hover:bg-gold hover:text-ink"
                >
                  {playing ? <Pause aria-hidden="true" className="size-5" /> : <Play aria-hidden="true" className="size-5" />}
                </button>
              </div>
            </div>
          ) : null}
        </>
      ) : null}
    </MotionConfig>
  );
}
