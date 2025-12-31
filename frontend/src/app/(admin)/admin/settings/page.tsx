// frontend/src/app/(admin)/admin/settings/page.tsx
'use client'

import { useState } from 'react'
import { Shield, Lock, Clock, AlertTriangle, Save, RefreshCw } from 'lucide-react'
import { Button } from '@/registry/new-york-v4/ui/button'
import { Input } from '@/registry/new-york-v4/ui/input'
import { toast } from 'sonner'

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(false)
  
  // Security Settings
  const [maxLoginAttempts, setMaxLoginAttempts] = useState('5')
  const [lockoutDuration, setLockoutDuration] = useState('30')
  const [sessionTimeout, setSessionTimeout] = useState('30')
  const [passwordMinLength, setPasswordMinLength] = useState('8')

  const handleSaveSettings = async () => {
    setIsLoading(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    toast.success('Settings saved successfully')
    setIsLoading(false)
  }

  const handleResetDefaults = () => {
    setMaxLoginAttempts('5')
    setLockoutDuration('30')
    setSessionTimeout('30')
    setPasswordMinLength('8')
    toast.info('Settings reset to defaults')
  }

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
        <p className="text-gray-400">
          Configure system-wide security and authentication settings
        </p>
      </div>

      {/* Security Settings */}
      <div className="rounded-xl border border-gray-800 bg-[#0f1d31]/40 backdrop-blur-sm overflow-hidden">
        <div className="p-6 border-b border-gray-800 bg-[#0a1525]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#25547e]/20 flex items-center justify-center">
              <Shield className="w-5 h-5 text-[#3B82F6]" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Security Settings</h2>
              <p className="text-sm text-gray-400">Configure authentication and security policies</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Max Login Attempts */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
              <Lock className="w-4 h-4" />
              Maximum Login Attempts
            </label>
            <Input
              type="number"
              value={maxLoginAttempts}
              onChange={(e) => setMaxLoginAttempts(e.target.value)}
              className="bg-[#0a1525] border-gray-800 text-white max-w-xs"
              min="1"
              max="10"
            />
            <p className="mt-1 text-xs text-gray-500">
              Number of failed login attempts before account lockout
            </p>
          </div>

          {/* Lockout Duration */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
              <Clock className="w-4 h-4" />
              Account Lockout Duration (minutes)
            </label>
            <Input
              type="number"
              value={lockoutDuration}
              onChange={(e) => setLockoutDuration(e.target.value)}
              className="bg-[#0a1525] border-gray-800 text-white max-w-xs"
              min="5"
              max="1440"
            />
            <p className="mt-1 text-xs text-gray-500">
              How long accounts remain locked after max failed attempts
            </p>
          </div>

          {/* Session Timeout */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
              <Clock className="w-4 h-4" />
              Session Timeout (minutes)
            </label>
            <Input
              type="number"
              value={sessionTimeout}
              onChange={(e) => setSessionTimeout(e.target.value)}
              className="bg-[#0a1525] border-gray-800 text-white max-w-xs"
              min="5"
              max="1440"
            />
            <p className="mt-1 text-xs text-gray-500">
              Access token expiration time
            </p>
          </div>

          {/* Password Requirements */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
              <Shield className="w-4 h-4" />
              Minimum Password Length
            </label>
            <Input
              type="number"
              value={passwordMinLength}
              onChange={(e) => setPasswordMinLength(e.target.value)}
              className="bg-[#0a1525] border-gray-800 text-white max-w-xs"
              min="6"
              max="128"
            />
            <p className="mt-1 text-xs text-gray-500">
              Minimum characters required for user passwords
            </p>
          </div>
        </div>
      </div>

      {/* Warning Notice */}
      <div className="rounded-xl border border-yellow-800/50 bg-yellow-950/20 backdrop-blur-sm p-6">
        <div className="flex gap-4">
          <div className="shrink-0">
            <div className="w-10 h-10 rounded-full bg-yellow-900/20 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-yellow-400" />
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-yellow-200 mb-2">
              Important Notice
            </h3>
            <p className="text-sm text-yellow-300/80">
              Changes to security settings will affect all users. Existing sessions may require re-authentication after changes are applied.
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button
          onClick={handleSaveSettings}
          disabled={isLoading}
          className="bg-[#25547e] hover:bg-[#25547e]/80 text-white"
        >
          {isLoading ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </>
          )}
        </Button>

        <Button
          variant="outline"
          onClick={handleResetDefaults}
          disabled={isLoading}
          className="border-gray-700 text-gray-300 hover:bg-[#0f1d31] hover:text-white"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Reset to Defaults
        </Button>
      </div>

      {/* Current Settings Info */}
      <div className="rounded-xl border border-gray-800 bg-[#0f1d31]/40 backdrop-blur-sm p-6">
        <h3 className="text-sm font-semibold text-white mb-4">Current Settings Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="flex justify-between py-2 border-b border-gray-800">
            <span className="text-gray-400">Max Login Attempts:</span>
            <span className="text-white font-medium">{maxLoginAttempts}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-800">
            <span className="text-gray-400">Lockout Duration:</span>
            <span className="text-white font-medium">{lockoutDuration} minutes</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-800">
            <span className="text-gray-400">Session Timeout:</span>
            <span className="text-white font-medium">{sessionTimeout} minutes</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-800">
            <span className="text-gray-400">Min Password Length:</span>
            <span className="text-white font-medium">{passwordMinLength} characters</span>
          </div>
        </div>
      </div>
    </div>
  )
}