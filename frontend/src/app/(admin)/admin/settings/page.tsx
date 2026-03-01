'use client'
// frontend/src/app/(admin)/admin/settings/page.tsx

import { useState, useEffect } from 'react'
import { Shield, Lock, Clock, AlertTriangle, Save, RefreshCw, Timer, Info } from 'lucide-react'
import { Button } from '@/registry/new-york-v4/ui/button'
import { Input } from '@/registry/new-york-v4/ui/input'
import { toast } from 'sonner'

import { formatDistanceToNow } from 'date-fns'
import { getSettings, SystemSettings, updateSettings } from '@/actions/auth/settings'

const DEFAULTS = {
  inactivity_timeout_minutes: 10,
  session_timeout_minutes: 30,
  max_login_attempts: 5,
  lockout_duration_minutes: 30,
  password_min_length: 8,
}

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const [lastSaved, setLastSaved] = useState<SystemSettings | null>(null)

  const [inactivityTimeout, setInactivityTimeout] = useState(String(DEFAULTS.inactivity_timeout_minutes))
  const [sessionTimeout, setSessionTimeout] = useState(String(DEFAULTS.session_timeout_minutes))
  const [maxLoginAttempts, setMaxLoginAttempts] = useState(String(DEFAULTS.max_login_attempts))
  const [lockoutDuration, setLockoutDuration] = useState(String(DEFAULTS.lockout_duration_minutes))
  const [passwordMinLength, setPasswordMinLength] = useState(String(DEFAULTS.password_min_length))

  useEffect(() => {
    async function load() {
      setIsFetching(true)
      const response = await getSettings()
      if (response.success && response.data) {
        const s = response.data
        setInactivityTimeout(String(s.inactivity_timeout_minutes))
        setSessionTimeout(String(s.session_timeout_minutes))
        setMaxLoginAttempts(String(s.max_login_attempts))
        setLockoutDuration(String(s.lockout_duration_minutes))
        setPasswordMinLength(String(s.password_min_length))
        setLastSaved(s)
      } else {
        toast.error(response.error || 'Failed to load settings')
      }
      setIsFetching(false)
    }
    load()
  }, [])

  const handleSaveSettings = async () => {
    const inactivityVal = parseInt(inactivityTimeout)
    if (inactivityVal < 2) {
      toast.error('Inactivity timeout must be at least 2 minutes (warning needs 60s buffer)')
      return
    }

    setIsLoading(true)
    const response = await updateSettings({
      inactivity_timeout_minutes: inactivityVal,
      session_timeout_minutes: parseInt(sessionTimeout),
      max_login_attempts: parseInt(maxLoginAttempts),
      lockout_duration_minutes: parseInt(lockoutDuration),
      password_min_length: parseInt(passwordMinLength),
    })

    if (response.success && response.data) {
      setLastSaved(response.data)
      toast.success('Settings saved successfully')
    } else {
      toast.error(response.error || 'Failed to save settings')
    }
    setIsLoading(false)
  }

  const handleResetDefaults = () => {
    setInactivityTimeout(String(DEFAULTS.inactivity_timeout_minutes))
    setSessionTimeout(String(DEFAULTS.session_timeout_minutes))
    setMaxLoginAttempts(String(DEFAULTS.max_login_attempts))
    setLockoutDuration(String(DEFAULTS.lockout_duration_minutes))
    setPasswordMinLength(String(DEFAULTS.password_min_length))
    toast.info('Form reset to defaults — click Save to apply')
  }

  const disabled = isLoading || isFetching

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
        <p className="text-gray-400">Configure system-wide security and authentication settings</p>
        {lastSaved?.updated_by && lastSaved?.updated_at && (
          <p className="text-xs text-gray-500 mt-1">
            Last updated by{' '}
            <span className="text-gray-400 font-medium">{lastSaved.updated_by}</span>{' '}
            {formatDistanceToNow(new Date(lastSaved.updated_at!), { addSuffix: true })}
          </p>
        )}
      </div>

      {isFetching && (
        <div className="rounded-xl border border-gray-800 bg-[#0f1d31]/40 p-8 text-center">
          <RefreshCw className="w-6 h-6 text-gray-500 animate-spin mx-auto mb-2" />
          <p className="text-sm text-gray-400">Loading current settings...</p>
        </div>
      )}

      {!isFetching && (
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
            {/* Inactivity Timeout */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                <Timer className="w-4 h-4 text-yellow-400" />
                Inactivity Timeout (minutes)
                <span className="text-xs bg-yellow-900/30 text-yellow-400 border border-yellow-800 px-1.5 py-0.5 rounded font-normal">
                  Min: 2
                </span>
              </label>
              <Input
                type="number"
                value={inactivityTimeout}
                onChange={(e) => setInactivityTimeout(e.target.value)}
                className="bg-[#0a1525] border-gray-800 text-white max-w-xs"
                disabled={disabled}
                min="2"
                max="120"
              />
              <p className="mt-1 text-xs text-gray-500">
                Auto-logout after this many minutes of no clicks or keypresses.
                Warning shown 60s before. Must be at least 2 minutes.
              </p>
            </div>

            {/* Session Timeout — clarified as JWT token lifespan only */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                <Clock className="w-4 h-4" />
                Token Refresh Interval (minutes)
              </label>
              <Input
                type="number"
                value={sessionTimeout}
                onChange={(e) => setSessionTimeout(e.target.value)}
                className="bg-[#0a1525] border-gray-800 text-white max-w-xs"
                disabled={disabled}
                min="5"
                max="1440"
              />
              {/* Clarification banner — makes it clear this is NOT a hard logout */}
              <div className="mt-2 flex items-start gap-2 rounded-lg bg-blue-950/30 border border-blue-800/50 px-3 py-2">
                <Info className="w-3.5 h-3.5 text-blue-400 mt-0.5 shrink-0" />
                <p className="text-xs text-blue-300/80">
                  This controls how often the access token is silently refreshed in the background —
                  <strong className="text-blue-200"> not a hard logout timer</strong>.
                  Sessions continue indefinitely as long as the user is active.
                  Only the inactivity timeout above will log users out automatically.
                </p>
              </div>
            </div>

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
                disabled={disabled}
                min="1"
                max="20"
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
                disabled={disabled}
                min="1"
                max="1440"
              />
              <p className="mt-1 text-xs text-gray-500">
                How long accounts remain locked after max failed attempts
              </p>
            </div>

            {/* Password Min Length */}
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
                disabled={disabled}
                min="6"
                max="128"
              />
              <p className="mt-1 text-xs text-gray-500">
                Minimum characters required for user passwords
              </p>
            </div>
          </div>
        </div>
      )}

      {!isFetching && (
        <div className="rounded-xl border border-yellow-800/50 bg-yellow-950/20 backdrop-blur-sm p-6">
          <div className="flex gap-4">
            <div className="shrink-0">
              <div className="w-10 h-10 rounded-full bg-yellow-900/20 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-yellow-400" />
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-yellow-200 mb-2">Important Notice</h3>
              <p className="text-sm text-yellow-300/80">
                Changes take effect on next page load. Inactivity timeout must be at least
                2 minutes to allow the 60s warning window. The token refresh interval does
                not cause logouts — users stay signed in via silent background refresh.
              </p>
            </div>
          </div>
        </div>
      )}

      {!isFetching && (
        <div className="flex gap-3">
          <Button
            onClick={handleSaveSettings}
            disabled={disabled}
            className="bg-[#25547e] hover:bg-[#25547e]/80 text-white"
          >
            {isLoading
              ? <><RefreshCw className="w-4 h-4 mr-2 animate-spin" />Saving...</>
              : <><Save className="w-4 h-4 mr-2" />Save Changes</>
            }
          </Button>
          <Button
            variant="outline"
            onClick={handleResetDefaults}
            disabled={disabled}
            className="border-gray-700 text-gray-700 hover:bg-[#0f1d31] hover:text-white"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Reset to Defaults
          </Button>
        </div>
      )}

      {!isFetching && (
        <div className="rounded-xl border border-gray-800 bg-[#0f1d31]/40 backdrop-blur-sm p-6">
          <h3 className="text-sm font-semibold text-white mb-4">Current Settings Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex justify-between py-2 border-b border-gray-800">
              <span className="text-gray-400">Inactivity Timeout:</span>
              <span className="text-white font-medium">{inactivityTimeout} minutes</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-800">
              <span className="text-gray-400">Token Refresh Interval:</span>
              <span className="text-white font-medium">{sessionTimeout} minutes</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-800">
              <span className="text-gray-400">Max Login Attempts:</span>
              <span className="text-white font-medium">{maxLoginAttempts}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-800">
              <span className="text-gray-400">Lockout Duration:</span>
              <span className="text-white font-medium">{lockoutDuration} minutes</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-800">
              <span className="text-gray-400">Min Password Length:</span>
              <span className="text-white font-medium">{passwordMinLength} characters</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}