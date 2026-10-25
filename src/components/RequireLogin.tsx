import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useT } from "@/i18n";
import { useSession } from "@/lib/session";

/** 로그인해야 볼 수 있는 화면. 로그인하지 않았으면 로그인 화면으로 보냈다가 돌아온다. */
export function RequireLogin({ children }: { children: ReactNode }) {
  const t = useT();
  const { user, loading } = useSession();
  const location = useLocation();
  if (loading) return <p className="py-10 text-center text-sm text-muted">{t("불러오는 중…")}</p>;
  if (!user) return <Navigate replace to={`/login?next=${encodeURIComponent(location.pathname + location.search)}`} />;
  return <>{children}</>;
}
