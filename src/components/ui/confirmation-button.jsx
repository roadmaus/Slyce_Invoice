import React from 'react';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from './loading-spinner';
import { cn } from '@/lib/utils';

export const ConfirmationButton = ({ 
  children,
  onConfirm,
  confirmationText = "Are you sure?",
  timeout = 2000,
  className,
  variant = "default",
  isLoading,
  ...props
}) => {
  const [confirming, setConfirming] = React.useState(false);
  const timeoutRef = React.useRef(null);

  const handleClick = async () => {
    if (confirming) {
      try {
        await onConfirm();
      } finally {
        setConfirming(false);
      }
    } else {
      setConfirming(true);
      timeoutRef.current = setTimeout(() => {
        setConfirming(false);
      }, timeout);
    }
  };

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <Button
      variant={confirming ? "destructive" : variant}
      className={cn(className)}
      onClick={handleClick}
      disabled={isLoading}
      {...props}
    >
      {isLoading ? (
        <LoadingSpinner className="mr-2" size="sm" />
      ) : null}
      {confirming ? confirmationText : children}
    </Button>
  );
}; 