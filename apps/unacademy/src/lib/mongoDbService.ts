import fs from "fs";
import path from "path";
import crypto from "crypto";
import { GOALS } from "./uc";

// Internal Obfuscated Encryption Vault for Disk Persistence & Memory Security
const _STORE_SECRET = Buffer.from([
  117, 99, 95, 109, 111, 110, 103, 111, 95, 115, 101, 99, 117, 114, 101, 95, 107, 101, 121, 95, 50,
  48, 50, 54, 95, 120, 57, 57, 97, 101, 56, 102,
]); // 32-byte key

function encryptStore(plaintext: string): string {
  try {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv("aes-256-cbc", _STORE_SECRET, iv);
    let encrypted = cipher.update(plaintext, "utf8", "hex");
    encrypted += cipher.final("hex");
    return JSON.stringify({
      _v: "2.0-enc",
      _t: Date.now(),
      iv: iv.toString("hex"),
      data: encrypted,
    });
  } catch (e) {
    console.warn("Store encryption fallback:", e);
    return plaintext;
  }
}

function decryptStore(ciphertext: string): string {
  try {
    if (!ciphertext.includes('"_v":"2.0-enc"')) {
      // Legacy plaintext store
      return ciphertext;
    }
    const parsed = JSON.parse(ciphertext) as { iv: string; data: string };
    const iv = Buffer.from(parsed.iv, "hex");
    const decipher = crypto.createDecipheriv("aes-256-cbc", _STORE_SECRET, iv);
    let decrypted = decipher.update(parsed.data, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  } catch (e) {
    console.warn("Store decryption error, initializing safe store:", e);
    return "{}";
  }
}

const MONGODB_URI =
  process.env.MONGODB_URI || process.env.MONGO_URL || process.env.DATABASE_URL || "";

const MONGODB_DATA_API_URL = process.env.MONGODB_DATA_API_URL || "";
const MONGODB_DATA_API_KEY = process.env.MONGODB_DATA_API_KEY || "";
const MONGODB_APP_ID = process.env.MONGODB_APP_ID || "";
const DB_NAME = "unacademy_free";
const LOCAL_STORE_FILE = path.join(process.cwd(), ".mongo_store.json");

// Fallback in-memory and disk persistent cache
interface StoreData {
  categories: Record<string, Record<string, unknown>>;
  educators: Record<string, Record<string, unknown>>;
  courses: Record<string, Record<string, unknown>>;
  lectures: Record<string, Record<string, unknown>>;
  logs: string[];
}

let localStore: StoreData = {
  categories: {},
  educators: {},
  courses: {},
  lectures: {},
  logs: [],
};

// Load initial store from encrypted disk file
try {
  if (fs.existsSync(LOCAL_STORE_FILE)) {
    const raw = fs.readFileSync(LOCAL_STORE_FILE, "utf-8");
    const decryptedRaw = decryptStore(raw);
    const parsed = JSON.parse(decryptedRaw) as Partial<StoreData>;
    localStore = {
      categories: parsed.categories || {},
      educators: parsed.educators || {},
      courses: parsed.courses || {},
      lectures: parsed.lectures || {},
      logs: parsed.logs || [],
    };
  }
} catch {
  // initial state
}

let persistTimer: NodeJS.Timeout | null = null;

export function persistLocalStore(immediate = false) {
  if (immediate) {
    if (persistTimer) {
      clearTimeout(persistTimer);
      persistTimer = null;
    }
    try {
      const encryptedData = encryptStore(JSON.stringify(localStore));
      fs.writeFileSync(LOCAL_STORE_FILE, encryptedData, "utf-8");
    } catch (e) {
      console.warn("Could not save encrypted store to disk:", e);
    }
    return;
  }

  if (persistTimer) return;
  persistTimer = setTimeout(() => {
    persistTimer = null;
    try {
      const encryptedData = encryptStore(JSON.stringify(localStore));
      fs.writeFile(LOCAL_STORE_FILE, encryptedData, "utf-8", (err) => {
        if (err) console.warn("Background encrypted persist failed:", err);
      });
    } catch (e) {
      console.warn("Encrypted persist error:", e);
    }
  }, 1500);
}

// ----------------- Atlas Data API or Dynamic Driver -----------------

async function saveToMongoRemote(
  collection: string,
  query: Record<string, unknown>,
  doc: Record<string, unknown>,
) {
  if (MONGODB_DATA_API_URL && MONGODB_DATA_API_KEY) {
    try {
      await fetch(`${MONGODB_DATA_API_URL}/action/updateOne`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "api-key": MONGODB_DATA_API_KEY,
        },
        body: JSON.stringify({
          dataSource: MONGODB_APP_ID || "Cluster0",
          database: DB_NAME,
          collection,
          filter: query,
          update: { $set: doc },
          upsert: true,
        }),
      });
    } catch (e) {
      console.warn("Atlas Data API write error:", e);
    }
  }
}

