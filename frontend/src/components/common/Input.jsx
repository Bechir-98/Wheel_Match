import * as React from 'react';
import { Input as UiInput } from '../ui/input.jsx';
import { Label } from '../ui/label.jsx';
import { cn } from '@/lib/utils';

const Input = React.forwardRef(({ id, label, helperText, error, required, className, ...props }, ref) => (
  <div className="mb-4 w-full">
    {label && (
      <Label htmlFor={id} className="mb-2 block">
        {label}
        {required && <span className="text-destructive"> *</span>}
      </Label>
    )}
    <UiInput id={id} ref={ref} required={required} className={cn(error && 'border-destructive', className)} {...props} />
    {helperText && <div className={cn('mt-1 text-xs', error ? 'text-destructive' : 'text-muted-foreground')}>{helperText}</div>}
  </div>
));
Input.displayName = 'Input';

export default Input;
export { Input };
