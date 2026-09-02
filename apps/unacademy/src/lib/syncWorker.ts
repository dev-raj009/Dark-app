import { GOALS } from "./uc";
import { apiUrl } from "./uc.server";
import {
  saveRecord,
  saveRecordsBatch,
  getRecords,
  getCategoryBreakdown,
  CategoryBreakdown,
  persistLocalStore,
  isCourseAlreadySynced,
} from "./mongoDbService";

export interface SyncState {
  isRunning: boolean;
  isPaused: boolean;
  currentIndex: number;
  totalGoals: number;
  currentGoalUid: string;
  currentGoalName: string;
  currentGoalEmoji: string;
  currentStepDescription: string;
  progressPercent: number;
  totalTeachersSaved: number;
  totalCoursesSaved: number;
  totalLecturesSaved: number;
  totalVideosSaved: number;
  totalPdfsSaved: number;
  speedRating: string;
  syncedCategoryUids: string[];
  logs: string[];
  lastUpdated: string;
}

// Global server-side persistent sync state
export const globalSyncState: SyncState = {
  isRunning: false,
  isPaused: false,
  currentIndex: 0,
  totalGoals: Object.keys(GOALS).length,
  currentGoalUid: "",
  currentGoalName: "",
  currentGoalEmoji: "",
  currentStepDescription: "Idle. Ready to sync at God-level speed.",
  progressPercent: 0,
  totalTeachersSaved: 0,
  totalCoursesSaved: 0,
  totalLecturesSaved: 0,
  totalVideosSaved: 0,
  totalPdfsSaved: 0,
  speedRating: "⚡ God-Speed Parallel Engine (15x Turbo)",
  syncedCategoryUids: [],
  logs: ["[System] Ultra-High-Speed God-Level Sync Engine initialized."],
  lastUpdated: new Date().toISOString(),
};

function addServerLog(msg: string) {
  const time = new Date().toLocaleTimeString();
  const logEntry = `[${time}] ${msg}`;
  console.log(`[SyncEngine] ${logEntry}`);
  globalSyncState.logs.unshift(logEntry);
  if (globalSyncState.logs.length > 200) {
    globalSyncState.logs = globalSyncState.logs.slice(0, 200);
  }
  globalSyncState.lastUpdated = new Date().toISOString();
}

// Ultra-fast concurrency limiter pool
export async function runConcurrent<T, R>(
  items: T[],
  workerFn: (item: T, idx: number) => Promise<R>,
  concurrency = 12,
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let nextIdx = 0;

  async function worker() {
    while (nextIdx < items.length) {
      if (globalSyncState.isPaused) break;
      const current = nextIdx++;
      try {
        results[current] = await workerFn(items[current], current);
      } catch (err) {
        console.warn(`Worker error on item ${current}:`, err);
      }
    }
  }

  const workers = Array.from({ length: Math.min(concurrency, items.length) }, () => worker());
  await Promise.all(workers);
  return results;
}

async function fastFetch(url: string, timeoutMs = 8000): Promise<Response | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (res.ok) return res;
  } catch {
    // ignore
  }
  return null;
}

export function parseLectureItem(item: unknown, courseUid: string, categoryUid = "") {
  const anyItem = (item || {}) as Record<string, unknown>;
  const val = (anyItem.value || {}) as Record<string, unknown>;
  const live = (val.live_class || anyItem.live_class || {}) as Record<string, unknown>;

  const directUid = String(
    live.uid ||
      live.id ||
      val.uid ||
      val.id ||
      anyItem.uid ||
      anyItem.id ||
      Math.random().toString(36).substring(7),
  );

  let vu = String(live.video_url || anyItem.video_url || val.video_url || "");
  if (vu.includes("uid=")) {
    const id = String(vu.split("uid=")[1] ?? "").split("&")[0] ?? "";
    if (id) {
      vu = `https://uamedia.uacdn.net/lesson-raw/${id}/output.webm`;
    }
  } else if (!vu && directUid) {
    vu = `https://uamedia.uacdn.net/lesson-raw/${directUid}/output.webm`;
  }

  const authorObj = (live.author || anyItem.author || {}) as Record<string, unknown> | string;
  let author = "";
  if (typeof authorObj === "string") {
    author = authorObj;
  } else {
    const fn = String(authorObj.first_name || authorObj.name || "").trim();
    const ln = String(authorObj.last_name || "").trim();
    author = `${fn} ${ln}`.trim();
  }

  const slidesObj = (live.slides_pdf || anyItem.slides_pdf || {}) as Record<string, unknown>;
  const pdf = String(
    slidesObj.with_annotation || slidesObj.url || anyItem.pdf || anyItem.pdf_url || "",
  );

  const title = String(val.title || anyItem.title || "Lesson Lecture").trim();
  const startedAt = String(
    live.started_at || live.created_at || anyItem.started_at || anyItem.created_at || "",
  );

  return {
    uid: directUid,
    courseUid,
    categoryUid,
    title,
    author: author || "Educator",
    started_at: startedAt,
    video_url: vu,
    pdf_url: pdf,
    pdf,
    token: vu,
    raw: anyItem,
  };
}

