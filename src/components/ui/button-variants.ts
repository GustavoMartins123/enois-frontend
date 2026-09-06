import { cva } from "class-variance-authority";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold cursor-pointer transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-white shadow-soft hover:bg-[oklch(0.49_0.24_293)]",
        destructive: "bg-destructive text-white shadow-sm hover:bg-destructive/90",
        outline:
          "border border-border-soft bg-transparent hover:bg-surface-2 hover:text-foreground",
        secondary: "bg-surface-2 text-foreground hover:bg-surface-3",
        ghost: "hover:bg-surface-2 hover:text-foreground",
        link: "text-primary underline-offset-4 hover:underline hover:text-primary/80",
      },
      size: {
        default: "h-auto w-full rounded-full px-8 py-2",
        sm: "h-8 rounded-lg px-3 text-xs",
        lg: "h-11 rounded-lg px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);
