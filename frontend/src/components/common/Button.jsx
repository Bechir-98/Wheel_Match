import * as React from 'react';
import { Button as UiButton } from '../ui/button.jsx';
import { cn } from '@/lib/utils';

// ponytail: compat map for old variant/size API, drop when callers use ui/button directly
const VARIANT_MAP = {
  primary: 'default',
  secondary: 'secondary',
  accent: 'default',
  success: 'default',
  warning: 'default',
  error: 'destructive',
  danger: 'destructive',
  outline: 'outline',
  text: 'ghost',
  link: 'link',
  light: 'secondary',
};
const SIZE_MAP = { xs: 'sm', sm: 'sm', md: 'default', lg: 'lg', xl: 'lg', small: 'sm', large: 'lg' };

const Button = React.forwardRef(
  ({ variant = 'primary', size = 'md', fullWidth, fullwidth, className, ...props }, ref) => (
    <UiButton
      ref={ref}
      variant={VARIANT_MAP[variant] || 'default'}
      size={SIZE_MAP[size] || 'default'}
      className={cn((fullWidth || fullwidth) && 'w-full', className)}
      {...props}
    />
  )
);
Button.displayName = 'Button';

export default Button;
export { Button };
