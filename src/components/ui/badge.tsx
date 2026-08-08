import * as React from "react"
import { cn } from "../../lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline" | "success" | "pending"
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        {
          "border-transparent bg-primary text-white shadow hover:bg-primary/80": variant === "default",
          "border-transparent bg-muted text-gray-100 hover:bg-muted/80": variant === "secondary",
          "border-transparent bg-destructive/20 text-destructive hover:bg-destructive/30": variant === "destructive",
          "border-transparent bg-success/20 text-success hover:bg-success/30": variant === "success",
          "border-transparent bg-pending/20 text-pending hover:bg-pending/30": variant === "pending",
          "border-border text-gray-200": variant === "outline",
        },
        className
      )}
      {...props}
    />
  )
}

export { Badge }
