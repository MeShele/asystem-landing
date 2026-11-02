import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

/** Кнопка страницы: прямоугольная, одна заливка, отзывается на нажатие (.btn в index.css). */
type Variant = "signal" | "ink" | "quiet";
type Size = "default" | "sm";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "ink", size = "default", asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={cn("btn", `btn-${variant}`, size === "sm" && "btn-sm", className)}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button };
