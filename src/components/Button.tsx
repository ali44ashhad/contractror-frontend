import React, { memo } from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  isLoading?: boolean;
  children: React.ReactNode;
}

/**
 * Reusable Button component
 * Supports variants and loading state
 */
const Button = memo<ButtonProps>(
  ({
    variant = 'primary',
    isLoading = false,
    children,
    className = '',
    disabled,
    ...props
  }) => {
    const baseClasses =
      'font-semibold py-3 px-8 rounded-full transition duration-300 ease-in-out flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed';
    
    const variantClasses = {
      primary: 'bg-[#00BFB6] hover:bg-[#00a48f] text-white',
      secondary: 'bg-white/10 hover:bg-[#00BFB6] text-white border border-white',
      outline: 'bg-transparent hover:bg-[#00BFB6] text-[#00BFB6] border-2 border-[#00BFB6] hover:text-white',
    };

    return (
      <button
        className={`${baseClasses} ${variantClasses[variant]} ${className}`}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? 'Loading...' : children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;