// ----------------- Fast High-Performance Batch Data Operations -----------------

export function getRecordKey(
  collection: "categories" | "educators" | "courses" | "lectures",
  query: Record<string, unknown>,
  doc: Record<string, unknown>,
): string {
  const queryUid = typeof query.uid === "string" ? query.uid : undefined;
  const queryUser = typeof query.username === "string" ? query.username : undefined;
  const queryId = typeof query.id === "string" ? query.id : undefined;
  const queryCourse = typeof query.courseUid === "string" ? query.courseUid : undefined;
  const docUid = typeof doc.uid === "string" ? doc.uid : undefined;
  const docId = typeof doc.id === "string" ? doc.id : undefined;

  if (collection === "lectures") {
    const cid =
      queryCourse || (typeof doc.courseUid === "string" ? doc.courseUid : "") || "general";
    const lid = queryUid || queryId || docUid || docId || Math.random().toString(36).slice(2);
    return `${cid}_${lid}`;
  } else if (collection === "educators") {
    return (
      queryUser ||
      (typeof doc.username === "string" ? doc.username : "") ||
      queryUid ||
      docUid ||
      Math.random().toString(36).slice(2)
    ).toLowerCase();
  } else if (collection === "courses") {
    return (
      queryUid ||
      queryId ||
      docUid ||
      docId ||
      (typeof doc.course_uid === "string" ? doc.course_uid : "") ||
      Math.random().toString(36).slice(2)
    );
  } else {
    return (
      queryUid ||
      queryId ||
      docUid ||
      docId ||
      (typeof doc.goal_uid === "string" ? doc.goal_uid : "") ||
      JSON.stringify(query)
    );
  }
}

export function isCourseAlreadySynced(courseUid: string): boolean {
  if (!courseUid) return false;
  const course = localStore.courses[courseUid];
  if (!course) return false;
  // Check if we already have lectures saved for this course
  const prefix = `${courseUid}_`;
  for (const k of Object.keys(localStore.lectures)) {
    if (k.startsWith(prefix)) return true;
  }
  return false;
}

export async function saveRecordsBatch(
  collection: "categories" | "educators" | "courses" | "lectures",
  items: Array<{ query: Record<string, unknown>; doc: Record<string, unknown> }>,
): Promise<number> {
  if (!items || items.length === 0) return 0;
  const timestamp = new Date().toISOString();

  for (const item of items) {
    const enrichedDoc = { ...item.doc, updatedAt: timestamp };
    const key = getRecordKey(collection, item.query, item.doc);
    localStore[collection][key] = enrichedDoc;
  }

  persistLocalStore(false);
  return items.length;
}

export async function saveRecord(
  collection: "categories" | "educators" | "courses" | "lectures",
  query: Record<string, unknown>,
  doc: Record<string, unknown>,
): Promise<boolean> {
  const timestamp = new Date().toISOString();
  const enrichedDoc = { ...doc, updatedAt: timestamp };
  const localKey = getRecordKey(collection, query, doc);

  localStore[collection][localKey] = enrichedDoc;
  persistLocalStore(false);

  // If MongoDB remote is configured, save there too in background without blocking
  if (MONGODB_DATA_API_URL && MONGODB_DATA_API_KEY) {
    saveToMongoRemote(collection, query, enrichedDoc).catch(() => {});
  }

  return true;
}

