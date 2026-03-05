import { INSTANCES } from "./instances";

const AUTH_KEY = "naradai_auth";

export type AllowedInstances = "all" | string[];

export interface AuthUser {
  username: string;
  displayName?: string;
  allowedInstanceIds: AllowedInstances;
}

interface StoredSession {
  username: string;
  displayName?: string;
  allowedInstanceIds: AllowedInstances;
}

const DEMO_USERS: Record<
  string,
  { password: string; displayName?: string; allowedInstanceIds: AllowedInstances }
> = {
  admin: {
    password: "admin",
    displayName: "Administrator",
    allowedInstanceIds: "all",
  },
  admin_kapal_api: {
    password: "kapalapi_2026",
    displayName: "Admin Kapal Api",
    allowedInstanceIds: ["kapal_api_12_19_feb_2026", "kopi_good_day_12_19_feb_2026", "kopi_abc_12_19_feb_2026", "kopi_fresco_12_19_feb_2026", "excelso_12_19_feb_2026", "kopi_kapten_12_19_feb_2026", "unakaffe_12_19_feb_2026", "kopi_pikopi_12_19_feb_2026", "kopi_ya_12_19_feb_2026", "pt_santos_jaya_abadi_12_19_feb_2026", "good_day_x_babymonster_feb_2026", "kacc_12_19_feb_2026", "krim_kafe_12_19_feb_2026"],
  },
  admin_bukalapak: {
    password: "bukalapak_2026",
    displayName: "Admin Bukalapak",
    allowedInstanceIds: ["bukalapak"],
  },
  admin_benings: {
    password: "benings2026",
    displayName: "Admin Benings",
    allowedInstanceIds: ["benings_brand_analysis_01_2026"],
  },
};

function storeSession(session: StoredSession): boolean {
  try {
    localStorage.setItem(AUTH_KEY, JSON.stringify(session));
    return true;
  } catch {
    return false;
  }
}

export function login(username: string, password: string): boolean {
  const u = (username ?? "").trim().toLowerCase();
  const p = password ?? "";
  if (!u || !p) return false;
  const userConfig = DEMO_USERS[u];
  if (!userConfig || userConfig.password !== p) return false;
  return storeSession({
    username: u,
    displayName: userConfig.displayName,
    allowedInstanceIds: userConfig.allowedInstanceIds,
  });
}

export function logout(): void {
  try {
    localStorage.removeItem(AUTH_KEY);
  } catch {
    // ignore
  }
}

export function isAuthenticated(): boolean {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    if (!raw) return false;
    JSON.parse(raw);
    return true;
  } catch {
    return false;
  }
}

export function getAuthUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as StoredSession;
    if (!data?.username) return null;
    return {
      username: data.username,
      displayName: data.displayName,
      allowedInstanceIds: data.allowedInstanceIds ?? "all",
    };
  } catch {
    return null;
  }
}

export function getAllowedInstanceIds(): string[] {
  const user = getAuthUser();
  if (!user) return [];
  if (user.allowedInstanceIds === "all") return INSTANCES.map((i) => i.id);
  const set = new Set(user.allowedInstanceIds);
  return INSTANCES.filter((i) => set.has(i.id)).map((i) => i.id);
}

export function getDemoAccounts(): { username: string; password: string; role: string }[] {
  return Object.entries(DEMO_USERS).map(([username, config]) => {
    const ids = config.allowedInstanceIds;
    const role =
      ids === "all"
        ? "All instances"
        : ids.length === 1
          ? "Single instance"
          : "Multiple instances";
    return { username, password: config.password, role };
  });
}
