// components/etl/etl-components-table.tsx
'use client'

import { useState } from 'react'
import { Power, PowerOff } from 'lucide-react'
import { ConfirmModal } from './confirm-modal'
import type { ComponentETLInfo } from '@/types/etl'

interface ETLComponentsTableProps {
  components: ComponentETLInfo[]
  onToggleETL: (componentId: string, enable: boolean) => Promise<void>
}

export function ETLComponentsTable({ components, onToggleETL }: ETLComponentsTableProps) {
  const [modalState, setModalState] = useState<{
    isOpen: boolean
    componentId: string | null
    componentName: string
    action: 'enable' | 'disable'
  }>({
    isOpen: false,
    componentId: null,
    componentName: '',
    action: 'enable'
  })

  const handleToggleClick = (component: ComponentETLInfo, action: 'enable' | 'disable') => {
    setModalState({
      isOpen: true,
      componentId: component.component_id,
      componentName: component.component_name,
      action
    })
  }

  const handleConfirm = async () => {
    if (!modalState.componentId) return

    const enable = modalState.action === 'enable'
    await onToggleETL(modalState.componentId, enable)
  }

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return 'N/A'

    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)

    if (diffMins < 60) return `${diffMins}m ago`

    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours}h ago`

    const diffDays = Math.floor(diffHours / 24)

    return `${diffDays}d ago`
  }

  const formatNextSync = (dateString: string | null) => {
    if (!dateString) return 'N/A'

    const date = new Date(dateString)
    const now = new Date()
    const diffMs = date.getTime() - now.getTime()
    const diffMins = Math.floor(diffMs / 60000)

    if (diffMins < 0) return 'Overdue'
    if (diffMins < 60) return `in ${diffMins}m`

    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `in ${diffHours}h`

    const diffDays = Math.floor(diffHours / 24)

    return `in ${diffDays}d`
  }

  if (components.length === 0) {
    return (
      <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-xl shadow-2xl">
        <div className="p-12 text-center">
          <p className="text-slate-400 text-lg">Please select ship and department, then submit</p>
        </div>
      </div>
    )
  }
const sortedComponents = [...components].sort((a, b) =>
  a.nomenclature.localeCompare(b.nomenclature, undefined, { numeric: true, sensitivity: 'base' })
)
  return (
    <>
      <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-xl shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-800/50 border-b border-slate-700">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Nomenclature
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  ETL Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Last Synced
                </th>
                {/* <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Next Sync
                </th> */}
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {sortedComponents.map(component => (
                <tr key={component.component_id} className="hover:bg-slate-800/30 transition">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-white">{component.component_name}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-white">{component.nomenclature}</div>
                  </td>
                  <td className="px-6 py-4">
                    {component.etl_enabled ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full text-xs font-medium">
                        <Power className="w-3 h-3" />
                        Enabled
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-700/50 text-slate-400 border border-slate-600 rounded-full text-xs font-medium">
                        <PowerOff className="w-3 h-3" />
                        Disabled
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-slate-300 space-y-1">
                      <div>Monthly: {formatDateTime(component.monthly_last_sync)}</div>
                      <div>Overhaul: {formatDateTime(component.overhaul_last_sync)}</div>
                    </div>
                  </td>
                  {/* <td className="px-6 py-4">
                    <div className="text-sm text-slate-300 space-y-1">
                      <div>Monthly: {formatNextSync(component.monthly_next_sync)}</div>
                      <div>Overhaul: {formatNextSync(component.overhaul_next_sync)}</div>
                    </div>
                  </td> */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {component.etl_enabled ? (
                        <button
                          onClick={() => handleToggleClick(component, 'disable')}
                          className="px-3 py-1.5 bg-red-600/20 text-red-400 border border-red-500/30 rounded-lg text-sm font-medium hover:bg-red-600/30 transition"
                        >
                          Disable
                        </button>
                      ) : (
                        <button
                          onClick={() => handleToggleClick(component, 'enable')}
                          className="px-3 py-1.5 bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 rounded-lg text-sm font-medium hover:bg-emerald-600/30 transition"
                        >
                          Enable
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmModal
        isOpen={modalState.isOpen}
        onClose={() => setModalState({ ...modalState, isOpen: false })}
        onConfirm={handleConfirm}
        title={`${modalState.action === 'enable' ? 'Enable' : 'Disable'} ETL`}
        message={
          modalState.action === 'disable'
            ? `ETL will stop for "${modalState.componentName}". Are you sure?`
            : `ETL will start for "${modalState.componentName}". Are you sure?`
        }
        confirmText={modalState.action === 'enable' ? 'Enable' : 'Disable'}
        isDestructive={modalState.action === 'disable'}
      />
    </>
  )
}