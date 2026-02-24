// app/etl/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { Database, Search, RefreshCw } from 'lucide-react'
import { ETLComponentsTable } from '@/components/etl/etl-components-table'
import { getAllShips, getDepartmentsByShip, getComponentsByFilters, toggleETL } from '@/actions/etl/etl'
import type { Ship, Department, ComponentETLInfo } from '@/types/etl'

export default function ETLManagementPage() {
  // Dropdowns data
  const [ships, setShips] = useState<Ship[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  
  // Selected filters - Keep as strings (UUIDs)
  const [selectedShipId, setSelectedShipId] = useState<string>('')
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string>('')
  
  // Components data
  const [components, setComponents] = useState<ComponentETLInfo[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  // Load ships on mount
  useEffect(() => {
    const loadShips = async () => {
      const shipsData = await getAllShips()
      setShips(shipsData)
    }
    loadShips()
  }, [])

  // Load departments when ship changes
  useEffect(() => {
    const loadDepartments = async () => {
      if (!selectedShipId) {
        setDepartments([])
        setSelectedDepartmentId('')

        return
      }
      
      // Pass string directly (UUID)
      const depsData = await getDepartmentsByShip(selectedShipId)
      setDepartments(depsData)
      setSelectedDepartmentId('')
    }
    loadDepartments()
  }, [selectedShipId])

  const handleSubmit = async () => {
    if (!selectedShipId || !selectedDepartmentId) {
      alert('Please select both ship and department')
      
      return
    }

    setIsLoading(true)
    setIsSubmitted(true)
    
    try {
      // Pass strings directly (UUIDs)
      const componentsData = await getComponentsByFilters(
        selectedShipId, 
        selectedDepartmentId
      )
      setComponents(componentsData)
    } catch (error) {
      console.error('Failed to load components:', error)
      alert('Failed to load components. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleETL = async (componentId: string, enable: boolean) => {
    const result = await toggleETL(componentId, enable)
    
    if (result.success) {
      // Refresh the components list
      if (selectedShipId && selectedDepartmentId) {
        const componentsData = await getComponentsByFilters(
          selectedShipId, 
          selectedDepartmentId
        )
        setComponents(componentsData)
      }
    } else {
      alert(`Failed to ${enable ? 'enable' : 'disable'} ETL: ${result.error}`)
    }
  }

  const handleRefresh = () => {
    if (selectedShipId && selectedDepartmentId) {
      handleSubmit()
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <div className="bg-linear-to-r from-slate-900 via-blue-900 to-slate-900 border-b border-slate-800 shadow-2xl">
        <div className="max-w-7xl mx-auto p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <Database className="w-8 h-8 text-blue-400" />
                ETL Management
              </h1>
              <p className="text-slate-400 mt-1">Enable or disable ETL for Equipment</p>
            </div>
            
            {isSubmitted && (
              <button
                onClick={handleRefresh}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 backdrop-blur-xl border border-slate-700 text-white rounded-lg font-semibold hover:bg-slate-800 transition disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Filters */}
        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-xl shadow-2xl p-6">
          <div className="flex items-end gap-4">
            {/* Ship Dropdown */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-400 mb-2">
                Ship Name
              </label>
              <select
                value={selectedShipId}
                onChange={(e) => {
                  console.log('Ship changed to:', e.target.value)
                  setSelectedShipId(e.target.value)
                }}
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              >
                <option value="">Select Ship</option>
                {ships.map(ship => (
                  <option key={ship.ship_id} value={ship.ship_id}>
                    {ship.ship_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Department Dropdown */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-400 mb-2">
                Department
              </label>
              <select
                value={selectedDepartmentId}
                onChange={(e) => {
                  console.log('Department changed to:', e.target.value)
                  setSelectedDepartmentId(e.target.value)
                }}
                disabled={!selectedShipId || departments.length === 0}
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">Select Department</option>
                {departments.map(dept => (
                  <option key={dept.department_id} value={dept.department_id}>
                    {dept.department_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={!selectedShipId || !selectedDepartmentId || isLoading}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Search className="w-4 h-4" />
              {isLoading ? 'Loading...' : 'Submit'}
            </button>
          </div>
        </div>

        {/* Components Table */}
        <ETLComponentsTable 
          components={components}
          onToggleETL={handleToggleETL}
        />

        {/* Stats Footer */}
        {isSubmitted && components.length > 0 && (
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-xl p-4">
              <div className="text-sm text-slate-400">Total Components</div>
              <div className="text-2xl font-bold text-white mt-1">{components.length}</div>
            </div>
            <div className="bg-slate-900/50 backdrop-blur-xl border border-emerald-500/30 rounded-xl p-4">
              <div className="text-sm text-slate-400">ETL Enabled</div>
              <div className="text-2xl font-bold text-emerald-400 mt-1">
                {components.filter(c => c.etl_enabled).length}
              </div>
            </div>
            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-xl p-4">
              <div className="text-sm text-slate-400">ETL Disabled</div>
              <div className="text-2xl font-bold text-slate-400 mt-1">
                {components.filter(c => !c.etl_enabled).length}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}