import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { computeStats, flattenGrid, remainingByColor } from "@/lib/pixel";
import { loadProgress, saveProgress } from "@/lib/progressStore";

export default function useStudioEngine(artwork) {
  const size = artwork?.grid_size || 24;
  const target = useMemo(() => flattenGrid(artwork?.target_grid), [artwork]);
  const palette = artwork?.palette || [];
  const id = artwork?.id;

  const [progress, setProgress] = useState(() => {
    const saved = loadProgress(id);
    if (Array.isArray(saved) && saved.length === size * size) return saved.slice();
    return new Array(size * size).fill(0);
  });
  const [selected, setSelected] = useState(1);
  const [strict, setStrict] = useState(true);
  const [showNumbers, setShowNumbers] = useState(true);
  const [shakeCell, setShakeCell] = useState(-1);

  const progressRef = useRef(progress);
  progressRef.current = progress;
  const selectedRef = useRef(selected);
  selectedRef.current = selected;
  const shakeTimer = useRef(null);

  const stats = useMemo(() => computeStats(target, progress), [target, progress]);
  const remaining = useMemo(() => remainingByColor(target, progress), [target, progress]);

  // autosave, debounced
  useEffect(() => {
    if (!id) return undefined;
    const timer = setTimeout(() => saveProgress(id, progress, stats.percent), 350);
    return () => clearTimeout(timer);
  }, [progress, id, stats.percent]);

  useEffect(
    () => () => {
      if (id) saveProgress(id, progressRef.current, stats.percent);
      if (shakeTimer.current) clearTimeout(shakeTimer.current);
    },
    [id]
  );

  const flashWrong = useCallback((index) => {
    setShakeCell(index);
    if (shakeTimer.current) clearTimeout(shakeTimer.current);
    shakeTimer.current = setTimeout(() => setShakeCell(-1), 300);
  }, []);

  const paint = useCallback(
    (index) => {
      if (index < 0 || index >= target.length) return;
      const t = target[index];
      if (!t) return;
      if (progressRef.current[index] === t) return;
      const color = selectedRef.current;
      if (strict && t !== color) {
        flashWrong(index);
        return;
      }
      const next = progressRef.current.slice();
      next[index] = color;
      progressRef.current = next;
      setProgress(next);
    },
    [target, strict, flashWrong]
  );

  const hint = useCallback(() => {
    const wanted = selectedRef.current;
    let candidates = [];
    for (let i = 0; i < target.length; i++) {
      if (target[i] === wanted && progressRef.current[i] !== wanted) candidates.push(i);
    }
    if (!candidates.length) {
      for (let i = 0; i < target.length; i++) {
        if (target[i] && progressRef.current[i] !== target[i]) candidates.push(i);
      }
    }
    if (!candidates.length) return -1;
    const index = candidates[Math.floor(Math.random() * candidates.length)];
    const next = progressRef.current.slice();
    next[index] = target[index];
    progressRef.current = next;
    setProgress(next);
    return index;
  }, [target]);

  // when a colour is finished, move the palette to the next one still needed
  useEffect(() => {
    if (remaining[selected]) return;
    const next = Object.keys(remaining)
      .map(Number)
      .sort((a, b) => a - b)
      .find((color) => remaining[color] > 0);
    if (next) setSelected(next);
  }, [remaining, selected]);

  return {
    size,
    palette,
    target,
    progress,
    selected,
    setSelected,
    strict,
    setStrict,
    showNumbers,
    setShowNumbers,
    shakeCell,
    stats,
    remaining,
    paint,
    hint,
  };
}