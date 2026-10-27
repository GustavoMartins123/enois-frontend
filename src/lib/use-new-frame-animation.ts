import { useEffect, useRef } from "react";

const targets = new Set<Element>();
const visible = new Set<Element>();
let observer: IntersectionObserver | null = null;

function syncVisibility(target: Element) {
  target.toggleAttribute("data-avatar-animating", visible.has(target) && !document.hidden);
}

function onVisibilityChange() {
  targets.forEach(syncVisibility);
}

function disconnectWhenUnused() {
  if (targets.size !== 0 || !observer) return;
  observer.disconnect();
  observer = null;
  document.removeEventListener("visibilitychange", onVisibilityChange);
}

/** Um observer compartilhado pausa as novas molduras fora da tela e na aba oculta. */
function observeAvatar(target: Element) {
  if (!observer) {
    observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!targets.has(entry.target)) continue;
          if (entry.isIntersecting) visible.add(entry.target);
          else visible.delete(entry.target);
          syncVisibility(entry.target);
        }
      },
      { rootMargin: "40px" },
    );
    document.addEventListener("visibilitychange", onVisibilityChange);
  }
  const avatarObserver = observer;
  targets.add(target);
  try {
    avatarObserver.observe(target);
  } catch (error) {
    targets.delete(target);
    disconnectWhenUnused();
    throw error;
  }
  return () => {
    avatarObserver.unobserve(target);
    targets.delete(target);
    visible.delete(target);
    target.removeAttribute("data-avatar-animating");
    disconnectWhenUnused();
  };
}

export function useNewFrameAnimation(frame: string) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (ref.current) return observeAvatar(ref.current);
  }, [frame]);
  return ref;
}
