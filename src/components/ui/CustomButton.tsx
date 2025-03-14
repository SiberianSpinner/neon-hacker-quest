
import React from 'react';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

const buttonVariants = cva(
  "relative cursor-pointer inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "cyber-border bg-transparent text-cyber-primary hover:bg-cyber-primary/10 active:bg-cyber-primary/20 transition-colors",
        secondary: "cyber-border border-cyber-secondary/30 bg-transparent text-cyber-secondary hover:bg-cyber-secondary/10 active:bg-cyber-secondary/20",
        tertiary: "cyber-border border-cyber-tertiary/30 bg-transparent text-cyber-tertiary hover:bg-cyber-tertiary/10 active:bg-cyber-tertiary/20",
        ghost: "bg-transparent text-cyber-primary hover:text-glow hover:bg-cyber-primary/5 transition-all",
      },
      size: {
        default: "h-12 px-8 py-5",
        sm: "h-9 rounded-md px-3",
        lg: "h-14 rounded-md px-10 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  children: React.ReactNode;
  glowEffect?: boolean;
  hoverSound?: boolean;
  leftIcon?: React.ReactNode; // Add the leftIcon prop
}

const CustomButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, glowEffect = false, leftIcon, children, ...props }, ref) => {
    const [isHovering, setIsHovering] = React.useState(false);
    
    // Sound effect for hover
    React.useEffect(() => {
      if (props.hoverSound && isHovering) {
        const audio = new Audio();
        audio.src = 'data:audio/mp3;base64,SUQzAwAAAAAAA1RTSE4AAAAPAAADTGF2ZjU5LjE2LjEwMABU';
        audio.volume = 0.2;
        audio.play().catch(() => {}); // Catch errors (e.g., user hasn't interacted yet)
      }
    }, [isHovering, props.hoverSound]);

    return (
      <button
        className={cn(
          buttonVariants({ variant, size }), 
          glowEffect && "hover:shadow-[0_0_15px_rgba(0,255,204,0.5)] transition-shadow duration-300",
          className
        )}
        ref={ref}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        {...props}
      >
        {leftIcon && <span className="mr-2 inline-flex items-center">{leftIcon}</span>}
        <span className="z-10 relative">{children}</span>
        {isHovering && (
          <span className="absolute inset-0 bg-gradient-to-r from-cyber-primary/0 via-cyber-primary/10 to-cyber-primary/0 animate-pulse rounded-md" />
        )}
      </button>
    );
  }
);

CustomButton.displayName = "CustomButton";

export { CustomButton, buttonVariants };
