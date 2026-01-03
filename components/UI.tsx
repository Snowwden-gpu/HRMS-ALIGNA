
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'glass' | 'teal';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  isLoading, 
  className = '', 
  ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center font-semibold rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95";
  
  const variants = {
    primary: "bg-[#059669] text-white hover:bg-[#047857] hover:shadow-lg hover:shadow-emerald-200/50 focus:ring-emerald-500",
    secondary: "bg-slate-900 text-white hover:bg-slate-800 hover:shadow-lg hover:shadow-slate-200/50 focus:ring-slate-400",
    outline: "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300 focus:ring-slate-300 shadow-sm",
    danger: "bg-rose-50 text-white hover:bg-rose-600 hover:shadow-lg hover:shadow-rose-200/50 focus:ring-rose-400",
    ghost: "text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus:ring-slate-300",
    glass: "bg-white/40 backdrop-blur-md border border-white/40 text-slate-800 hover:bg-white/60 shadow-soft",
    teal: "bg-[#0d9488] text-white hover:bg-[#0f766e] focus:ring-teal-500 shadow-sm"
  };

  const sizes = {
    sm: "px-4 py-2 text-xs tracking-tight",
    md: "px-6 py-2.5 text-sm tracking-tight",
    lg: "px-8 py-3.5 text-base tracking-tight"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <svg className="animate-spin -ml-1 mr-2.5 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : null}
      {children}
    </button>
  );
};

// Fixed Card component to accept onClick prop
export const Card: React.FC<{ 
  children: React.ReactNode; 
  className?: string; 
  glass?: boolean; 
  mint?: boolean;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
}> = ({ children, className = '', glass = false, mint = false, onClick }) => (
  <div 
    onClick={onClick}
    className={`${glass ? 'glass-panel' : (mint ? 'bg-[#f0f9f1]' : 'bg-white')} rounded-[28px] border border-slate-100 shadow-soft transition-all duration-300 ${onClick ? 'cursor-pointer' : ''} ${className}`}
  >
    {children}
  </div>
);

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label?: string; error?: string }> = ({ label, error, className = '', ...props }) => (
  <div className="w-full">
    {label && <label className="block text-[13px] font-semibold text-slate-500 mb-2 ml-1">{label}</label>}
    <input 
      className={`w-full px-5 py-3 bg-slate-50 border border-slate-200/50 rounded-2xl text-sm transition-all duration-300 focus:outline-none focus:bg-white focus:ring-4 ${error ? 'border-rose-300 focus:ring-rose-50' : 'focus:border-emerald-500/30 focus:ring-emerald-500/5'} ${className}`}
      {...props}
    />
    {error && <p className="mt-1.5 text-xs text-rose-500 font-medium ml-1">{error}</p>}
  </div>
);

// Fixed Badge component to accept className prop
export const Badge: React.FC<{ 
  children: React.ReactNode; 
  type?: 'success' | 'warning' | 'error' | 'info' | 'neutral';
  className?: string;
}> = ({ children, type = 'neutral', className = '' }) => {
  const styles = {
    success: "bg-[#ecfdf5] text-[#047857] border-[#d1fae5]",
    warning: "bg-amber-50 text-amber-700 border-amber-100",
    error: "bg-rose-50 text-rose-700 border-rose-100",
    info: "bg-blue-50 text-blue-700 border-blue-100",
    neutral: "bg-slate-50 text-slate-600 border-slate-200"
  };

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border ${styles[type]} ${className}`}>
      {children}
    </span>
  );
};
