
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../../lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  isLoading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, isLoading = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    const disabled = Boolean((props as any).disabled) || isLoading

    // Garantir que botões não façam submit por padrão
    const typeProp = !asChild ? (props.type ?? "button") : undefined

    // Interceptar clique quando em modo asChild e desabilitado/carregando
    const originalOnClick = props.onClick
    const guardedOnClick = (e: React.MouseEvent<any>) => {
      if (disabled) {
        e.preventDefault()
        e.stopPropagation()
        return
      }
      originalOnClick?.(e as any)
    }

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        // Acessibilidade
        aria-disabled={asChild ? (disabled || undefined) : undefined}
        aria-busy={isLoading || undefined}
        data-state={isLoading ? "loading" : undefined}
        // Tabulação ao desabilitar quando for asChild
        tabIndex={asChild && disabled ? -1 : (props as any).tabIndex}
        // Desabilitar nativo quando for <button>
        disabled={!asChild ? disabled : undefined}
        // Tipo padrão somente para <button>
        type={typeProp}
        // Clique protegido quando for asChild ou quando loading
        onClick={asChild ? guardedOnClick : originalOnClick}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
