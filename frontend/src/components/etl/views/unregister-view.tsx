import React, { useState } from 'react';
import { Trash2, AlertTriangle, XCircle, CheckCircle, Loader2, Database, ChevronDown } from 'lucide-react';
import { Button } from '@/registry/new-york-v4/ui/button';
import { Card, CardContent } from '@/registry/new-york-v4/ui/card';
import GroupedCombobox from '@/registry/new-york-v4/ui/combo-box';
import { useUserSelectionStore } from '@/store/UserSelectionStore';

const UnregisterEquipment = () => {
  const [selectedShip, setSelectedShip] = useState('');
  const [selectedEquipment, setSelectedEquipment] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletionResult, setDeletionResult] = useState(null);
  const [error, setError] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  const { ships, getEquipmentForShip } = useUserSelectionStore();

  const handleShipChange = (shipId) => {
    setSelectedShip(shipId);
    setSelectedEquipment('');
  };

  const handleEquipmentChange = (equipmentId) => {
    setSelectedEquipment(equipmentId);
  };

  const openConfirmDialog = () => {
    setShowConfirmDialog(true);
    setConfirmText('');
    setError(null);
    setDeletionResult(null);
  };

  const closeConfirmDialog = () => {
    setShowConfirmDialog(false);
    setConfirmText('');
    setError(null);
  };

  const handleDelete = async () => {
    if (confirmText !== 'DELETE') return;

    setIsDeleting(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/v1/equipment/unregister/${selectedEquipment}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            component_id: selectedEquipment,
            confirm_deletion: true
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to delete equipment');
      }

      const result = await response.json();
      setDeletionResult(result);
      
      setTimeout(() => {
        setSelectedEquipment('');
        setShowConfirmDialog(false);
        setDeletionResult(null);
      }, 5000);

    } catch (err) {
      setError(err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const equipmentGroups = selectedShip ? getEquipmentForShip(selectedShip) : [];

  const selectedEquipmentName = equipmentGroups
    .flatMap(g => g.items)
    .find(item => item.value === selectedEquipment)?.label || 'Unknown Equipment';

  return (
    <div className="w-full bg-zinc-950 min-h-screen p-6 overflow-x-hidden">
      <div className="max-w-7xl mx-auto space-y-6 w-full">
        <Card className='bg-zinc-900 border-zinc-800'>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-6">
              <Database className="w-6 h-6 text-blue-500" />
              <h1 className="text-2xl font-bold text-zinc-100">Unregister Equipment</h1>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <GroupedCombobox
                  label="Select Ship"
                  placeholder={ships.length === 0 ? "Loading ships..." : "Choose a ship"}
                  groups={ships}
                  value={selectedShip}
                  onValueChange={handleShipChange}
                  disabled={ships.length === 0}
                />
              </div>
              <div className="space-y-2">
                <GroupedCombobox
                  label="Select Equipment"
                  placeholder={!selectedShip ? "Select a ship first" : equipmentGroups.length === 0 ? "No equipment available" : "Choose equipment"}
                  groups={equipmentGroups}
                  value={selectedEquipment}
                  onValueChange={handleEquipmentChange}
                  disabled={!selectedShip || equipmentGroups.length === 0}
                />
              </div>
              <div className="space-y-2 flex items-end">
                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  disabled={!selectedEquipment}
                  onClick={openConfirmDialog}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Unregister Equipment
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Confirmation Dialog */}
        {showConfirmDialog && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              {/* Success State */}
              {deletionResult && (
                <div className="p-6 space-y-4">
                  <div className="flex items-center gap-3 text-emerald-500">
                    <CheckCircle className="w-8 h-8" />
                    <h2 className="text-2xl font-bold text-zinc-100">Equipment Deleted Successfully</h2>
                  </div>

                  <div className="bg-emerald-950/40 border border-emerald-800/50 rounded-lg p-4 space-y-3">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="text-zinc-300">
                        <strong className="text-zinc-100">Component:</strong> {deletionResult.component_name}
                      </div>
                      <div className="text-zinc-300">
                        <strong className="text-zinc-100">Ship:</strong> {deletionResult.ship_name}
                      </div>
                      <div className="text-zinc-300">
                        <strong className="text-zinc-100">Department:</strong> {deletionResult.department_name}
                      </div>
                      <div className="text-zinc-300">
                        <strong className="text-emerald-400">Total Records Deleted:</strong> {deletionResult.deletion_summary.total_records_deleted}
                      </div>
                    </div>

                    {deletionResult.deleted_children.length > 0 && (
                      <div className="pt-3 border-t border-emerald-800/50">
                        <strong className="text-zinc-100">Child Components Deleted ({deletionResult.deletion_summary.child_components}):</strong>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {deletionResult.deleted_children.map((child, i) => (
                            <span key={i} className="bg-zinc-800 text-zinc-300 px-3 py-1 rounded-md text-xs border border-emerald-800/30">
                              {child}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="pt-3 border-t border-emerald-800/50">
                      <button
                        onClick={() => setShowDetails(!showDetails)}
                        className="flex items-center gap-2 text-zinc-100 font-medium hover:text-emerald-400 transition-colors"
                      >
                        <ChevronDown className={`w-4 h-4 transition-transform ${showDetails ? 'rotate-180' : ''}`} />
                        Deletion Breakdown
                      </button>
                      {showDetails && (
                        <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                          <div className="bg-zinc-800/50 px-3 py-2 rounded text-zinc-300">
                            <span className="text-zinc-400">Sensor Readings:</span> {deletionResult.deletion_summary.sensor_readings}
                          </div>
                          <div className="bg-zinc-800/50 px-3 py-2 rounded text-zinc-300">
                            <span className="text-zinc-400">Sensor Metadata:</span> {deletionResult.deletion_summary.sensor_metadata}
                          </div>
                          <div className="bg-zinc-800/50 px-3 py-2 rounded text-zinc-300">
                            <span className="text-zinc-400">Failure Modes:</span> {deletionResult.deletion_summary.failure_modes}
                          </div>
                          <div className="bg-zinc-800/50 px-3 py-2 rounded text-zinc-300">
                            <span className="text-zinc-400">ETL Schedules:</span> {deletionResult.deletion_summary.etl_schedules}
                          </div>
                          <div className="bg-zinc-800/50 px-3 py-2 rounded text-zinc-300">
                            <span className="text-zinc-400">Overhaul Readings:</span> {deletionResult.deletion_summary.overhaul_readings}
                          </div>
                          <div className="bg-zinc-800/50 px-3 py-2 rounded text-zinc-300">
                            <span className="text-zinc-400">RCM Records:</span> {deletionResult.deletion_summary.rcm_records}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={closeConfirmDialog}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors"
                  >
                    Close
                  </button>
                </div>
              )}

              {/* Error State */}
              {error && !deletionResult && (
                <div className="p-6 space-y-4">
                  <div className="flex items-center gap-3 text-rose-500">
                    <XCircle className="w-8 h-8" />
                    <h2 className="text-2xl font-bold text-zinc-100">Deletion Failed</h2>
                  </div>

                  <div className="bg-rose-950/40 border border-rose-800/50 rounded-lg p-4">
                    <p className="text-rose-400">{error}</p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={closeConfirmDialog}
                      className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 px-4 py-2.5 rounded-lg font-medium transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDelete}
                      disabled={isDeleting || confirmText !== 'DELETE'}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg disabled:opacity-50 font-medium transition-colors"
                    >
                      Retry
                    </button>
                  </div>
                </div>
              )}

              {/* Confirmation State */}
              {!deletionResult && !error && (
                <div className="p-6 space-y-4">
                  <div className="flex items-center gap-3 text-amber-500">
                    <AlertTriangle className="w-8 h-8" />
                    <h2 className="text-2xl font-bold text-zinc-100">Confirm Equipment Deletion</h2>
                  </div>

                  <div className="bg-amber-950/40 border-2 border-amber-800/50 rounded-lg p-4 space-y-3">
                    <p className="font-semibold text-amber-400 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5" />
                      WARNING: This action cannot be undone!
                    </p>
                    
                    <div className="text-sm space-y-1 text-zinc-300">
                      <p><strong className="text-zinc-100">Equipment:</strong> {selectedEquipmentName}</p>
                      <p><strong className="text-zinc-100">Component ID:</strong> <span className="font-mono text-xs bg-zinc-800 px-2 py-1 rounded">{selectedEquipment}</span></p>
                    </div>

                    <div className="bg-zinc-800/50 border border-amber-800/30 rounded-lg p-4 text-sm">
                      <p className="font-semibold mb-3 text-zinc-100">The following data will be PERMANENTLY DELETED:</p>
                      <ul className="space-y-1.5 text-xs text-zinc-300">
                        <li className="flex items-start gap-2">
                          <span className="text-amber-500 mt-0.5">•</span>
                          <span>This component and ALL child components</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-amber-500 mt-0.5">•</span>
                          <span>All sensor readings and metadata</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-amber-500 mt-0.5">•</span>
                          <span>All failure mode configurations</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-amber-500 mt-0.5">•</span>
                          <span>All ETL schedules, logs, and audit trails</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-amber-500 mt-0.5">•</span>
                          <span>All watchman monitoring data</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-amber-500 mt-0.5">•</span>
                          <span>All overhaul records and metadata</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-amber-500 mt-0.5">•</span>
                          <span>All RCM decision records</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-amber-500 mt-0.5">•</span>
                          <span>All reliability analysis data (EtaBeta, AlphaBeta)</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-zinc-300">
                      Type <span className="font-mono bg-amber-950/50 border border-amber-800/50 px-2 py-0.5 rounded text-amber-400 font-bold">DELETE</span> to confirm:
                    </label>
                    <input
                      type="text"
                      className="w-full p-3 bg-zinc-800 border-2 border-amber-800/50 rounded-lg text-zinc-100 focus:outline-none focus:border-blue-500 placeholder-zinc-500"
                      value={confirmText}
                      onChange={(e) => setConfirmText(e.target.value)}
                      placeholder="Type DELETE here"
                      disabled={isDeleting}
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={closeConfirmDialog}
                      disabled={isDeleting}
                      className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 px-4 py-2.5 rounded-lg disabled:opacity-50 font-medium transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDelete}
                      disabled={isDeleting || confirmText !== 'DELETE'}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium transition-colors"
                    >
                      {isDeleting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Deleting...
                        </>
                      ) : (
                        <>
                          <Trash2 className="w-4 h-4" />
                          Confirm Delete
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UnregisterEquipment;