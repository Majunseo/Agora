import { useEffect, useState } from "react";

/**
 * 최근 본 글. 로그인하지 않아도 쓸 수 있게 이 브라우저에 글 ID 만 남긴다.
 * 계정마다(손님은 guest) 따로 남겨, 같은 브라우저를 쓰는 다른 사람에게 섞여 보이지 않게 한다.
 * 저장이 막힌 브라우저(사생활 보호 모드 등)에서는 이번 방문 동안만 메모리에 둔다.
 */

const MAX = 10;
const EVENT = "agora:recent";
const memory = new Map<string, string[]>();

const keyOf = (owner: string | null | undefined) => `agora.recent.${owner ?? "guest"}`;

export function readRecent(owner: string | null | undefined): string[] {
  const key = keyOf(owner);
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return memory.get(key) ?? [];
    const value: unknown = JSON.parse(raw);
    return Array.isArray(value) ? value.filter((v): v is string => typeof v === "string").slice(0, MAX) : [];
  } catch {
    return memory.get(key) ?? [];
  }
}

function write(owner: string | null | undefined, ids: string[]): void {
  const key = keyOf(owner);
  memory.set(key, ids);
  try {
    localStorage.setItem(key, JSON.stringify(ids));
  } catch {
    // 저장이 막혀 있으면 메모리에 둔 것만 쓴다.
  }
  window.dispatchEvent(new Event(EVENT));
}

/** 방금 본 글을 맨 앞에 둔다. 이미 있으면 앞으로 옮긴다. */
export function pushRecent(owner: string | null | undefined, id: string): void {
  write(owner, [id, ...readRecent(owner).filter((x) => x !== id)].slice(0, MAX));
}

export function clearRecent(owner: string | null | undefined): void {
  write(owner, []);
}

/** 최근 본 글 ID. 이 탭이나 다른 탭에서 바뀌면 다시 읽는다. */
export function useRecentIds(owner: string | null | undefined): string[] {
  const [ids, setIds] = useState(() => readRecent(owner));
  useEffect(() => {
    const sync = () => setIds(readRecent(owner));
    sync();
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, [owner]);
  return ids;
}
