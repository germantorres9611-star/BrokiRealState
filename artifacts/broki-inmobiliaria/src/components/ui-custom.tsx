import React from 'react';
import { cn } from '../lib/utils';
import { motion, HTMLMotionProps } from 'framer-motion';

export const Button = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'outline' | 'ghost' | 'danger' }>(
  ({ className, variant = 'primary', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "px-6 py-3 font-display font-bold uppercase tracking-wider text-sm transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed",
          variant === 'primary' && "bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-[0_0_15px_rgba(10,10,255,0.4)] border border-primary",
          variant === 'outline' && "bg-transparent border border-border text-foreground hover:border-primary hover:text-primary",
          variant === 'ghost' && "bg-transparent text-muted-foreground hover:text-foreground",
          variant === 'danger' && "bg-destructive/10 border border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground",
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "w-full px-4 py-3 bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all rounded-none",
          className
        )}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          "w-full px-4 py-3 bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all rounded-none min-h-[120px] resize-y",
          className
        )}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";

export const Label = ({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) => (
  <label className={cn("block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2", className)} {...props} />
);

export const Dialog = ({ isOpen, onClose, title, children }: { isOpen: boolean, onClose: () => void, title: string, children: React.ReactNode }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative bg-card border border-border w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="sticky top-0 bg-card border-b border-border p-6 flex justify-between items-center z-10">
          <h2 className="text-xl font-display font-bold">{title}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-white transition-colors">
            ✕
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </motion.div>
    </div>
  );
};
