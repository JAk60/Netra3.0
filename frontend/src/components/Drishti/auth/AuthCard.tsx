// components/auth/AuthCard.tsx
'use client';

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
        {/* Glassmorphism card */}
        <div className="relative backdrop-blur-2xl bg-slate-900/70 border border-white/10 rounded-3xl p-8 shadow-2xl">
          {/* Glow effect */}
          <div className="absolute -inset-0.5 bg-linear-to-r from-blue-500/20 to-purple-500/20 rounded-3xl blur opacity-30" />
          
          {/* Content */}
          <div className="relative">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">
                {title}
              </h1>
              {subtitle && (
                <p className="text-slate-400 text-sm">
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