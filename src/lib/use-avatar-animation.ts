import { useEffect, useRef } from "react";

import { ANIMATED_FRAMES } from "./avatar-frames";

const targets = new Set<Element>();
const visible = new Set<Element>();
let observer: IntersectionObserver | null = null;

function syncVisibility(target: Element) {
  target.toggleAttribute("data-avatar-animating", visible.has(target) && !document.hidden);
}

function onVisibilityChange() {
  targets.forEach(syncVisibility);
}

/** Um observer e um listener para todas as molduras, sem render React por quadro. */
function observeAvatar(target: Element) {
  if (typeof IntersectionObserver === "undefined") return;
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
      // O efeito se estende além do avatar, inclusive no tamanho maior do perfil.
      { rootMargin: "40px" },
    );
    document.addEventListener("visibilitychange", onVisibilityChange);
  }
  const avatarObserver = observer;
  targets.add(target);
  avatarObserver.observe(target);
  return () => {
    avatarObserver.unobserve(target);
    targets.delete(target);
    visible.delete(target);
    target.removeAttribute("data-avatar-animating");
    if (targets.size === 0) {
      avatarObserver.disconnect();
      observer = null;
      document.removeEventListener("visibilitychange", onVisibilityChange);
    }
  };
}

export function useAvatarAnimation(frame: string | null | undefined) {
  const ref = useRef<HTMLSpanElement>(null);
  // Trocar entre moldura FX e anel muda o nó do ref e também frame, que refaz a observação.
  useEffect(() => {
    if (frame && ANIMATED_FRAMES.includes(frame) && ref.current) return observeAvatar(ref.current);
  }, [frame]);
  return ref;
}
