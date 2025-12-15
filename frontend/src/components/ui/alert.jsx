import * as React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const alertVariants = cva('relative w-full rounded-lg border p-4 text-sm', {
  variants: {
    variant: { default: 'bg-background text-foreground', destructive: 'border-destructive/50 text-destructive' },
  },
  defaultVariants: { variant: 'default' },
});

const Alert = React.forwardRef(({ className, variant, ...props }, ref) => (
  <div ref={ref} role="alert" className={cn(alertVariants({ variant }), className)} {...props} />
));
Alert.displayName = 'Alert';

export { Alert };
