import { useState, useEffect, useCallback } from "react";

export interface EnrolledCourse {
  uid: string;
  name: string;
  thumbnail?: string;
  categoryName?: string;
  categoryEmoji?: string;
  educatorName?: string;
  itemCount?: number;
  enrolledAt: number;
}

const STORAGE_KEY = "ua_enrolled_courses_v1";

export function getEnrolledCourses(): EnrolledCourse[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error("Failed to read enrolled courses:", e);
    return [];
  }
}

export function enrollCourse(course: Omit<EnrolledCourse, "enrolledAt">): boolean {
  if (typeof window === "undefined") return false;
  try {
    const current = getEnrolledCourses();
    if (current.some((c) => c.uid === course.uid)) return false;
    const updated = [{ ...course, enrolledAt: Date.now() }, ...current];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event("ua_enrollment_updated"));
    return true;
  } catch (e) {
    console.error("Failed to enroll:", e);
    return false;
  }
}

export function unenrollCourse(uid: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    const current = getEnrolledCourses();
    const updated = current.filter((c) => c.uid !== uid);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event("ua_enrollment_updated"));
    return true;
  } catch (e) {
    console.error("Failed to unenroll:", e);
    return false;
  }
}

export function isCourseEnrolled(uid: string): boolean {
  if (typeof window === "undefined") return false;
  const list = getEnrolledCourses();
  return list.some((c) => c.uid === uid);
}

export function useEnrollment() {
  const [enrolled, setEnrolled] = useState<EnrolledCourse[]>([]);

  const sync = useCallback(() => {
    setEnrolled(getEnrolledCourses());
  }, []);

  useEffect(() => {
    sync();
    window.addEventListener("ua_enrollment_updated", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("ua_enrollment_updated", sync);
      window.removeEventListener("storage", sync);
    };
  }, [sync]);

  const toggle = (course: Omit<EnrolledCourse, "enrolledAt">) => {
    if (enrolled.some((c) => c.uid === course.uid)) {
      unenrollCourse(course.uid);
    } else {
      enrollCourse(course);
    }
  };

  const isEnrolled = (uid: string) => enrolled.some((c) => c.uid === uid);

  return {
    enrolled,
    count: enrolled.length,
    isEnrolled,
    toggle,
    unenroll: unenrollCourse,
    enroll: enrollCourse,
  };
}
