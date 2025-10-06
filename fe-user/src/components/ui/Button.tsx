import React from 'react';
import clsx from 'clsx';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const base = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none disabled:opacity-50 disabled:pointer-events-none';
const sizeStyles: Record<Size, string> = {
  sm: 'text-xs px-3 h-8 gap-1',
  md: 'text-sm px-4 h-10 gap-2',
  lg: 'text-base px-6 h-12 gap-2',
};
const variantStyles: Record<Variant, string> = {
  primary: 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm',
  secondary: 'bg-gray-900 hover:bg-gray-800 text-white shadow-sm',
  outline: 'border border-gray-300 hover:bg-gray-50 text-gray-700',
  ghost: 'text-gray-600 hover:text-gray-900 hover:bg-gray-100',
  danger: 'bg-red-600 hover:bg-red-700 text-white shadow-sm'
};

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  leftIcon,
  rightIcon,
  fullWidth,
  className,
  ...rest
}) => {
  return (
    <button
      className={clsx(base, sizeStyles[size], variantStyles[variant], fullWidth && 'w-full', className)}
      {...rest}
    >
      {loading && (
        <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
      )}
      {!loading && leftIcon}
      <span className="truncate">{children}</span>
      {!loading && rightIcon}
    </button>
  );
};

export default Button;