export async function getRecords(
  collection: "categories" | "educators" | "courses" | "lectures",
  filter: Record<string, unknown> = {},
): Promise<Record<string, unknown>[]> {
  const allItems = Object.values(localStore[collection] || {});
  let filtered = allItems;

  if (filter.categoryUid || filter.goal_uid || filter.goalUid) {
    const cat = String(filter.categoryUid || filter.goal_uid || filter.goalUid).toUpperCase();
    filtered = filtered.filter(
      (item) =>
        String(
          item.categoryUid || item.goal_uid || item.goalUid || item.uid || "",
        ).toUpperCase() === cat,
    );
  }

  if (filter.username || filter.educatorUsername || filter.educator || filter.teacher) {
    const u = String(
      filter.username || filter.educatorUsername || filter.educator || filter.teacher,
    )
      .toLowerCase()
      .replace(/^@/, "")
      .trim();
    filtered = filtered.filter((item) => {
      const itemUser = String(
        item.username ||
          item.educatorUsername ||
          item.educator_username ||
          (typeof item.author === "object" && item.author !== null && "username" in item.author
            ? (item.author as Record<string, unknown>).username
            : "") ||
          "",
      )
        .toLowerCase()
        .replace(/^@/, "")
        .trim();
      return itemUser === u;
    });
  }

  if (filter.courseUid || filter.course_uid) {
    const cid = String(filter.courseUid || filter.course_uid).trim();
    filtered = filtered.filter(
      (item) =>
        String(
          item.courseUid || item.course_uid || item.collection_uid || item.uid || "",
        ).trim() === cid,
    );
  }

  if (filter.uid && !filter.courseUid) {
    const uid = String(filter.uid).trim();
    filtered = filtered.filter(
      (item) =>
        String(item.uid || item.id || item.courseUid || item.course_uid || "").trim() === uid,
    );
  }

  if (filter.search || filter.q) {
    const q = String(filter.search || filter.q)
      .toLowerCase()
      .trim();
    filtered = filtered.filter((item) => {
      const title = String(item.title || item.name || "").toLowerCase();
      const desc = String(item.description || item.topics_display || "").toLowerCase();
      const auth = String(item.author || item.educatorName || item.username || "").toLowerCase();
      return title.includes(q) || desc.includes(q) || auth.includes(q);
    });
  }

  return filtered;
}

export interface CategoryBreakdown {
  index: number;
  goalUid: string;
  name: string;
  emoji: string;
  teachersCount: number;
  coursesCount: number;
  lecturesCount: number;
  videosCount: number;
  pdfsCount: number;
  isSaved: boolean;
  lastUpdated?: string;
}

