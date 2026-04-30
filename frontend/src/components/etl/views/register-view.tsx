"use client";

import React, { useState, useEffect } from "react";
import { Search, RefreshCw, CheckCircle, AlertCircle, Loader2, Filter, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, X } from "lucide-react";
import { toast } from "sonner";

// ================= TYPES =================

interface Equipment {
  component_name: string;
  CMMS_EquipmentCode: string;
  ship_name: string;
  ship_category: string;
  ship_class: string;
  command: string;
  department: string;
  nomenclature: string;
}

interface SourceDataResponse {
  success: boolean;
  data: Equipment[];
}

interface SyncStatusResponse {
  synced: Record<string, boolean>;
}

type SyncStatus = "loading" | "success" | "error";

type SystemType = "propulsion" | "power_generation" | "support" | "firing";

interface Stats {
  total: number;
  synced: number;
  failed: number;
  pending: number;
}

// ================= API CALLS =================

const fetchSourceData = async (): Promise<SourceDataResponse> => {
  const response = await fetch("http://localhost:8000/api/v1/etl/fetch_srcdb_data");
  if (!response.ok) throw new Error("Failed to fetch source data");
  return response.json();
};

const fetchSyncStatus = async (): Promise<SyncStatusResponse> => {
  const response = await fetch("http://localhost:8000/sync-status");
  if (!response.ok) throw new Error("Failed to fetch sync status");
  return response.json();
};

