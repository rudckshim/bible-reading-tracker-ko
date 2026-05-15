import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { StatusBar, Style } from "@capacitor/status-bar";
import { Capacitor } from "@capacitor/core";

const TEXTS = {
  appName: "경배와 찬양을 주님께",
  title: "성경 일독 체크표",
  description: "각 장을 누르면 색칠됩니다.",
};

const BOOKS = [
  "창세기", "출애굽기", "레위기", "민수기", "신명기", "여호수아", "사사기", "룻기", "사무엘상", "사무엘하",
  "열왕기상", "열왕기하", "역대상", "역대하", "에스라", "느헤미야", "에스더", "욥기", "시편", "잠언",
  "전도서", "아가", "이사야", "예레미야", "예레미야애가", "에스겔", "다니엘", "호세아", "요엘", "아모스",
  "오바댜", "요나", "미가", "나훔", "하박국", "스바냐", "학개", "스가랴", "말라기", "마태복음",
  "마가복음", "누가복음", "요한복음", "사도행전", "로마서", "고린도전서", "고린도후서", "갈라디아서", "에베소서", "빌립보서",
  "골로새서", "데살로니가전서", "데살로니가후서", "디모데전서", "디모데후서", "디도서", "빌레몬서", "히브리서", "야고보서", "베드로전서",
  "베드로후서", "요한일서", "요한이서", "요한삼서", "유다서", "요한계시록",
];

const BOOK_CHAPTERS = [
  50, 40, 27, 36, 34, 24, 21, 4, 31, 24,
  22, 25, 29, 36, 10, 13, 10, 42, 150, 31,
  12, 8, 66, 52, 5, 48, 12, 14, 3, 9,
  1, 4, 7, 3, 3, 3, 2, 14, 4, 28,
  16, 24, 21, 28, 16, 16, 13, 6, 6, 4,
  4, 5, 3, 6, 4, 3, 1, 13, 5, 5,
  3, 5, 1, 1, 1, 22,
];

function hslForBook(index) {
  const startHue = 8;
  const endHue = 275;
  const hue =
    startHue +
    (endHue - startHue) * (index / (BOOK_CHAPTERS.length - 1));

  return `hsl(${hue} 78% 58%)`;
}

function storageKey(bookIndex, chapter) {
  return `book-${bookIndex + 1}-chapter-${chapter}`;
}

function getSavedChecks() {
  try {
    return JSON.parse(localStorage.getItem("bible-reading-checked") || "{}");
  } catch {
    return {};
  }
}

function getSavedSize() {
  try {
    return localStorage.getItem("bible-reading-size") || "small";
  } catch {
    return "small";
  }
}

