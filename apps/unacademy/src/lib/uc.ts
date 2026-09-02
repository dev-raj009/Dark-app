/** Client-side API surface. It only ever knows about our own proxy endpoint. */

export type Teacher = {
  first_name?: string;
  last_name?: string;
  username?: string;
  avatar_v2?: string;
  avatar_v1?: string;
  avatar?: string;
  intro_photo?: string;
  topics_display?: string;
  followers_count?: number;
  bio?: string;
};

export type Course = {
  uid: string;
  name?: string;
  thumbnail?: string;
  thumbnailV1?: string;
  itemCount?: number;
  item_count?: number;
  languageDisplay?: string;
  language_display?: string;
};

export type Lecture = {
  title: string;
  author: string;
  started_at: string;
  pdf: string;
  video_url: string;
  token?: string | null;
};

async function call(params: Record<string, string | number>) {
  const q = new URLSearchParams(Object.entries(params).map(([k, v]) => [k, String(v)])).toString();
  const r = await fetch(`/api/public/uc?${q}`);
  if (!r.ok) throw new Error("Service unavailable");
  return r.json();
}

export const ucApi = {
  teachers: (goal_uid: string, offset = 0) =>
    call({ action: "teachers", goal_uid, offset }) as Promise<{
      results: Teacher[];
      count: number;
    }>,
  courses: (username: string, type: "popular" | "latest", offset = 0) =>
    call({ action: "courses", username: username.toLowerCase(), type, offset }) as Promise<{
      results: Course[];
      count: number;
    }>,
  lectures: (uid: string) => call({ action: "lectures", uid }) as Promise<{ results: Lecture[] }>,
};

export const teacherName = (t: Teacher) => `${t.first_name || ""} ${t.last_name || ""}`.trim();
export const teacherAvatar = (t: Teacher) =>
  t.avatar_v2 || t.avatar_v1 || t.avatar || t.intro_photo || "";

export const LINKS = {
  telegram: "https://t.me/unacademyfreebatches",
  whatsapp: "https://whatsapp.com/channel/0029Va4QUHW0LKZ5nAcbSk44",
};

export const GOALS: Record<string, [string, string]> = {
  KSCGY: ["UPSC Civil Services (IAS)", "🏛️"],
  TMUVD: ["JEE Main & Advanced", "⚗️"],
  YOTUH: ["NEET UG", "🧬"],
  VLEMN: ["SSC Exams", "📋"],
  MAFGF: ["GRE", "🌍"],
  XNDUS: ["CAT", "📊"],
  TEWDQ: ["NTA UGC NET", "🎓"],
  RTPSX: ["Bank Exams", "🏦"],
  BBKWG: ["CA (Chartered Accountancy)", "💼"],
  MRZFY: ["Law Entrance Exams", "⚖️"],
  DZVHL: ["IELTS", "🗣️"],
  GWDPV: ["MP PSC", "🗺️"],
  GNFFE: ["Maharashtra PSC", "🗺️"],
  FHWHO: ["Punjab PSC", "🗺️"],
  QJEJG: ["Railway Exams", "🚂"],
  SCANJ: ["Rajasthan PSC", "🗺️"],
  XCTVJ: ["UP PSC / UPSSSC", "🗺️"],
  EWFJR: ["English Language", "🔤"],
  NJHPJ: ["Campus Placements", "💻"],
  SUVLV: ["Class 9", "📚"],
  GSZGO: ["Class 10", "📚"],
  GWDPZ: ["Class 11", "📚"],
  DOZGI: ["Personal Development", "🌟"],
  ZISFF: ["Tamil Nadu PSC", "🗺️"],
  TUNWK: ["CDS / AFCAT / CAPF", "🪖"],
  LGQVU: ["GMAT", "📈"],
  PESHE: ["GATE", "⚙️"],
  LVECA: ["Karnataka PSC", "🗺️"],
  QKHZF: ["AP PSC / Telangana PSC", "🗺️"],
  NVLIA: ["GATE - CSIT, DSAI", "⚙️"],
  ZIUBD: ["Kerala PSC", "🗺️"],
  RJVOD: ["Gujarat PSC", "🗺️"],
  UQCMN: ["West Bengal PSC", "🗺️"],
  JJTHM: ["DSSSB", "🏙️"],
  BIZXQ: ["CSIR UGC NET", "🔬"],
  QOIVT: ["BPSC", "🗺️"],
  GMXMZ: ["TET", "👩‍🏫"],
  IFKUZ: ["UPTET", "👩‍🏫"],
  PLWCX: ["Class 12 Board", "📚"],
  XTKHH: ["OPSC", "🗺️"],
  ZKXEQ: ["Haryana PSC", "🗺️"],
  EGKYI: ["Jammu & Kashmir PSC", "🗺️"],
  SIFWL: ["IIT JAM", "🔭"],
  SDDOC: ["NEET PG", "🩺"],
  WXKBF: ["MP TET", "👩‍🏫"],
  AELON: ["Jharkhand PSC", "🗺️"],
  DOKOV: ["Programming", "💻"],
  MCRYW: ["Company Secretary", "📑"],
  SWBEI: ["Rajasthan TET", "👩‍🏫"],
  WJWZU: ["Haryana TET", "👩‍🏫"],
  DANNJ: ["NDA / Airforce X-Y / Navy", "✈️"],
  JXGKD: ["HPPSC", "🗺️"],
  QFJOA: ["Engineering Services Exam", "🔧"],
  TPSBK: ["Foundation NTSE", "🏆"],
};

export const goalName = (uid: string) => GOALS[uid]?.[0] ?? "Goal";