const registerEquipment = async (equipment: Equipment, systemType: SystemType): Promise<any> => {
  const payload = {
    component_name: equipment.component_name,
    CMMS_EquipmentCode: equipment.CMMS_EquipmentCode,
    ship_name: equipment.ship_name,
    ship_category: equipment.ship_category,
    ship_class: equipment.ship_class,
    command: equipment.command,
    department: equipment.department,
    nomenclature: equipment.nomenclature,
    system_type: systemType,
  };

  const response = await fetch("http://localhost:8000/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const result = await response.json();

  if (response.status === 409) {
    return { ...result, alreadyExists: true };
  }

  if (!response.ok) {
    throw new Error(result.detail || "Failed to register equipment");
  }

  return result;
};

// ================= HELPERS =================

const getEquipmentKey = (equipment: Equipment): string =>
  `${equipment.ship_name}|${equipment.nomenclature}`;

const SYSTEM_OPTIONS: { value: SystemType; label: string; color: string }[] = [
  { value: "propulsion",       label: "Propulsion",       color: "bg-blue-600 hover:bg-blue-500 border-blue-500" },
  { value: "power_generation", label: "Power Generation", color: "bg-yellow-600 hover:bg-yellow-500 border-yellow-500" },
  { value: "support",          label: "Support",          color: "bg-emerald-600 hover:bg-emerald-500 border-emerald-500" },
  { value: "firing",           label: "Firing",           color: "bg-red-600 hover:bg-red-500 border-red-500" },
];

// ================= SYSTEM SELECTION MODAL =================

interface SystemModalProps {
  equipment: Equipment | null;
  onConfirm: (systemType: SystemType) => void;
  onClose: () => void;
}

function SystemSelectionModal({ equipment, onConfirm, onClose }: SystemModalProps) {
  const [selected, setSelected] = useState<SystemType | null>(null);

  if (!equipment) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-gray-900 border border-gray-700 rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
          <h3 className="text-lg font-bold text-white">Select System Type</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Equipment info */}
        <div className="px-6 py-3 bg-gray-800/60 border-b border-gray-700">
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Registering</p>
          <p className="text-white font-semibold">{equipment.component_name}</p>
          <p className="text-gray-400 text-sm">{equipment.nomenclature} · {equipment.ship_name}</p>
        </div>

        {/* System options */}
        <div className="px-6 py-5 space-y-3">
          <p className="text-sm text-gray-400 mb-3">Which system does this equipment belong to?</p>
          {SYSTEM_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setSelected(opt.value)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-lg border transition-all text-left ${
                selected === opt.value
                  ? `${opt.color} text-white border-opacity-100`
                  : "bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-750 hover:border-gray-600"
              }`}
            >
              <span className="font-medium">{opt.label}</span>
              {selected === opt.value && (
                <CheckCircle className="w-4 h-4 text-white" />
              )}
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 bg-gray-800/50 border-t border-gray-700">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition"
          >
            Cancel
          </button>
          <button
            onClick={() => selected && onConfirm(selected)}
            disabled={!selected}
            className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Register
          </button>
        </div>
      </div>
    </div>
  );
}

// ================= MAIN COMPONENT =================

const EquipmentSyncDashboard: React.FC = () => {
  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
  const [filteredList, setFilteredList] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterShip, setFilterShip] = useState("ALL");
  const [syncStatus, setSyncStatus] = useState<Record<string, SyncStatus>>({});
  const [stats, setStats] = useState<Stats>({ total: 0, synced: 0, failed: 0, pending: 0 });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  // System modal state
  const [pendingEquipment, setPendingEquipment] = useState<Equipment | null>(null);

  // ================= EFFECTS =================

  useEffect(() => { loadSourceData(); }, []);

  useEffect(() => {
    let filtered = equipmentList;
    if (searchTerm) {
      filtered = filtered.filter(
        (item) =>
          item.component_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.CMMS_EquipmentCode.includes(searchTerm) ||
          item.nomenclature.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (filterShip !== "ALL") {
      filtered = filtered.filter((item) => item.ship_name === filterShip);
    }
    setFilteredList(filtered);
    setCurrentPage(1);
  }, [searchTerm, filterShip, equipmentList]);

  useEffect(() => {
    const synced = Object.values(syncStatus).filter((s) => s === "success").length;
    const failed = Object.values(syncStatus).filter((s) => s === "error").length;
    setStats({ total: equipmentList.length, synced, failed, pending: equipmentList.length - synced - failed });
  }, [syncStatus, equipmentList]);

  // ================= PAGINATION =================

  const totalPages = Math.ceil(filteredList.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = filteredList.slice(startIndex, startIndex + itemsPerPage);
  const goToPage = (page: number) => setCurrentPage(Math.max(1, Math.min(page, totalPages)));

  // ================= HANDLERS =================

  const loadSourceData = async () => {
    setLoading(true);
    try {
      const result = await fetchSourceData();
      if (!result.success) throw new Error("Failed to load equipment data");

      setEquipmentList(result.data);
      setFilteredList(result.data);

      const statusResult = await fetchSyncStatus();
      const statusMap: Record<string, SyncStatus> = {};
      result.data.forEach((equipment) => {
        const key = getEquipmentKey(equipment);
        if (statusResult.synced[key]) statusMap[key] = "success";
      });
      setSyncStatus(statusMap);

      toast.success("Equipment data loaded successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to load equipment data");
    } finally {
      setLoading(false);
    }
  };

  // Single row — open modal first
  const handleSingleSyncClick = (equipment: Equipment) => {
    setPendingEquipment(equipment);
  };

  // Called after system is selected in modal
  const handleSystemConfirm = async (systemType: SystemType) => {
    if (!pendingEquipment) return;
    setPendingEquipment(null); // close modal immediately

    const equipment = pendingEquipment;
    const key = getEquipmentKey(equipment);
    setSyncStatus((p) => ({ ...p, [key]: "loading" }));

    try {
      const result = await registerEquipment(equipment, systemType);
      setSyncStatus((p) => ({ ...p, [key]: "success" }));
      if (result.alreadyExists) {
        toast.info(`Already synced: ${equipment.CMMS_EquipmentCode} – ${equipment.component_name}`);
      } else {
        toast.success(`Synced: ${equipment.CMMS_EquipmentCode} – ${equipment.component_name}`);
      }
    } catch (err: any) {
      setSyncStatus((p) => ({ ...p, [key]: "error" }));
      toast.error(err.message || "Equipment sync failed");
    }
  };

  // Sync All — uses SUPPORT as default (no popup per row, that'd be chaos)
  const syncAllEquipment = async () => {
    setSyncing(true);
    toast.message("Sync started", { description: "Syncing all pending equipment with SUPPORT system" });

    for (let i = 0; i < equipmentList.length; i++) {
      const key = getEquipmentKey(equipmentList[i]);
      if (syncStatus[key] === "success") continue;

      const equipment = equipmentList[i];
      setSyncStatus((p) => ({ ...p, [getEquipmentKey(equipment)]: "loading" }));
      try {
        const result = await registerEquipment(equipment, "support");
        setSyncStatus((p) => ({ ...p, [getEquipmentKey(equipment)]: "success" }));
      } catch {
        setSyncStatus((p) => ({ ...p, [getEquipmentKey(equipment)]: "error" }));
      }
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    setSyncing(false);
    toast.success("Equipment sync completed");
  };

  const getSyncStatusIcon = (equipment: Equipment) => {
    const status = syncStatus[getEquipmentKey(equipment)];
    if (status === "loading") return <Loader2 className="w-4 h-4 animate-spin text-blue-400" />;
    if (status === "success") return <CheckCircle className="w-4 h-4 text-green-400" />;
    if (status === "error")   return <AlertCircle className="w-4 h-4 text-red-400" />;
    return null;
  };

  const ships = ["ALL", ...new Set(equipmentList.map((e) => e.ship_name))];

  // ================= RENDER =================

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-900 via-gray-800 to-gray-900 p-6">

      {/* System Selection Modal */}
      <SystemSelectionModal
        equipment={pendingEquipment}
        onConfirm={handleSystemConfirm}
        onClose={() => setPendingEquipment(null)}
      />

      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 mb-6 shadow-xl">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-3xl font-bold text-white">Equipment Sync Dashboard</h1>
              <p className="text-gray-400">CMMS → NETRA</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={loadSourceData}
                disabled={loading}
                className="group relative px-6 py-3 bg-linear-to-r from-gray-700 to-gray-600 text-white rounded-lg font-medium overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-gray-500/50 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                <div className="absolute inset-0 bg-linear-to-r from-gray-600 to-gray-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative flex items-center gap-2">
                  <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                  Refresh
                </div>
              </button>
              {/* <button
                onClick={syncAllEquipment}
                disabled={syncing || loading}
                className="group relative px-6 py-3 bg-linear-to-r from-blue-600 to-blue-500 text-white rounded-lg font-medium overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/50 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                <div className="absolute inset-0 bg-linear-to-r from-blue-500 to-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative flex items-center gap-2">
                  {syncing && <Loader2 className="w-4 h-4 animate-spin" />}
                  {syncing ? "Syncing…" : "Sync All"}
                </div>
              </button> */}
            </div>
          </div>

          {/* STATS */}
          <div className="grid grid-cols-4 gap-4">
            {["Total", "Synced", "Failed", "Pending"].map((k, i) => {
              const colors = ["from-indigo-600 to-indigo-500", "from-green-600 to-green-500", "from-red-600 to-red-500", "from-yellow-600 to-yellow-500"];
              return (
                <div key={k} className={`bg-linear-to-br ${colors[i]} p-4 rounded-lg shadow-lg transform transition-transform hover:scale-105`}>
                  <div className="text-sm text-white/80 font-medium">{k}</div>
                  <div className="text-2xl font-bold text-white">
                    {[stats.total, stats.synced, stats.failed, stats.pending][i]}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* FILTERS */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 mb-6 shadow-xl">
          <div className="flex gap-4 items-center">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by code, component, or nomenclature..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>
            <select
              value={filterShip}
              onChange={(e) => setFilterShip(e.target.value)}
              className="px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            >
              {ships.map((ship) => (
                <option key={ship} value={ship}>{ship === "ALL" ? "All Ships" : ship}</option>
              ))}
            </select>
            <select
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
              className="px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            >
              <option value={5}>5 per page</option>
              <option value={10}>10 per page</option>
              <option value={100}>100 per page</option>
            </select>
          </div>
        </div>

        {/* TABLE */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden shadow-xl mb-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-900">
                <tr>
                  {["Status", "Code", "Component", "Nomenclature", "Dept", "Ship", "Action"].map((h) => (
                    <th key={h} className="px-6 py-3 text-left text-xs text-gray-400 uppercase tracking-wider font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {currentItems.map((e, i) => {
                  const key = getEquipmentKey(e);
                  const isSynced = syncStatus[key] === "success";
                  return (
                    <tr key={`${key}-${i}`} className="border-t border-gray-700 hover:bg-gray-750 transition-colors">
                      <td className="px-6 py-4">{getSyncStatusIcon(e)}</td>
                      <td className="px-6 py-4 text-white font-mono text-sm">{e.CMMS_EquipmentCode}</td>
                      <td className="px-6 py-4 text-gray-300">{e.component_name}</td>
                      <td className="px-6 py-4 text-gray-400 text-sm">{e.nomenclature}</td>
                      <td className="px-6 py-4 text-blue-300 font-medium">{e.department}</td>
                      <td className="px-6 py-4 text-gray-400">{e.ship_name}</td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleSingleSyncClick(e)}
                          disabled={isSynced}
                          className="group relative px-4 py-2 bg-linear-to-r from-blue-600 to-blue-500 text-white text-xs rounded-md font-medium overflow-hidden transition-all duration-300 hover:shadow-md hover:shadow-blue-500/50 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                        >
                          <div className="absolute inset-0 bg-linear-to-r from-blue-500 to-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          <span className="relative">{isSynced ? "✓ Synced" : "Sync"}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* PAGINATION */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-400">
              Showing <span className="font-semibold text-white">{startIndex + 1}</span> to{" "}
              <span className="font-semibold text-white">{Math.min(startIndex + itemsPerPage, filteredList.length)}</span> of{" "}
              <span className="font-semibold text-white">{filteredList.length}</span> results
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => goToPage(1)} disabled={currentPage === 1} className="p-2 rounded-lg bg-gray-700 text-white hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-110"><ChevronsLeft className="w-5 h-5" /></button>
              <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1} className="p-2 rounded-lg bg-gray-700 text-white hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-110"><ChevronLeft className="w-5 h-5" /></button>
              <div className="flex gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum: number;
                  if (totalPages <= 5) pageNum = i + 1;
                  else if (currentPage <= 3) pageNum = i + 1;
                  else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                  else pageNum = currentPage - 2 + i;
                  return (
                    <button key={pageNum} onClick={() => goToPage(pageNum)} className={`px-4 py-2 rounded-lg font-medium transition-all ${currentPage === pageNum ? "bg-linear-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/50 scale-110" : "bg-gray-700 text-gray-300 hover:bg-gray-600 hover:scale-105"}`}>{pageNum}</button>
                  );
                })}
              </div>
              <button onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages} className="p-2 rounded-lg bg-gray-700 text-white hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-110"><ChevronRight className="w-5 h-5" /></button>
              <button onClick={() => goToPage(totalPages)} disabled={currentPage === totalPages} className="p-2 rounded-lg bg-gray-700 text-white hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-110"><ChevronsRight className="w-5 h-5" /></button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default EquipmentSyncDashboard;