"use client"

import { Button } from "@/registry/new-york-v4/ui/button"
import { Card } from "@/registry/new-york-v4/ui/card"
import { Input } from "@/registry/new-york-v4/ui/input"
import { Label } from "@/registry/new-york-v4/ui/label"
import { useState } from "react"


export default function Auth() {
  const [isSignUp, setIsSignUp] = useState(false)

  return (
    <div className="bg-authship min-h-screen bg-gradient-to-br from-slate-900 to-[#25547e] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Add ocean-inspired background elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-blue-600/10 to-slate-800/20"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-400/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-slate-400/5 rounded-full blur-3xl"></div>
      </div>
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Form Section */}
        <div className="flex items-center justify-center">
          <Card className="w-full max-w-md p-8 backdrop-blur-lg bg-slate-800/20 border border-slate-300/20 shadow-2xl relative z-10">
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold text-white">{isSignUp ? "Create Account" : "Welcome Back"}</h1>
                <p className="text-white/80">
                  {isSignUp ? "Join us and start your journey today" : "Sign in to your account to continue"}
                </p>
              </div>

              <form className="space-y-4">
                {isSignUp && (
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-white/90">
                      Full Name
                    </Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Enter your full name"
                      className="backdrop-blur-sm bg-slate-700/20 border-slate-300/30 text-slate-100 placeholder:text-slate-300/60 focus:border-slate-200/50"
                      required
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white/90">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    className="backdrop-blur-sm bg-slate-700/20 border-slate-300/30 text-slate-100 placeholder:text-slate-300/60 focus:border-slate-200/50"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-white/90">
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    className="backdrop-blur-sm bg-slate-700/20 border-slate-300/30 text-slate-100 placeholder:text-slate-300/60 focus:border-slate-200/50"
                    required
                  />
                </div>

                {isSignUp && (
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-white/90">
                      Confirm Password
                    </Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Confirm your password"
                      className="backdrop-blur-sm bg-slate-700/20 border-slate-300/30 text-slate-100 placeholder:text-slate-300/60 focus:border-slate-200/50"
                      required
                    />
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full bg-slate-600/30 hover:bg-slate-500/40 text-slate-100 border border-slate-300/30 backdrop-blur-sm transition-all duration-200"
                >
                  {isSignUp ? "Create Account" : "Sign In"}
                </Button>
              </form>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-white/80 hover:text-white underline underline-offset-4 transition-colors"
                >
                  {isSignUp ? "Already have an account? Sign in" : "Don't have an account? Sign up"}
                </button>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-white/30" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-transparent px-2 text-white/60">Or continue with</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  className="backdrop-blur-sm bg-slate-700/20 border-slate-300/30 text-slate-100 hover:bg-slate-600/30"
                >
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Google
                </Button>
                <Button
                  variant="outline"
                  className="backdrop-blur-sm bg-slate-700/20 border-slate-300/30 text-slate-100 hover:bg-slate-600/30"
                >
                  <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                  </svg>
                  Twitter
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Company Branding Section */}
        <div className="flex items-center justify-center lg:justify-start">
          <div className="text-center lg:text-left space-y-8 max-w-lg">
            {/* Company Logo */}
            <div className="flex justify-center lg:justify-start">
              <div className="w-20 h-20 rounded-2xl backdrop-blur-lg bg-slate-700/30 border border-slate-300/30 flex items-center justify-center shadow-2xl">
                <svg className="w-10 h-10 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
              </div>
            </div>

            {/* Company Info */}
            <div className="space-y-4">
              <h2 className="text-4xl lg:text-5xl font-bold text-white leading-tight">
                Welcome to
                <span className="block bg-gradient-to-r from-blue-300 to-slate-300 bg-clip-text text-transparent">
                  NavalTech
                </span>
              </h2>

              <p className="text-xl text-slate-200/80 leading-relaxed">
                Advanced maritime technology solutions powering the next generation of naval operations and oceanic
                exploration.
              </p>

              <div className="space-y-3 text-white/70">
                <div className="flex items-center justify-center lg:justify-start space-x-3">
                  <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                  <span>Trusted by naval forces worldwide</span>
                </div>
                <div className="flex items-center justify-center lg:justify-start space-x-3">
                  <div className="w-2 h-2 rounded-full bg-slate-400"></div>
                  <span>Military-grade security standards</span>
                </div>
                <div className="flex items-center justify-center lg:justify-start space-x-3">
                  <div className="w-2 h-2 rounded-full bg-blue-300"></div>
                  <span>24/7 mission-critical support</span>
                </div>
              </div>
            </div>

            {/* Decorative Elements */}
            <div className="hidden lg:block">
              <div className="flex space-x-4">
                <div className="w-16 h-16 rounded-xl backdrop-blur-md bg-slate-700/20 border border-slate-300/20"></div>
                <div className="w-16 h-16 rounded-xl backdrop-blur-md bg-slate-700/20 border border-slate-300/20"></div>
                <div className="w-16 h-16 rounded-xl backdrop-blur-md bg-slate-700/20 border border-slate-300/20"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
