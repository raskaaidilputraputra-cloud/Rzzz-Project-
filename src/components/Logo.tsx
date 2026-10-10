import React from 'react';
import { Sparkles } from 'lucide-react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ size = 'md', showTagline = false }) => {
  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl sm:text-3xl',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6 sm:w-7 sm:h-7',
  };

  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-2 select-none group">
        <div className="relative flex items-center justify-center p-1.5 rounded-xl bg-gradient-to-tr from-sky-600 via-sky-500 to-sky-400 text-white shadow-md shadow-sky-500/20 group-hover:shadow-sky-500/30 transition-all duration-300">
          <Sparkles className={`${iconSizes[size]} animate-pulse`} />
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-white rounded-full opacity-80" />
        </div>
        <div className="flex items-baseline">
          <span className={`font-black tracking-tight text-slate-900 ${sizeClasses[size]}`}>
            Rzz<span className="bg-gradient-to-r from-sky-500 to-sky-600 bg-clip-text text-transparent">HD</span>
          </span>
          <span className="ml-1 text-[10px] font-bold tracking-widest uppercase px-1.5 py-0.5 rounded bg-sky-100 text-sky-700 border border-sky-200/60 hidden sm:inline-block">
            AI
          </span>
        </div>
      </div>
      {showTagline && (
        <span className="text-xs text-slate-500 font-medium tracking-normal mt-0.5">
          Make Every Moment HD with AI
        </span>
      )}
    </div>
  );
};
