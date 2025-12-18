import * as React from 'react';
import { Card as UiCard, CardHeader, CardTitle, CardContent, CardFooter } from '../ui/card.jsx';
import { cn } from '@/lib/utils';

// ponytail: compat for old header/footer/interactive props, drop when callers use ui/card directly
const Card = React.forwardRef(
  ({ header, footer, title, interactive, onClick, className, children, ...props }, ref) => (
    <UiCard
      ref={ref}
      onClick={interactive ? onClick : undefined}
      className={cn(interactive && 'cursor-pointer', className)}
      {...props}
    >
      {title && (
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
      )}
      {header && <CardHeader>{header}</CardHeader>}
      <CardContent>{children}</CardContent>
      {footer && <CardFooter>{footer}</CardFooter>}
    </UiCard>
  )
);
Card.displayName = 'Card';

export default Card;
export { Card, CardHeader, CardTitle, CardContent, CardFooter };
