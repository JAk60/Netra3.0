"use client";

import React, { useState, useEffect } from "react";
import { Search, RefreshCw, CheckCircle, AlertCircle, Loader2, Filter, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
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

const registerEquipment = async (equipment: Equipment): Promise<any> => {
  const payload = {
    component_name: equipment.component_name,
    CMMS_EquipmentCode: equipment.CMMS_EquipmentCode,
    ship_name: equipment.ship_name,
    ship_category: equipment.ship_category,
    ship_class: equipment.ship_class,
    command: equipment.command,
    department: equipment.department,
    nomenclature: equipment.nomenclature,
  };

  const response = await fetch("http://localhost:8000/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const result = await response.json();

  // ✅ Handle 409 as "already exists" (success case)
  if (response.status === 409) {
    return { ...result, alreadyExists: true };
  }

  if (!response.ok) {
    throw new Error(result.detail || "Failed to register equipment");
  }

  return result;
};

// ================= HELPER: Generate unique key =================
const getEquipmentKey = (equipment: Equipment): string => {
  return `${equipment.ship_name}|${equipment.nomenclature}`;
};

// ================= COMPONENT =================

const EquipmentSyncDashboard: React.FC = () => {
  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
  const [filteredList, setFilteredList] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterShip, setFilterShip] = useState("ALL");
  const [syncStatus, setSyncStatus] = useState<Record<string, SyncStatus>>({});
  const [stats, setStats] = useState<Stats>({
    total: 0,
    synced: 0,
    failed: 0,
    pending: 0,
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  // ================= EFFECTS =================

  useEffect(() => {
    loadSourceData();
  }, []);

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
    setCurrentPage(1); // Reset to first page when filters change
  }, [searchTerm, filterShip, equipmentList]);

  useEffect(() => {
    const synced = Object.values(syncStatus).filter((s) => s === "success").length;
    const failed = Object.values(syncStatus).filter((s) => s === "error").length;

    setStats({
      total: equipmentList.length,
      synced,
      failed,
      pending: equipmentList.length - synced - failed,
    });
  }, [syncStatus, equipmentList]);

  // ================= PAGINATION =================

  const totalPages = Math.ceil(filteredList.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredList.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  // ================= HANDLERS =================

  const loadSourceData = async () => {
    setLoading(true);
    try {
      // 1️⃣ Fetch source equipment data
      const result = await fetchSourceData();
      
      if (!result.success) {
        throw new Error("Failed to load equipment data");
      }

      setEquipmentList(result.data);
      setFilteredList(result.data);

      // 2️⃣ Fetch sync status from database
      const statusResult = await fetchSyncStatus();
      
      // 3️⃣ Map database sync status to UI state
      const statusMap: Record<string, SyncStatus> = {};
      
      result.data.forEach((equipment) => {
        const key = getEquipmentKey(equipment);
        if (statusResult.synced[key]) {
          statusMap[key] = "success";
        }
      });

      setSyncStatus(statusMap);
      
      toast.success("Equipment data loaded successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to load equipment data");
    } finally {
      setLoading(false);
    }
  };

  const syncSingleEquipment = async (equipment: Equipment) => {
    const key = getEquipmentKey(equipment);
    setSyncStatus((p) => ({ ...p, [key]: "loading" }));

    try {
      const result = await registerEquipment(equipment);
      
      setSyncStatus((p) => ({ ...p, [key]: "success" }));
      
      if (result.alreadyExists) {
        toast.info(
          `Already synced: ${equipment.CMMS_EquipmentCode} – ${equipment.component_name}`
        );
      } else {
        toast.success(
          `Synced: ${equipment.CMMS_EquipmentCode} – ${equipment.component_name}`
        );
      }
    } catch (err: any) {
      setSyncStatus((p) => ({ ...p, [key]: "error" }));
      toast.error(err.message || "Equipment sync failed");
    }
  };

  const syncAllEquipment = async () => {
    setSyncing(true);
    toast.message("Sync started", {
      description: "Syncing all equipment records",
    });

    for (let i = 0; i < equipmentList.length; i++) {
      const key = getEquipmentKey(equipmentList[i]);
      
      // Skip already synced items
      if (syncStatus[key] === "success") {
        continue;
      }
      
      await syncSingleEquipment(equipmentList[i]);
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    setSyncing(false);
    toast.success("Equipment sync completed");
  };

  const getSyncStatusIcon = (equipment: Equipment) => {
    const key = getEquipmentKey(equipment);
    const status = syncStatus[key];

    if (status === "loading")
      return <Loader2 className="w-4 h-4 animate-spin text-blue-400" />;
    if (status === "success")
      return <CheckCircle className="w-4 h-4 text-green-400" />;
    if (status === "error")
      return <AlertCircle className="w-4 h-4 text-red-400" />;

    return null;
  };

  const ships = ["ALL", ...new Set(equipmentList.map((e) => e.ship_name))];

  // ================= RENDER =================

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-900 via-gray-800 to-gray-900 p-6">

      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 mb-6 shadow-xl">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-3xl font-bold text-white">
                Equipment Sync Dashboard
              </h1>
              <p className="text-gray-400">
                CMMS → NETRA
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={loadSourceData}
                disabled={loading}
                className="group relative px-6 py-3 bg-linear-to-r from-gray-700 to-gray-600 text-white rounded-lg font-medium overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-gray-500/50 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                <div className="absolute inset-0 bg-linear-to-r from-gray-600 to-gray-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative flex items-center gap-2">
                  <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                  Refresh
                </div>
              </button>
              <button
                onClick={syncAllEquipment}
                disabled={syncing || loading}
                className="group relative px-6 py-3 bg-linear-to-r from-blue-600 to-blue-500 text-white rounded-lg font-medium overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/50 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                <div className="absolute inset-0 bg-linear-to-r from-blue-500 to-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative flex items-center gap-2">
                  {syncing ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {syncing ? "Syncing…" : "Sync All"}
                </div>
              </button>
            </div>
          </div>

          {/* STATS */}
          <div className="grid grid-cols-4 gap-4">
            {["Total", "Synced", "Failed", "Pending"].map((k, i) => {
              const colors = [
                "from-indigo-600 to-indigo-500",
                "from-green-600 to-green-500",
                "from-red-600 to-red-500",
                "from-yellow-600 to-yellow-500"
              ];

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
            <div>
              <select
                value={filterShip}
                onChange={(e) => setFilterShip(e.target.value)}
                className="px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                {ships.map((ship) => (
                  <option key={ship} value={ship}>
                    {ship === "ALL" ? "All Ships" : ship}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <select
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                className="px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value={5}>5 per page</option>
                <option value={10}>10 per page</option>
                <option value={100}>100 per page</option>
              </select>
            </div>
          </div>
        </div>

        {/* TABLE */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden shadow-xl mb-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-900">
                <tr>
                  {["Status", "Code", "Component", "Nomenclature", "Dept", "Ship", "Action"].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-6 py-3 text-left text-xs text-gray-400 uppercase tracking-wider font-semibold"
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {currentItems.map((e, i) => {
                  const key = getEquipmentKey(e);

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
                          onClick={() => syncSingleEquipment(e)}
                          disabled={syncStatus[key] === "success"}
                          className="group relative px-4 py-2 bg-linear-to-r from-blue-600 to-blue-500 text-white text-xs rounded-md font-medium overflow-hidden transition-all duration-300 hover:shadow-md hover:shadow-blue-500/50 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                        >
                          <div className="absolute inset-0 bg-linear-to-r from-blue-500 to-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          <span className="relative">
                            {syncStatus[key] === "success" ? "✓ Synced" : "Sync"}
                          </span>
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
              <span className="font-semibold text-white">{Math.min(endIndex, filteredList.length)}</span> of{" "}
              <span className="font-semibold text-white">{filteredList.length}</span> results
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => goToPage(1)}
                disabled={currentPage === 1}
                className="p-2 rounded-lg bg-gray-700 text-white hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-110"
                title="First page"
              >
                <ChevronsLeft className="w-5 h-5" />
              </button>

              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-lg bg-gray-700 text-white hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-110"
                title="Previous page"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <div className="flex gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => goToPage(pageNum)}
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${currentPage === pageNum
                          ? "bg-linear-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/50 scale-110"
                          : "bg-gray-700 text-gray-300 hover:bg-gray-600 hover:scale-105"
                        }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg bg-gray-700 text-white hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-110"
                title="Next page"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              <button
                onClick={() => goToPage(totalPages)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg bg-gray-700 text-white hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-110"
                title="Last page"
              >
                <ChevronsRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default EquipmentSyncDashboard;