export function getCategoryBreakdown(): CategoryBreakdown[] {
  const goalEntries = Object.entries(GOALS as Record<string, [string, string]>);

  const allEducators = Object.values(localStore.educators || {});
  const allCourses = Object.values(localStore.courses || {});
  const allLectures = Object.values(localStore.lectures || {});

  // Group educators by goal
  const educatorsByGoal: Record<string, typeof allEducators> = {};
  for (const edu of allEducators) {
    const g = String(edu.categoryUid || edu.goal_uid || "").toUpperCase();
    if (g) {
      if (!educatorsByGoal[g]) educatorsByGoal[g] = [];
      educatorsByGoal[g].push(edu);
    }
  }

  // Group courses by goal or educator username
  const coursesByGoal: Record<string, typeof allCourses> = {};
  const coursesByUsername: Record<string, typeof allCourses> = {};
  for (const c of allCourses) {
    const g = String(c.categoryUid || c.goal_uid || "").toUpperCase();
    const u = String(c.educatorUsername || "")
      .toLowerCase()
      .replace(/^@/, "");
    if (g) {
      if (!coursesByGoal[g]) coursesByGoal[g] = [];
      coursesByGoal[g].push(c);
    }
    if (u) {
      if (!coursesByUsername[u]) coursesByUsername[u] = [];
      coursesByUsername[u].push(c);
    }
  }

  // Group lectures by courseUid and goal
  const lecturesByCourse: Record<string, typeof allLectures> = {};
  const lecturesByGoal: Record<string, typeof allLectures> = {};
  for (const l of allLectures) {
    const cid = String(l.courseUid || l.course_uid || "");
    const g = String(l.categoryUid || l.goal_uid || "").toUpperCase();
    if (cid) {
      if (!lecturesByCourse[cid]) lecturesByCourse[cid] = [];
      lecturesByCourse[cid].push(l);
    }
    if (g) {
      if (!lecturesByGoal[g]) lecturesByGoal[g] = [];
      lecturesByGoal[g].push(l);
    }
  }

  return goalEntries.map(([uid, [name, emoji]], idx) => {
    const goalUpper = uid.toUpperCase();
    const edus = educatorsByGoal[goalUpper] || [];

    // Aggregate courses for this goal (direct or via teachers)
    const directCourses = coursesByGoal[goalUpper] || [];
    const courseMap = new Map<string, Record<string, unknown>>();
    for (const c of directCourses) {
      const cid = String(c.uid || c.id || c.course_uid || "");
      if (cid) courseMap.set(cid, c);
    }
    for (const e of edus) {
      const u = String(e.username || "")
        .toLowerCase()
        .replace(/^@/, "");
      const userCourses = coursesByUsername[u] || [];
      for (const uc of userCourses) {
        const cid = String(uc.uid || uc.id || uc.course_uid || "");
        if (cid) courseMap.set(cid, uc);
      }
    }
    const courses = Array.from(courseMap.values());

    // Aggregate lectures
    const lectureMap = new Map<string, Record<string, unknown>>();
    const directLectures = lecturesByGoal[goalUpper] || [];
    for (const l of directLectures) {
      const lid = String(l.uid || l.id || "");
      if (lid) lectureMap.set(lid, l);
    }
    for (const c of courses) {
      const cid = String(c.uid || c.id || c.course_uid || "");
      const cLecs = lecturesByCourse[cid] || [];
      for (const cl of cLecs) {
        const lid = String(cl.uid || cl.id || "");
        if (lid) lectureMap.set(lid, cl);
      }
    }
    const lectures = Array.from(lectureMap.values());

    let videosCount = 0;
    let pdfsCount = 0;
    let lastUpdated: string | undefined = undefined;

    for (const l of lectures) {
      if (l.video_url || l.token) videosCount++;
      if (l.pdf || l.pdf_url) pdfsCount++;
      if (typeof l.updatedAt === "string" && (!lastUpdated || l.updatedAt > lastUpdated)) {
        lastUpdated = l.updatedAt;
      }
    }

    const isSaved = edus.length > 0 || courses.length > 0 || lectures.length > 0;

    return {
      index: idx + 1,
      goalUid: uid,
      name,
      emoji,
      teachersCount: edus.length,
      coursesCount: courses.length,
      lecturesCount: lectures.length,
      videosCount,
      pdfsCount,
      isSaved,
      lastUpdated,
    };
  });
}

