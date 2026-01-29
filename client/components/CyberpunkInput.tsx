'use client';

import React from "react"

import { InputHTMLAttributes, forwardRef } from 'react';

interface CyberpunkInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: React.ReactNode;
}

const CyberpunkInput = forwardRef<HTMLInputElement, CyberpunkInputProps>(
  ({ label, icon, className, ...props }, ref) => {
    return (
      <div className="relative w-full">
        {label && (
          <label className="block text-sm font-medium text-primary mb-2 font-mono">
            &gt; {label}
          </label>
        )}
        <div className="relative flex items-center">
          {icon && (
            <div className="absolute left-3 text-primary pointer-events-none">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            type="text"
            className={`w-full bg-input border border-muted text-foreground placeholder-muted-foreground px-4 py-3 font-mono text-sm transition-all duration-300 caret-block focus:outline-none focus:border-primary focus:shadow-[0_0_10px_rgba(0,255,65,0.5)] ${
              icon ? 'pl-10' : ''
            } ${className}`}
            {...props}
          />
        </div>
      </div>
    );
  }
);

CyberpunkInput.displayName = 'CyberpunkInput';

export default CyberpunkInput;