export default function App() {
  useEffect(() => {
    if (Capacitor.getPlatform() !== "web") {
      StatusBar.setOverlaysWebView({ overlay: false });
      StatusBar.setStyle({ style: Style.Light });
      StatusBar.setBackgroundColor({ color: "#f8fafc" });
    }
  }, []);

  const [checked, setChecked] = useState(getSavedChecks);
  const [sizeMode, setSizeMode] = useState(getSavedSize);
  const [installPrompt, setInstallPrompt] = useState(null);
  const [isStandalone, setIsStandalone] = useState(() => {
    return (
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true
    );
  });

  useEffect(() => {
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true;

    setIsStandalone(standalone);

    const handler = (event) => {
      event.preventDefault();
      setInstallPrompt(event);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const columns = sizeMode === "large" ? 7 : 10;

  const books = useMemo(
    () =>
      BOOK_CHAPTERS.map((chapters, index) => ({
        name: BOOKS[index],
        chapters,
        index,
      })),
    []
  );

  const totalChapters = BOOK_CHAPTERS.reduce(
    (sum, chapters) => sum + chapters,
    0
  );

  const checkedCount = Object.values(checked).filter(Boolean).length;
  const progress = Math.round((checkedCount / totalChapters) * 100);

  const toggleChapter = (bookIndex, chapter) => {
    const key = storageKey(bookIndex, chapter);

    setChecked((prev) => {
      const next = {
        ...prev,
        [key]: !prev[key],
      };

      localStorage.setItem("bible-reading-checked", JSON.stringify(next));

      return next;
    });
  };

  const changeSize = (mode) => {
    setSizeMode(mode);
    localStorage.setItem("bible-reading-size", mode);
  };

  const handleInstall = async () => {
    const isIOS = /iphone|ipad|ipod/i.test(window.navigator.userAgent);

    if (isIOS) {
      setShowInstallGuide(true);
      return;
    }

    if (!installPrompt) {
      alert(
        "설치 버튼이 보이지 않으면 Chrome 메뉴에서 '앱 설치' 또는 '홈 화면에 추가'를 선택해주세요."
      );
      return;
    }

    installPrompt.prompt();

    const result = await installPrompt.userChoice;

    if (result.outcome === "accepted") {
      setInstallPrompt(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-3 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] text-slate-900 sm:px-4 sm:pb-4 sm:pt-[max(1rem,env(safe-area-inset-top))] md:px-8 md:pb-8 md:pt-[max(2rem,env(safe-area-inset-top))]">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="rounded-3xl bg-white p-4 shadow-sm sm:p-6 md:p-8">
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[clamp(0.82rem,3vw,1.15rem)] font-medium leading-none text-slate-500">
                {TEXTS.appName}
              </p>

              <div className="flex items-center gap-2">
                {!isStandalone && (
                  <button
                    type="button"
                    onClick={handleInstall}
                    className="rounded-2xl bg-emerald-500 px-3 py-2 text-sm font-semibold text-white transition hover:bg-emerald-600"
                  >
                    앱 설치
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => changeSize("small")}
                  className={`rounded-2xl px-3 py-2 text-sm font-semibold transition ${
                    sizeMode === "small"
                      ? "bg-slate-800 text-white"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  작게
                </button>

                <button
                  type="button"
                  onClick={() => changeSize("large")}
                  className={`rounded-2xl px-3 py-2 text-sm font-semibold transition ${
                    sizeMode === "large"
                      ? "bg-slate-800 text-white"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  크게
                </button>
              </div>
            </div>

            <div className="text-left">
              <h1 className="text-[clamp(1.7rem,7vw,3rem)] font-bold leading-tight tracking-tight text-slate-900">
                {TEXTS.title}
              </h1>

              <p className="mt-2 text-sm text-slate-600 sm:text-base">
                {TEXTS.description}
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-2">
            <div className="flex items-center justify-between text-sm font-medium text-slate-600">
              <span>
                {checkedCount} / {totalChapters}장 완료
              </span>

              <span>{progress}%</span>
            </div>

            <div className="h-3 overflow-hidden rounded-full bg-slate-200">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-red-400 via-amber-400 via-emerald-400 via-sky-400 to-violet-500"
                initial={false}
                animate={{ width: `${progress}%` }}
                transition={{
                  type: "spring",
                  stiffness: 80,
                  damping: 18,
                }}
              />
            </div>
          </div>
        </header>

        <main className="space-y-4">
          {books.map((book) => {
            const color = hslForBook(book.index);

            const bookChecked = Array.from(
              { length: book.chapters },
              (_, i) => checked[storageKey(book.index, i + 1)]
            ).filter(Boolean).length;

            return (
              <Card
                key={book.index}
                className="overflow-hidden rounded-3xl border-0 shadow-sm"
              >
                <CardContent className="p-3 sm:p-4 md:p-6">
                  <div className="mb-4 flex flex-wrap items-center gap-3">
                    <div
                      className="h-4 w-4 rounded-full"
                      style={{ backgroundColor: color }}
                    />

                    <h2 className="text-xl font-bold">{book.name}</h2>

                    <span className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600">
                      {bookChecked}/{book.chapters}
                    </span>
                  </div>

                  <div className="flex flex-col gap-2">
                    {Array.from(
                      { length: Math.ceil(book.chapters / columns) },
                      (_, rowIndex) => {
                        const start = rowIndex * columns + 1;
                        const end = Math.min(
                          start + columns - 1,
                          book.chapters
                        );

                        return (
                          <div
                            key={rowIndex}
                            className="grid gap-[clamp(0.2rem,1vw,0.5rem)]"
                            style={{
                              gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
                            }}
                          >
                            {Array.from(
                              { length: end - start + 1 },
                              (_, i) => {
                                const chapter = start + i;
                                const key = storageKey(book.index, chapter);
                                const isChecked = !!checked[key];

                                return (
                                  <motion.button
                                    key={key}
                                    type="button"
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() =>
                                      toggleChapter(book.index, chapter)
                                    }
                                    className={`relative flex aspect-square w-full items-center justify-center rounded-full border-[clamp(1px,0.45vw,2px)] font-bold transition ${
                                      sizeMode === "large"
                                        ? "text-[clamp(0.95rem,4vw,1.4rem)]"
                                        : "text-[clamp(0.62rem,2.9vw,0.95rem)]"
                                    }`}
                                    style={{
                                      borderColor: color,
                                      backgroundColor: isChecked
                                        ? color
                                        : "white",
                                      color: isChecked ? "white" : color,
                                      boxShadow: isChecked
                                        ? `0 8px 18px ${color}33`
                                        : "none",
                                    }}
                                  >
                                    {isChecked && (
                                      <CheckCircle2 className="absolute h-5 w-5 opacity-20" />
                                    )}

                                    <span>{chapter}</span>
                                  </motion.button>
                                );
                              }
                            )}
                          </div>
                        );
                      }
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </main>

        <footer className="pb-6 pt-2 text-center text-sm text-slate-400">
          <p>
            Made by Rudckshim ·{" "}
            <a
              href="https://github.com/rudckshim"
              target="_blank"
              rel="noopener noreferrer"
              className="transition hover:text-slate-600"
            >
              GitHub
            </a>
          </p>
        </footer>
        {showInstallGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          
            <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
                
              <h2 className="text-xl font-bold text-slate-900">
                아이폰 앱 설치 방법
              </h2>
                
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                아래 순서대로 진행하면 홈 화면에서 앱처럼 사용할 수 있어요.
              </p>
                
              <div className="mt-5 space-y-5">
                
                <div>
                  <p className="mb-2 text-sm font-semibold text-slate-800">
                    1. Safari 하단의 공유 버튼을 눌러주세요
                  </p>
                
                  <img
                    src="/install-step-1.png"
                    alt="공유 버튼 안내"
                    className="rounded-2xl border border-slate-200"
                  />
                </div>
                
                <div>
                  <p className="mb-2 text-sm font-semibold text-slate-800">
                    2. “홈 화면에 추가”를 선택해주세요
                  </p>
                
                  <img
                    src="/install-step-2.png"
                    alt="홈 화면 추가 안내"
                    className="rounded-2xl border border-slate-200"
                  />
                </div>
                
              </div>
                
              <button
                onClick={() =>
                  setShowInstallGuide(false)
                }
                className="mt-6 w-full rounded-2xl bg-slate-900 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
              >
                확인
              </button>
              
            </div>
          </div>
        )}
      </div>
    </div>
  );
}