'use client';

import { ButtonHTMLAttributes, ReactNode } from 'react';
import { motion } from 'framer-motion';

interface CyberpunkButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
  isLoading?: boolean;
}

export default function CyberpunkButton({
  children,
  variant = 'primary',
  isLoading = false,
  className = '',
  ...props
}: CyberpunkButtonProps) {
  const baseStyles =
    'px-6 py-3 font-mono text-sm font-semibold transition-all duration-200 relative overflow-hidden border';

  const variantStyles = {
    primary:
      'border-primary text-primary hover:bg-primary hover:text-primary-foreground active:scale-95',
    secondary:
      'border-dashed border-muted text-muted-foreground hover:border-secondary hover:text-secondary',
    danger:
      'border-accent bg-accent/10 text-accent hover:bg-accent hover:text-primary-foreground',
  };

  return (
    <motion.button
      whileHover={{ y: -2 }}
      whileTap={{ y: 0 }}
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      disabled={isLoading}
      {...props}
    >
      <span className="relative z-10 flex items-center justify-center gap-2">
        {isLoading && (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
          />
        )}
        {children}
      </span>
    </motion.button>
  );
}
