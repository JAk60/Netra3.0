// components/etl/components-table.tsx
'use client'

import { GlassCard } from './glass-card'
import type { Component } from '@/types/etl'

interface ComponentsTableProps {
  components: Component[]
  onViewDetails?: (componentId: string) => void
  onRunNow?: (componentId: string, type: 'monthly' | 'overhaul') => void
}

export function ComponentsTable({ 
  components, 
  onViewDetails,
  onRunNow 
}: ComponentsTableProps) {
  return (
    <GlassCard>
      <div className="p-6 border-b border-slate-800">
        <h2 className="text-xl font-bold text-white">Components Status</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-800/50 border-b border-slate-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase">
                Component
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase">
                Monthly Util
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase">
                Overhaul
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {components.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                  No components found
                </td>
              </tr>
            ) : (
              components.map(comp => (
                <tr key={comp.id} className="hover:bg-slate-800/30 transition">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-white">{comp.name}</div>
                    <div className="text-sm text-slate-400">{comp.ship}</div>
                  </td>
                  <td className="px-6 py-4">
                    <JobStatusBadge jobStatus={comp.monthly_util} />
                  </td>
                  <td className="px-6 py-4">
                    <JobStatusBadge jobStatus={comp.overhaul} />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button 
                        onClick={() => onViewDetails?.(comp.id)}
                        className="text-blue-400 hover:text-blue-300 text-sm font-medium transition"
                      >
                        View
                      </button>
                      <button 
                        onClick={() => onRunNow?.(comp.id, 'monthly')}
                        className="text-emerald-400 hover:text-emerald-300 text-sm font-medium transition"
                      >
                        Run
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </GlassCard>
  )
}

function JobStatusBadge({ jobStatus }: { jobStatus: Component['monthly_util'] }) {
  const statusColors = {
    idle: 'bg-slate-700/50 text-slate-300 border-slate-600',
    running: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    completed: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    error: 'bg-red-500/20 text-red-400 border-red-500/30',
    paused: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  }

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <span className={`px-2 py-1 rounded text-xs font-medium border ${statusColors[jobStatus.status]}`}>
          {jobStatus.status}
        </span>
        {jobStatus.risk > 0 && (
          <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs font-bold border border-red-500/30">
            Risk: {jobStatus.risk}
          </span>
        )}
      </div>
      <div className="text-xs text-slate-500">Next: {jobStatus.next_run}</div>
      {jobStatus.last_sync && (
        <div className="text-xs text-slate-600">Last: {jobStatus.last_sync}</div>
      )}
    </div>
  )
}