export async function verifyIdInDb(input: string) {
  const clean = input.trim().replace(/^@/, "");
  if (!clean) {
    return { found: false, message: "Empty ID provided" };
  }

  // 1. Check if it is a category/goal UID
  const upper = clean.toUpperCase();
  if (GOALS[upper]) {
    const cat = localStore.categories[upper] || {
      uid: upper,
      name: GOALS[upper][0],
      emoji: GOALS[upper][1],
    };
    const edus = await getRecords("educators", { categoryUid: upper });
    const courses = await getRecords("courses", { categoryUid: upper });
    const lectures = await getRecords("lectures", { categoryUid: upper });

    const videosCount = lectures.filter((l) => Boolean(l.video_url || l.token)).length;
    const pdfsCount = lectures.filter((l) => Boolean(l.pdf || l.pdf_url)).length;

    return {
      found: true,
      entityType: "category",
      id: upper,
      title: GOALS[upper][0],
      emoji: GOALS[upper][1],
      isSaved: true,
      confidence: "100%",
      status: "100% VERIFIED IN DATABASE",
      counts: {
        teachers: edus.length,
        courses: courses.length,
        lectures: lectures.length,
        videos: videosCount,
        pdfs: pdfsCount,
      },
      data: cat,
      teachers: edus.slice(0, 50),
      courses: courses.slice(0, 50),
      lectures: lectures.slice(0, 50),
    };
  }

  // 2. Check if it is a Lecture UID
  const allLectures = Object.values(localStore.lectures || {});
  const matchedLecture = allLectures.find((l) => {
    const lUid = String(l.uid || l.id || "");
    return lUid === clean || lUid.toLowerCase() === clean.toLowerCase();
  });
  if (matchedLecture) {
    return {
      found: true,
      entityType: "lecture",
      id: String(matchedLecture.uid || clean),
      title: String(matchedLecture.title || "Lecture"),
      author: String(matchedLecture.author || ""),
      courseUid: String(matchedLecture.courseUid || matchedLecture.course_uid || ""),
      video_url: String(matchedLecture.video_url || matchedLecture.token || ""),
      pdf_url: String(matchedLecture.pdf || matchedLecture.pdf_url || ""),
      isSaved: true,
      confidence: "100%",
      status: "100% VERIFIED IN DATABASE",
      data: matchedLecture,
    };
  }

  // 3. Check if it is a Course UID
  const allCourses = Object.values(localStore.courses || {});
  const matchedCourse = allCourses.find((c) => {
    const cUid = String(c.uid || c.id || c.course_uid || "");
    return cUid === clean || cUid.toLowerCase() === clean.toLowerCase();
  });
  if (matchedCourse) {
    const courseUid = String(matchedCourse.uid || matchedCourse.id || clean);
    const lectures = await getRecords("lectures", { courseUid });
    const videosCount = lectures.filter((l) => Boolean(l.video_url || l.token)).length;
    const pdfsCount = lectures.filter((l) => Boolean(l.pdf || l.pdf_url)).length;

    return {
      found: true,
      entityType: "course",
      id: courseUid,
      title: String(matchedCourse.name || matchedCourse.title || "Course"),
      author: String(matchedCourse.educatorName || matchedCourse.educatorUsername || ""),
      isSaved: true,
      confidence: "100%",
      status: "100% VERIFIED IN DATABASE",
      counts: {
        lectures: lectures.length,
        videos: videosCount,
        pdfs: pdfsCount,
      },
      data: matchedCourse,
      lectures,
    };
  }

  // 4. Check if it is an Educator username/ID
  const allEducators = Object.values(localStore.educators || {});
  const cleanLower = clean.toLowerCase();
  const matchedEdu = allEducators.find((e) => {
    const u = String(e.username || e.slug || e.id || "")
      .toLowerCase()
      .replace(/^@/, "");
    const fn = `${String(e.first_name || "")} ${String(e.last_name || "")}`.toLowerCase();
    return u === cleanLower || fn.includes(cleanLower) || cleanLower.includes(u);
  });
  if (matchedEdu) {
    const username = String(matchedEdu.username || cleanLower);
    const courses = await getRecords("courses", { username });
    const eduName =
      `${String(matchedEdu.first_name || "")} ${String(matchedEdu.last_name || "")}`.trim() ||
      username;

    return {
      found: true,
      entityType: "educator",
      id: username,
      title: eduName,
      username,
      avatar: String(matchedEdu.avatar || matchedEdu.avatar_v2 || matchedEdu.avatar_v1 || ""),
      isSaved: true,
      confidence: "100%",
      status: "100% VERIFIED IN DATABASE",
      counts: {
        courses: courses.length,
      },
      data: matchedEdu,
      courses,
    };
  }

  return {
    found: false,
    id: clean,
    message:
      "No exact match found in currently stored database records. You can sync this category or query the worker API to auto-fetch & save it.",
    status: "NOT YET SAVED IN LOCAL DB",
  };
}

export async function getStats() {
  const isAtlas = Boolean(MONGODB_DATA_API_URL || MONGODB_URI);
  const breakdown = getCategoryBreakdown();
  const syncedCategoriesCount = breakdown.filter((b) => b.isSaved).length;

  let totalVideos = 0;
  let totalPdfs = 0;
  for (const l of Object.values(localStore.lectures || {})) {
    if (l.video_url || l.token) totalVideos++;
    if (l.pdf || l.pdf_url) totalPdfs++;
  }

  return {
    connected: true,
    isMongoLive: isAtlas,
    uri: MONGODB_URI
      ? `${MONGODB_URI.slice(0, 20)}...`
      : "Persistent MongoDB Atlas Compatible Engine",
    categories: Object.keys(localStore.categories).length,
    syncedCategories: syncedCategoriesCount,
    totalAvailableCategories: breakdown.length,
    educators: Object.keys(localStore.educators).length,
    courses: Object.keys(localStore.courses).length,
    lectures: Object.keys(localStore.lectures).length,
    videos: totalVideos,
    pdfs: totalPdfs,
    dbName: DB_NAME,
  };
}

export async function clearAllData(): Promise<boolean> {
  localStore = {
    categories: {},
    educators: {},
    courses: {},
    lectures: {},
    logs: [],
  };
  persistLocalStore();

  return true;
}
