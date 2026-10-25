import { useEffect, useState } from "react";

/**
 * 화면에서 결함 토글을 읽는다. Maison 의 useBugs 와 같은 역할이다.
 * 토글은 서버의 환경변수로 정해지므로 /api/bugs 로 한 번 받아온다.
 * 아직 못 받았으면 빈 목록 — 즉 기본은 정상 동작이다.
 */

let cache: Promise<string[]> | null = null;

function loadEnabled(): Promise<string[]> {
  cache ??= fetch("/api/bugs")
    .then((r) => r.json())
    .then((d: { enabled?: string[] }) => d.enabled ?? [])
    .catch(() => []);
  return cache;
}

export function useEnabledBugs(): string[] {
  const [list, setList] = useState<string[]>([]);
  useEffect(() => {
    let alive = true;
    loadEnabled().then((l) => alive && setList(l));
    return () => {
      alive = false;
    };
  }, []);
  return list;
}

/** const bugF1 = useBug("F1"); */
export function useBug(id: string): boolean {
  return useEnabledBugs().includes(id);
}

/** 켜진 목록을 <body data-bugs="U1 U2"> 로 찍는다. CSS 결함이 이 속성에 걸린다. */
export function useBugBodyAttribute(): void {
  const enabled = useEnabledBugs();
  useEffect(() => {
    if (enabled.length === 0) document.body.removeAttribute("data-bugs");
    else document.body.setAttribute("data-bugs", enabled.join(" "));
  }, [enabled]);
}
