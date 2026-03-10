// components/auth/AuthCard.tsx
'use client';

import { Telescope } from 'lucide-react';
import { ReactNode } from 'react';

interface AuthCardProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

export default function AuthCard({ children, title, subtitle }: AuthCardProps) {
  return (
    <div className="w-full max-w-md">
      <div className="relative">
        {/* Glassmorphism card with more padding */}
        <div className="relative backdrop-blur-2xl bg-black border border-black/10 p-12 shadow-2xl">
          {/* Glow effect */}
          <div className="absolute -inset-0.5 bg-linear-to-r from-blue-500/20 to-purple-500/20  blur opacity-30" />

          {/* Content */}
          <div className="relative">
            {/* Header - More prominent branding */}
         <div className='flex justify-start items-center mb-8'>
              <Telescope
                className="text-blue-400 w-30 h-20 animate-[jumpThenMirror_20s_ease-in-out_infinite]"
              />

              <span className="font-[amita] text-7xl flex mt-1 ml-3">
                नेत्रा
              </span>
            </div>

            {/* Title section with better spacing */}
            <div className="mb-10">
              <h1 className="flex justify-center text-2xl font-semibold text-white mb-3 tracking-tight">
                {title}
              </h1>
              {subtitle && (
                <p className="text-slate-400 text-sm leading-relaxed">
                  {subtitle}
                </p>
              )}
            </div>

            {/* Form content */}
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}