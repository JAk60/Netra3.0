// components/etl/etl-dashboard.tsx
'use client'

import type { Component, RecentJob, WatchmanStats } from '@/types/etl'
import { Activity, Database, RefreshCw, Trash2, UserMinus, UserPlus } from 'lucide-react'
import { useState } from 'react'
import ETLManagementPage from './etl-monitoring'
import EquipmentSyncDashboard from './views/register-view'
import UnregisterEquipment from './views/unregister-view'
import DeleteSpecificInfo from './views/delete-view'



export function ETLDashboard() {
  const [activeTab, setActiveTab] = useState<'register' | 'unregister' | 'delete' | 'etl'>('etl')

  return (
    <div className="min-h-screen bg-slate-950 w-full overflow-x-hidden">
      {/* Header */}
      <div className="bg-linear-to-r from-slate-900 via-blue-900 to-slate-900 border-b border-slate-800 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <Database className="w-8 h-8" />
                ETL Management Dashboard
              </h1>
              {/* <p className="text-slate-400 mt-1">Component Management & ETL Monitoring</p> */}
            </div>
            {/* <button
              onClick={onRefresh}
              className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 text-white px-4 py-2 rounded-lg font-semibold hover:bg-slate-800 transition flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button> */}
          </div>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="bg-slate-900/50 backdrop-blur-xl border-b border-slate-800 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-1">
            {[
              { id: 'register' as const, label: 'Register Equipment', icon: UserPlus },
              { id: 'unregister' as const, label: 'Unregister Equipment', icon: UserMinus },
              { id: 'delete' as const, label: 'Delete Specific Information', icon: Trash2 },
              { id: 'etl' as const, label: 'ETL Management', icon: Activity }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-4 font-medium border-b-2 transition flex items-center gap-2 ${activeTab === tab.id
                  ? 'border-blue-500 text-blue-400 bg-slate-800/50'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
                  }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Register Tab */}
        {activeTab === 'register' && (
          <EquipmentSyncDashboard />
        )}

        {/* Unregister Tab */}
        {activeTab === 'unregister' && (
          <UnregisterEquipment />
        )}

        {/* Delete Tab */}
        {activeTab === 'delete' && (
          <DeleteSpecificInfo />
        )}

        {/* ETL Monitoring Tab */}
        {activeTab === 'etl' && (
          <ETLManagementPage

          />
        )}
      </div>
    </div>
  )
}