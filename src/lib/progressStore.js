import { readProgress, readProgressIndex, writeProgress } from "./localStore.js";

export const loadProgressIndex = readProgressIndex;
export const loadProgress = readProgress;
export const saveProgress = writeProgress;
