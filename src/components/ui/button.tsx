import * as React from "react"
// I will keep className handling but remove unused cva/radix for now if sticking to simple implementation
// I'll stick to standard props for now to avoid installing more deps unless I really need it.
// Actually, I'll install class-variance-authority as it eases component building.
// Wait, I can just use a simple switch/map for now since I want to be fast.
import { cn } from "@/lib/utils"
// I will not use Slot for now, just simple button.

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "neon";
    size?: "sm" | "default" | "lg" | "icon";
    asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "primary", size = "default", ...props }, ref) => {

        const variants = {
            primary: "bg-primary text-white hover:bg-primary/90 hover:shadow-[0_0_15px_rgba(15,61,46,0.5)] border-2 border-transparent",
            secondary: "bg-secondary text-white hover:bg-secondary/90 hover:scale-105",
            outline: "border-2 border-primary text-primary hover:bg-primary hover:text-white",
            ghost: "hover:bg-primary/10 text-text-secondary hover:text-white",
            danger: "bg-danger text-white hover:bg-danger/90",
            neon: "bg-accent text-dark font-bold hover:shadow-[0_0_20px_#7CFF9B] border-2 border-accent hover:border-white transition-all duration-200",
        }

        const sizes = {
            sm: "h-9 px-3 text-xs",
            default: "h-11 px-6 py-2 text-sm",
            lg: "h-14 px-8 text-base",
            icon: "h-10 w-10",
        }

        return (
            <button
                className={cn(
                    "inline-flex items-center justify-center whitespace-nowrap font-heading uppercase tracking-wider transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
                    "clip-path-slant", // I might need to define this utility or just standard sharp corners
                    variants[variant],
                    sizes[size],
                    className
                )}
                ref={ref}
                {...props}
            />
        )
    }
)
Button.displayName = "Button"

export { Button }
