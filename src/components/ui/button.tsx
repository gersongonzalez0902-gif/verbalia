import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * Botón de VERBALIA v3: cuerpo sólido con canto inferior (btn-3d)
 * que se hunde al pulsar. Amistoso, táctil, imposible de confundir
 * con un enlace muerto. Los planos (ghost/link) quedan fuera del 3D.
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl text-sm font-bold font-display tracking-tight transition-all outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:pointer-events-none aria-disabled:pointer-events-none disabled:shadow-none [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 select-none tap-target",
  {
    variants: {
      variant: {
        default:
          "btn-3d bg-primary text-primary-foreground hover:bg-primary/95 border-0",
        destructive:
          "btn-3d btn-3d-destructive bg-destructive text-white hover:bg-destructive/95 focus-visible:ring-destructive/30 border-0",
        secondary:
          "btn-3d btn-3d-secondary bg-secondary text-secondary-foreground hover:bg-secondary/90 border-0",
        xp: "btn-3d btn-3d-xp bg-[var(--xp)] text-[var(--xp-foreground)] hover:brightness-105 border-0",
        outline:
          "border-2 border-border bg-card text-foreground hover:border-primary/50 hover:bg-accent/50 active:translate-y-0.5 shadow-sm",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50 active:scale-[0.97]",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-5 has-[>svg]:px-4",
        sm: "h-9 rounded-xl px-3.5 has-[>svg]:px-3 text-xs",
        lg: "h-13 rounded-2xl px-7 text-base has-[>svg]:px-5",
        xl: "h-14 rounded-2xl px-8 text-lg has-[>svg]:px-6",
        icon: "size-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
