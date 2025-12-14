import { Download, FileText } from "lucide-react";
import { Button } from "@/registry/new-york-v4/ui/button";

interface RCMRecord {
  rcm_id?: string;
  nomenclature: string;
  component_id: string;
  ship?: string;
  component_name?: string;
  has_rcm: boolean;
  decision_path?: Record<string, any>;
  maintenance_policy?: string;
  created_date?: string;
  modified_date?: string;
  error?: string;
}

interface RCMToolCall {
  name: string;
  arguments: any;
  result: {
    success: boolean;
    data?: {
      name: string;
      ships?: string[] | null;
      results: RCMRecord[];
      summary: {
        total_records: number;
        records_with_rcm: number;
        records_without_rcm: number;
        nomenclatures: string[];
        ships: string[];
        components: string[];
      };
      description?: string;
    };
    error?: string;
  };
}

interface RCMResultsTableProps {
  toolCalls?: RCMToolCall[];
}

const RCMResultsTable = ({ toolCalls }: any) => {
  console.log('RCMResultsTable received:', toolCalls);

  // Find the RCM tool call
  const rcmToolCall = toolCalls?.find((tool: { name: string; }) => tool.name === 'get_rcm_records');

  if (!rcmToolCall) {
    return null;
  }

  const { result } = rcmToolCall;

  // Handle error case
  if (!result.success) {
    return (
      <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-600">{result.error || 'Failed to retrieve RCM records'}</p>
      </div>
    );
  }

  const { data } = result;

  if (!data || !data.results || data.results.length === 0) {
    return (
      <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-gray-600 text-center">No RCM records found</p>
      </div>
    );
  }

  const { results, summary } = data;

  // Function to download individual RCM report
  const downloadIndividualReport = (record: RCMRecord) => {
    const reportData = {
      nomenclature: record.nomenclature,
      component_name: record.component_name,
      ship: record.ship,
      maintenance_policy: record.maintenance_policy,
      decision_path: record.decision_path,
      created_date: record.created_date,
      modified_date: record.modified_date
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `RCM_Report_${record.nomenclature}_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Function to download consolidated report for all records
  const downloadConsolidatedReport = () => {
    const consolidatedData = {
      generated_at: new Date().toISOString(),
      summary: summary,
      query_parameters: {
        name: data.name,
        ships: data.ships
      },
      records: results.map(record => ({
        nomenclature: record.nomenclature,
        component_name: record.component_name,
        ship: record.ship,
        has_rcm: record.has_rcm,
        maintenance_policy: record.maintenance_policy,
        decision_path: record.decision_path,
        created_date: record.created_date,
        modified_date: record.modified_date,
        error: record.error
      }))
    };

    const blob = new Blob([JSON.stringify(consolidatedData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `RCM_Consolidated_Report_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Truncate long text for display
  const truncateText = (text: string | undefined, maxLength: number = 100): string => {
    if (!text) return '-';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  return (
    <div className="mt-6 space-y-4">
      {/* Query Info */}
      <div className="bg-card/70 border border-border rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-foreground">RCM Records</h3>
          <span className="text-sm text-muted-foreground">
            {summary.total_records} record{summary.total_records !== 1 ? 's' : ''} found
          </span>
        </div>

        {/* Status Summary */}
        <div className="mb-3 flex gap-4">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            {summary.records_with_rcm} with RCM
          </span>
          {summary.records_without_rcm > 0 && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
              {summary.records_without_rcm} without RCM
            </span>
          )}
        </div>

        {/* Description */}
        {data.description && (
          <p className="text-sm text-muted-foreground">{data.description}</p>
        )}
      </div>

      {/* Results Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/30">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-foreground border-b border-border">
                  Equipment
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-foreground border-b border-border">
                  Nomenclature
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-foreground border-b border-border">
                  Maintenance Policy
                </th>
                <th className="px-4 py-3 text-center text-sm font-medium text-foreground border-b border-border">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {results.map((record, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-background' : 'bg-muted/20'}>
                  {/* Equipment Name */}
                  <td className="px-4 py-3 text-sm text-foreground border-b border-border/50">
                    <div className="flex flex-col">
                      <span className="font-medium">{record.component_name || '-'}</span>
                      {record.ship && (
                        <span className="text-xs text-muted-foreground">{record.ship}</span>
                      )}
                    </div>
                  </td>

                  {/* Nomenclature */}
                  <td className="px-4 py-3 text-sm text-foreground border-b border-border/50">
                    {record.nomenclature || '-'}
                  </td>

                  {/* Maintenance Policy */}
                  <td className="px-4 py-3 text-sm text-foreground border-b border-border/50">
                    {record.has_rcm ? (
                      <div className="max-w-md">
                        <span className="line-clamp-2" title={record.maintenance_policy}>
                          {truncateText(record.maintenance_policy, 150)}
                        </span>
                        {record.maintenance_policy && record.maintenance_policy.length > 150 && (
                          <button 
                            className="text-xs text-primary hover:underline mt-1"
                            onClick={() => {
                              alert(record.maintenance_policy);
                            }}
                          >
                            Read more
                          </button>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted-foreground italic">
                        {record.error || 'No RCM record available'}
                      </span>
                    )}
                  </td>

                  {/* Download Button */}
                  <td className="px-4 py-3 text-sm border-b border-border/50">
                    <div className="flex justify-center">
                      {record.has_rcm ? (
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2"
                          onClick={() => downloadIndividualReport(record)}
                        >
                          <Download className="w-4 h-4" />
                          Download
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled
                          className="gap-2 opacity-50 cursor-not-allowed"
                        >
                          <FileText className="w-4 h-4" />
                          N/A
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Consolidated Download Button */}
        {summary.records_with_rcm > 0 && (
          <div className="border-t border-border p-4 bg-muted/20">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Download a consolidated report containing all {summary.records_with_rcm} RCM record{summary.records_with_rcm !== 1 ? 's' : ''}
              </div>
              <Button
                variant="default"
                className="gap-2"
                onClick={downloadConsolidatedReport}
              >
                <Download className="w-4 h-4" />
                Download All Records
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RCMResultsTable;