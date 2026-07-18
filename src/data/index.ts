import { Module, ModuleLesson } from "../types";
import { MODULE_1 } from "./modules/module1";
import { MODULE_2 } from "./modules/module2";
import { MODULE_3 } from "./modules/module3";
import { MODULE_4 } from "./modules/module4";
import { MODULE_5 } from "./modules/module5";
import {
  MODULE_6, MODULE_7, MODULE_8, MODULE_9, MODULE_10,
  MODULE_11, MODULE_12, MODULE_13, MODULE_14, MODULE_15,
  MODULE_16, MODULE_17, MODULE_18, MODULE_19, MODULE_20,
} from "./modules/modules6to20";

export { CHARACTERS } from "./characters";
export { REWARD_TEMPLATES } from "./rewards";

export const MODULES: Module[] = [
  MODULE_1, MODULE_2, MODULE_3, MODULE_4, MODULE_5,
  MODULE_6, MODULE_7, MODULE_8, MODULE_9, MODULE_10,
  MODULE_11, MODULE_12, MODULE_13, MODULE_14, MODULE_15,
  MODULE_16, MODULE_17, MODULE_18, MODULE_19, MODULE_20,
];

export function getModule(id: string): Module | undefined {
  return MODULES.find((m) => m.id === id);
}

export function getLesson(id: string): ModuleLesson | undefined {
  for (const mod of MODULES) {
    const lesson = mod.lessons.find((l) => l.id === id);
    if (lesson) return lesson;
  }
  return undefined;
}

export function isModuleCompleted(moduleId: string, completedLessons: string[]): boolean {
  const mod = getModule(moduleId);
  if (!mod) return false;
  return mod.lessons.every((l) => completedLessons.includes(l.id));
}

export function isModuleUnlocked(moduleId: string, completedLessons: string[]): boolean {
  const mod = getModule(moduleId);
  if (!mod) return false;
  if (!mod.unlockAfter) return true;
  return isModuleCompleted(mod.unlockAfter, completedLessons);
}

export function isLessonUnlocked(
  lesson: ModuleLesson,
  completedLessons: string[]
): boolean {
  if (lesson.lessonNumber === 1) {
    return isModuleUnlocked(lesson.moduleId, completedLessons);
  }
  const mod = getModule(lesson.moduleId);
  if (!mod) return false;
  const prevLesson = mod.lessons.find((l) => l.lessonNumber === lesson.lessonNumber - 1);
  if (!prevLesson) return false;
  return completedLessons.includes(prevLesson.id);
}

export function getModuleProgress(moduleId: string, completedLessons: string[]): number {
  const mod = getModule(moduleId);
  if (!mod) return 0;
  return mod.lessons.filter((l) => completedLessons.includes(l.id)).length;
}
