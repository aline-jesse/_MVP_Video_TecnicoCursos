import * as React from "react"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary"
}

export const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className = "", variant = "default", ...props }, ref) => {
    const baseStyles = "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
    
    const variants = {
      default: "bg-blue-600 text-white",
      secondary: "bg-gray-100 text-gray-900"
    }
    
    const classes = `${baseStyles} ${variants[variant]} ${className}`
    
    return (
      <div
        className={classes}
        ref={ref}
        {...props}
      />
    )
  }
)
Badge.displayName = "Badge"