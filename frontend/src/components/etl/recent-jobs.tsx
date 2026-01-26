// components/etl/recent-jobs.tsx
import { GlassCard } from './glass-card'
import type { RecentJob } from '@/types/etl'

interface RecentJobsProps {
  jobs: RecentJob[]
}

export function RecentJobs({ jobs }: RecentJobsProps) {
  return (
    <GlassCard>
      <div className="p-6 border-b border-slate-800">
        <h2 className="text-xl font-bold text-white">Recent Job Executions</h2>
      </div>
      <div className="p-6 space-y-3">
        {jobs.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            No recent jobs found
          </div>
        ) : (
          jobs.map(job => (
            <div 
              key={job.id} 
              className="flex items-center justify-between p-4 bg-slate-800/30 rounded-lg border border-slate-800 hover:bg-slate-800/40 transition"
            >
              <div className="flex items-center gap-4">
                <div className={`w-2 h-2 rounded-full ${
                  job.status === 'completed' ? 'bg-emerald-500' :
                  job.status === 'running' ? 'bg-blue-500' :
                  job.status === 'error' ? 'bg-red-500' :
                  'bg-slate-500'
                }`} />
                <div>
                  <div className="font-semibold text-white">{job.component}</div>
                  <div className="text-sm text-slate-400">
                    {job.type === 'overhaul_readings' ? 'Overhaul Readings' : 'Monthly Utilization'}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-6 text-sm">
                <span className="text-slate-400">{job.rows} rows</span>
                <span className="text-slate-400">{job.duration}</span>
                <span className="text-slate-500">{job.time}</span>
                <JobStatusPill status={job.status} />
              </div>
            </div>
          ))
        )}
      </div>
    </GlassCard>
  )
}

function JobStatusPill({ status }: { status: string }) {
  const statusStyles = {
    completed: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    running: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    error: 'bg-red-500/20 text-red-400 border-red-500/30',
    idle: 'bg-slate-700/50 text-slate-300 border-slate-600',
    paused: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  }

  return (
    <span className={`px-3 py-1 rounded-full font-medium border text-xs ${
      statusStyles[status as keyof typeof statusStyles] || statusStyles.idle
    }`}>
      {status}
    </span>
  )
}