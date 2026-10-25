import { useState } from "react";

import { texts } from "@/texts";
import type { ImageLightboxProps } from "@/types/components/post/image-lightbox-props";
import { X } from "lucide-react";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

/** O portal do diálogo impede que o content-visibility do card prenda a ampliação no feed. */
export function ImageLightbox({ src, children }: ImageLightboxProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent
        hideClose
        aria-describedby={undefined}
        onClick={(event) => {
          event.stopPropagation();
          if (event.target === event.currentTarget) setOpen(false);
        }}
        className="flex h-[90dvh] w-[90vw] max-w-none items-center justify-center overflow-hidden border-0 bg-transparent p-0 shadow-none"
      >
        <DialogTitle className="sr-only">{texts.posts.imagePreview.title}</DialogTitle>

        <img src={src} alt="" className="max-h-full max-w-full object-contain" />

        <DialogClose
          aria-label={texts.accessibility.close}
          title={texts.accessibility.close}
          className="absolute right-0 top-0 grid size-10 place-items-center rounded-full bg-black/80 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
        >
          <X className="size-5" aria-hidden="true" />
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
}