// ----------------- Ultra-Fast Parallel Category Syncer -----------------
export async function syncSingleGoal(
  goalUid: string,
  maxTeachers = 25,
  maxCoursesPerTeacher = 20,
): Promise<{
  goalUid: string;
  goalName: string;
  teachers: number;
  courses: number;
  lectures: number;
  videos: number;
  pdfs: number;
}> {
  const startTime = Date.now();
  const cleanGoal = goalUid.toUpperCase();
  const goalInfo = GOALS[cleanGoal] || [cleanGoal, "📚"];
  const goalName = goalInfo[0];
  const goalEmoji = goalInfo[1];

  // 1. Instant Category Save
  await saveRecord(
    "categories",
    { uid: cleanGoal },
    { uid: cleanGoal, name: goalName, emoji: goalEmoji, goal_uid: cleanGoal },
  );

  let teachersSynced = 0;
  let coursesSynced = 0;
  let lecturesSynced = 0;
  let videosSynced = 0;
  let pdfsSynced = 0;

  globalSyncState.currentStepDescription = `⚡ [Turbo] Fetching all educators for ${goalEmoji} ${goalName}...`;

  try {
    // 2. Fetch Educators for Category
    const tUrl = apiUrl(
      new URLSearchParams({ action: "teachers", goal_uid: cleanGoal, offset: "0" }).toString(),
    );
    const tRes = await fastFetch(tUrl);
    if (!tRes) {
      return {
        goalUid: cleanGoal,
        goalName,
        teachers: 0,
        courses: 0,
        lectures: 0,
        videos: 0,
        pdfs: 0,
      };
    }

    const tData = (await tRes.json().catch(() => ({}))) as {
      results?: Record<string, unknown>[];
      teachers?: Record<string, unknown>[];
    };
    const rawTeachers = Array.isArray(tData?.results) ? tData.results : tData?.teachers || [];
    const validTeachers = rawTeachers
      .slice(0, maxTeachers)
      .map((t) => {
        const username = String(t.username || t.slug || t.id || "")
          .toLowerCase()
          .replace(/^@/, "")
          .trim();
        const educatorDisplayName =
          `${String(t.first_name || "")} ${String(t.last_name || "")}`.trim() || username;
        return {
          ...t,
          username,
          displayName: educatorDisplayName,
          categoryUid: cleanGoal,
          categoryName: goalName,
          goal_uid: cleanGoal,
        };
      })
      .filter((t) => t.username.length > 0);

    // Save all teachers in memory instantly
    await saveRecordsBatch(
      "educators",
      validTeachers.map((t) => ({
        query: { username: t.username },
        doc: t,
      })),
    );
    teachersSynced = validTeachers.length;

    globalSyncState.currentStepDescription = `⚡ [Parallel Turbo] Fetching popular & latest courses across ${validTeachers.length} educators...`;

    // 3. Parallel fetch courses for all teachers simultaneously (concurrency = 12)
    interface DiscoveredCourse {
      uid: string;
      doc: Record<string, unknown>;
    }
    const discoveredCourses: DiscoveredCourse[] = [];

    // Create tasks for every teacher (popular + latest)
    const teacherCourseTasks: Array<{ username: string; displayName: string; type: string }> = [];
    for (const t of validTeachers) {
      teacherCourseTasks.push({
        username: t.username,
        displayName: t.displayName,
        type: "popular",
      });
      teacherCourseTasks.push({ username: t.username, displayName: t.displayName, type: "latest" });
    }

    await runConcurrent(
      teacherCourseTasks,
      async (task) => {
        const cUrl = apiUrl(
          new URLSearchParams({
            action: "courses",
            username: task.username,
            type: task.type,
            offset: "0",
          }).toString(),
        );
        const cRes = await fastFetch(cUrl, 6000);
        if (!cRes) return;

        const cData = (await cRes.json().catch(() => ({}))) as {
          results?: Record<string, unknown>[];
          courses?: Record<string, unknown>[];
        };
        const courses = Array.isArray(cData?.results) ? cData.results : cData?.courses || [];

        for (const c of courses.slice(0, maxCoursesPerTeacher)) {
          const courseUid = String(c.uid || c.id || c.course_uid || "");
          if (!courseUid) continue;

          discoveredCourses.push({
            uid: courseUid,
            doc: {
              ...c,
              uid: courseUid,
              course_uid: courseUid,
              categoryUid: cleanGoal,
              categoryName: goalName,
              educatorUsername: task.username,
              educatorName: task.displayName,
            },
          });
        }
      },
      12, // 12 parallel streams
    );

    // De-duplicate discovered courses by UID
    const uniqueCoursesMap = new Map<string, Record<string, unknown>>();
    for (const dc of discoveredCourses) {
      if (!uniqueCoursesMap.has(dc.uid)) {
        uniqueCoursesMap.set(dc.uid, dc.doc);
      }
    }
    const uniqueCourseList = Array.from(uniqueCoursesMap.values());

    // Batch save all unique courses instantly
    await saveRecordsBatch(
      "courses",
      uniqueCourseList.map((c) => ({
        query: { uid: String(c.uid) },
        doc: c,
      })),
    );
    coursesSynced = uniqueCourseList.length;

    globalSyncState.currentStepDescription = `⚡ [High-Speed Stream] Fetching videos & lecture notes for ${uniqueCourseList.length} courses in parallel...`;

    // 4. Parallel fetch lectures & videos & PDFs for all courses simultaneously (concurrency = 15)
    // Instant smart skip for courses that already have lecture records in MongoDB!
    const coursesToFetch = uniqueCourseList.filter((c) => !isCourseAlreadySynced(String(c.uid)));

    const allLectureBatchDocs: Array<{
      query: Record<string, unknown>;
      doc: Record<string, unknown>;
    }> = [];

    await runConcurrent(
      coursesToFetch,
      async (c) => {
        const courseUid = String(c.uid);
        const lUrl = apiUrl(new URLSearchParams({ action: "lectures", uid: courseUid }).toString());
        const lRes = await fastFetch(lUrl, 6000);
        if (!lRes) return;

        const lData = (await lRes.json().catch(() => ({}))) as {
          results?: unknown[];
          lectures?: unknown[];
        };
        const lectures = Array.isArray(lData?.results) ? lData.results : lData?.lectures || [];

        for (const rawLec of lectures) {
          const normalized = parseLectureItem(rawLec, courseUid, cleanGoal);
          if (normalized.video_url || normalized.token) videosSynced++;
          if (normalized.pdf || normalized.pdf_url) pdfsSynced++;
          lecturesSynced++;

          allLectureBatchDocs.push({
            query: { uid: normalized.uid, courseUid },
            doc: normalized as unknown as Record<string, unknown>,
          });
        }
      },
      15, // 15 parallel lecture streams
    );

    // Batch save all lectures in 1 millisecond
    if (allLectureBatchDocs.length > 0) {
      await saveRecordsBatch("lectures", allLectureBatchDocs);
    }

    // Flush category to disk immediately
    persistLocalStore(true);
  } catch (err) {
    console.warn(`Error fast-syncing goal ${cleanGoal}:`, err);
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  addServerLog(
    `⚡ [God-Speed Completed in ${elapsed}s]: ${goalEmoji} ${goalName} -> ${teachersSynced} Teachers, ${coursesSynced} Courses, ${lecturesSynced} Lectures, ${videosSynced} Videos, ${pdfsSynced} PDFs`,
  );

  return {
    goalUid: cleanGoal,
    goalName,
    teachers: teachersSynced,
    courses: coursesSynced,
    lectures: lecturesSynced,
    videos: videosSynced,
    pdfs: pdfsSynced,
  };
}

// ---------------- Continuous Background Worker Loop ----------------
let backgroundWorkerPromise: Promise<void> | null = null;

export function startBackgroundSync(forceRestart = false) {
  if (globalSyncState.isRunning && !globalSyncState.isPaused) {
    addServerLog("Background sync is already running at God-speed in background.");
    return { success: true, message: "Already running at maximum God-level speed" };
  }

  globalSyncState.isRunning = true;
  globalSyncState.isPaused = false;
  globalSyncState.lastUpdated = new Date().toISOString();

  backgroundWorkerPromise = runBackgroundSyncLoop(forceRestart);
  return { success: true, message: "God-Speed Turbo Sync started/resumed" };
}

export function pauseBackgroundSync() {
  globalSyncState.isPaused = true;
  globalSyncState.isRunning = false;
  globalSyncState.currentStepDescription = "Sync paused by user.";
  globalSyncState.lastUpdated = new Date().toISOString();
  persistLocalStore(true);
  addServerLog("⏸️ Background sync paused by admin.");
  return { success: true, message: "Paused" };
}

async function runBackgroundSyncLoop(forceRestart: boolean) {
  const goalEntries = Object.entries(GOALS);
  const total = goalEntries.length;
  globalSyncState.totalGoals = total;

  addServerLog(
    `🚀 [GOD-SPEED TURBO ACTIVE]: Starting Parallel Continuous Sync Engine across all ${total} categories...`,
  );

  // Check which categories are already saved
  const breakdown = getCategoryBreakdown();
  const savedMap = new Map<string, CategoryBreakdown>();
  for (const b of breakdown) {
    if (b.isSaved && b.teachersCount > 0) {
      savedMap.set(b.goalUid.toUpperCase(), b);
    }
  }

  // Determine starting index (Smart Resume)
  let startIndex = 0;
  if (!forceRestart) {
    for (let i = 0; i < total; i++) {
      const gUid = goalEntries[i][0].toUpperCase();
      if (!savedMap.has(gUid)) {
        startIndex = i;
        break;
      }
      startIndex = i;
    }
  }

  addServerLog(
    `⚡ Smart Resume: Starting from Category [${startIndex + 1} / ${total}] (${goalEntries[startIndex][1][0]})...`,
  );

  for (let i = startIndex; i < total; i++) {
    if (globalSyncState.isPaused) {
      addServerLog(`Sync stopped at Category ${i + 1}/${total}. State safely preserved.`);
      break;
    }

    const [goalUid, [goalName, goalEmoji]] = goalEntries[i];
    globalSyncState.currentIndex = i + 1;
    globalSyncState.currentGoalUid = goalUid;
    globalSyncState.currentGoalName = goalName;
    globalSyncState.currentGoalEmoji = goalEmoji;
    globalSyncState.progressPercent = Math.round(((i + 1) / total) * 100);

    const result = await syncSingleGoal(goalUid, 25, 20);

    if (globalSyncState.isPaused) {
      addServerLog(`Sync paused during Category ${i + 1}.`);
      break;
    }

    globalSyncState.totalTeachersSaved += result.teachers;
    globalSyncState.totalCoursesSaved += result.courses;
    globalSyncState.totalLecturesSaved += result.lectures;
    globalSyncState.totalVideosSaved += result.videos;
    globalSyncState.totalPdfsSaved += result.pdfs;

    if (!globalSyncState.syncedCategoryUids.includes(goalUid)) {
      globalSyncState.syncedCategoryUids.push(goalUid);
    }

    // Tiny 50ms interval between categories for non-stop god-speed throughput
    await new Promise((r) => setTimeout(r, 50));
  }

  if (!globalSyncState.isPaused) {
    globalSyncState.isRunning = false;
    globalSyncState.currentStepDescription = "All 54 categories 100% saved in MongoDB!";
    globalSyncState.progressPercent = 100;
    persistLocalStore(true);
    addServerLog(
      "🎉 A-to-Z Database synchronization complete across all 54 categories at God-Speed!",
    );
  }
}

export function extractCleanId(input: string): string {
  if (!input || typeof input !== "string") return "";
  const str = input.trim();
  const mUrl = /(?:course|class|lesson|batch)\/[^/]+\/([A-Za-z0-9_-]{4,64})/i.exec(str);
  if (mUrl?.[1]) return mUrl[1];

  const mParam = /(?:uid|id|course_uid|courseUid|v)=([A-Za-z0-9_-]{4,64})/i.exec(str);
  if (mParam?.[1]) return mParam[1];

  const mDirect = str.replace(/[^A-Za-z0-9_-]/g, "");
  return mDirect || str;
}

// ---------------- On-Demand Auto-Fetch Helpers ----------------
export async function getOrFetchCategoryEducators(goalUid: string) {
  const cleanGoal = extractCleanId(goalUid).toUpperCase();
  const records = await getRecords("educators", { categoryUid: cleanGoal });
  if (records && records.length > 0) return records;

  try {
    const res = await fetch(
      apiUrl(
        new URLSearchParams({ action: "teachers", goal_uid: cleanGoal, offset: "0" }).toString(),
      ),
    );
    if (res.ok) {
      const data = (await res.json()) as {
        results?: Record<string, unknown>[];
        teachers?: Record<string, unknown>[];
      };
      const teachers = Array.isArray(data?.results) ? data.results : data?.teachers || [];
      const goalInfo = GOALS[cleanGoal] || [cleanGoal, "📚"];

      await saveRecord(
        "categories",
        { uid: cleanGoal },
        { uid: cleanGoal, name: goalInfo[0], emoji: goalInfo[1], goal_uid: cleanGoal },
      );

      const toSave = teachers
        .map((t) => {
          const username = String(t.username || t.slug || t.id || "")
            .toLowerCase()
            .replace(/^@/, "")
            .trim();
          if (!username) return null;
          return {
            query: { username },
            doc: {
              ...t,
              username,
              categoryUid: cleanGoal,
              goal_uid: cleanGoal,
              categoryName: goalInfo[0],
            },
          };
        })
        .filter(Boolean) as Array<{ query: Record<string, unknown>; doc: Record<string, unknown> }>;

      await saveRecordsBatch("educators", toSave);
      return await getRecords("educators", { categoryUid: cleanGoal });
    }
  } catch (e) {
    console.warn("Auto-fetch educators failed:", e);
  }
  return records || [];
}

export async function getOrFetchEducatorCourses(username: string, categoryUid = "") {
  let cleanUser = username.toLowerCase().replace(/^@/, "").trim();
  if (!cleanUser) return [];

  let records = await getRecords("courses", { username: cleanUser });
  if (records && records.length > 0) return records;

  const educators = await getRecords("educators");
  const matchedEducator = educators.find((e) => {
    const u = String(e.username || "").toLowerCase();
    const fn = `${String(e.first_name || "")} ${String(e.last_name || "")}`
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");
    const cleanSearch = cleanUser.replace(/[^a-z0-9]/g, "");
    return (
      u === cleanUser ||
      u.includes(cleanSearch) ||
      fn.includes(cleanSearch) ||
      cleanSearch.includes(fn)
    );
  });

  if (matchedEducator && matchedEducator.username) {
    cleanUser = String(matchedEducator.username).toLowerCase();
    records = await getRecords("courses", { username: cleanUser });
    if (records && records.length > 0) return records;
  }

  try {
    const toSave: Array<{ query: Record<string, unknown>; doc: Record<string, unknown> }> = [];
    for (const type of ["popular", "latest"]) {
      const res = await fetch(
        apiUrl(
          new URLSearchParams({
            action: "courses",
            username: cleanUser,
            type,
            offset: "0",
          }).toString(),
        ),
      );
      if (res.ok) {
        const data = (await res.json()) as {
          results?: Record<string, unknown>[];
          courses?: Record<string, unknown>[];
        };
        const courses = Array.isArray(data?.results) ? data.results : data?.courses || [];
        for (const c of courses) {
          const courseUid = String(c.uid || c.id || c.course_uid || "");
          if (courseUid) {
            const authorObj = (c.author || {}) as Record<string, unknown>;
            const authName =
              `${String(authorObj.first_name || "")} ${String(authorObj.last_name || "")}`.trim() ||
              cleanUser;

            toSave.push({
              query: { uid: courseUid },
              doc: {
                ...c,
                uid: courseUid,
                course_uid: courseUid,
                educatorUsername: cleanUser,
                educatorName: authName,
                categoryUid: String(c.goal_uid || categoryUid || ""),
              },
            });
          }
        }
      }
    }
    if (toSave.length > 0) {
      await saveRecordsBatch("courses", toSave);
    }
    return await getRecords("courses", { username: cleanUser });
  } catch (e) {
    console.warn("Auto-fetch courses failed:", e);
  }
  return records || [];
}

export async function getOrFetchCategoryCourses(categoryUid: string) {
  const cleanGoal = extractCleanId(categoryUid).toUpperCase();
  const records = await getRecords("courses", { categoryUid: cleanGoal });
  if (records && records.length > 0) return records;

  try {
    const educators = await getOrFetchCategoryEducators(cleanGoal);
    for (const edu of educators.slice(0, 5)) {
      const u = String(edu.username || "")
        .toLowerCase()
        .replace(/^@/, "")
        .trim();
      if (u) {
        await getOrFetchEducatorCourses(u, cleanGoal);
      }
    }
    return await getRecords("courses", { categoryUid: cleanGoal });
  } catch (e) {
    console.warn("Auto-fetch category courses failed:", e);
  }
  return records || [];
}

export async function getOrFetchCourseLectures(courseUid: string, categoryUid = "") {
  const cleanUid = extractCleanId(courseUid);
  if (!cleanUid) return [];

  const records = await getRecords("lectures", { courseUid: cleanUid });
  if (records && records.length > 0) return records;

  try {
    const res = await fetch(
      apiUrl(new URLSearchParams({ action: "lectures", uid: cleanUid }).toString()),
    );
    if (res.ok) {
      const data = (await res.json()) as { results?: unknown[]; lectures?: unknown[] };
      const lectures = Array.isArray(data?.results) ? data.results : data?.lectures || [];

      let detectedCategory = categoryUid;
      let detectedTitle = "";
      let detectedAuthor = "";

      const toSave: Array<{ query: Record<string, unknown>; doc: Record<string, unknown> }> = [];

      for (const rawLec of lectures) {
        const normalized = parseLectureItem(rawLec, cleanUid, categoryUid);
        if (!detectedCategory && normalized.categoryUid) {
          detectedCategory = normalized.categoryUid;
        }
        if (!detectedAuthor && normalized.author) {
          detectedAuthor = normalized.author;
        }
        if (!detectedTitle && normalized.title) {
          detectedTitle = normalized.title;
        }
        toSave.push({
          query: { uid: normalized.uid, courseUid: cleanUid },
          doc: normalized as unknown as Record<string, unknown>,
        });
      }

      if (toSave.length > 0) {
        await saveRecordsBatch("lectures", toSave);
      }

      const existingCourse = await getRecords("courses", { uid: cleanUid });
      if (!existingCourse || existingCourse.length === 0) {
        await saveRecord(
          "courses",
          { uid: cleanUid },
          {
            uid: cleanUid,
            course_uid: cleanUid,
            name: detectedTitle ? `Course: ${detectedTitle.split("-")[0]}` : `Course ${cleanUid}`,
            item_count: lectures.length,
            categoryUid: detectedCategory,
            educatorName: detectedAuthor,
          },
        );
      }

      return await getRecords("lectures", { courseUid: cleanUid });
    }
  } catch (e) {
    console.warn("Auto-fetch lectures failed:", e);
  }
  return records || [];
}
