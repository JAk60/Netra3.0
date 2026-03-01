import { Download, FileText } from "lucide-react";

import { pdf } from '@react-pdf/renderer';
import { RCMReportPDF } from "../rcm/RCMviews/pdf/RCMReportPDF";
import { Button } from "@/registry/new-york-v4/ui/button";
import { useUserSelectionStore } from "@/store/UserSelectionStore";


interface RCMRecord {
  rcm_id?: string;
  nomenclature: string;
  component_id: string;
  ship?: string;
  component_name?: string;
  parent_nomenclature?: string;
  has_rcm: boolean;
  decision_path?: {
    steps: Array<{
      questionId: string;
      question: string;
      answer: string;
    }>;
  };
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
      name: any;
      ships?: string[] | null;
      results: RCMRecord[];
      summary: {
        total_records: number;
        records_with_rcm: number;
        records_without_rcm: number;
        nomenclatures: string[];
        ships: string[];
        components: string[];
        unique_ships?: number;
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
  const { getShipLabel } = useUserSelectionStore();

  const rcmToolCall = toolCalls?.find((tool: { name: string }) => tool.name === 'get_rcm_records');

  if (!rcmToolCall) return null;

  const { result } = rcmToolCall;

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

  // ── Ship name helpers ──────────────────────────────────────────────────────

  /**
   * Resolve a single ship UUID → readable name.
   * Falls back to the raw UUID only if the store has no match.
   */
  const resolveShipName = (shipId: string): string => {
    if (!shipId) return 'Unknown Ship';
    const label = getShipLabel(shipId);
    // getShipLabel returns the id itself when not found in some store implementations
    // so we check if the result looks like a UUID and fall back gracefully
    return label && label !== shipId ? label : shipId;
  };

  /**
   * Resolve an array of ship UUIDs → comma-separated names.
   * Single ship  → "INS One"
   * Two ships    → "INS One, INS Two"
   * Three+       → "INS One, INS Two, INS Three"
   */
  const resolveShipNames = (shipIds: string[]): string => {
    if (!shipIds || shipIds.length === 0) return 'Unknown Ship';
    return shipIds.map(resolveShipName).join(', ');
  };

  // ── Individual PDF ─────────────────────────────────────────────────────────
  const downloadIndividualPDF = async (record: RCMRecord) => {
    try {
      // ✅ Use getShipLabel on the record's own ship UUID
      const shipName = resolveShipName(record.ship || '');

      const equipmentNames = record.parent_nomenclature
        ? [record.parent_nomenclature]
        : [record.component_name || record.nomenclature];

      const tableRows = [{
        equipment: record.parent_nomenclature || record.component_name || 'N/A',
        assembly: record.component_name || record.nomenclature,
        recommendation: record.maintenance_policy || 'N/A',
      }];

      const answers = record.decision_path?.steps?.map(step => ({
        question: step.question,
        answer: step.answer,
      })) || [];

      const now = new Date();

      const blob = await pdf(
        <RCMReportPDF
          shipName={shipName}
          equipmentNames={equipmentNames}
          tableRows={tableRows}
          answers={answers}
          generatedDate={now.toLocaleDateString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric',
          })}
          generatedTime={now.toLocaleTimeString('en-US', {
            hour: '2-digit', minute: '2-digit',
          })}
        />
      ).toBlob();

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `RCM_Report_${record.nomenclature}_${now.toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  // ── Consolidated PDF ───────────────────────────────────────────────────────
 const downloadConsolidatedReport = async () => {
  try {
    const shipName = summary.ships?.length
      ? summary.ships
          .map((uuid: string) => getShipLabel(uuid))
          .join(', ')
      : 'Unknown Ship';

    const equipmentNames = Array.from(
      new Set(
        results
          .filter((r: any) => r.has_rcm)
          .map((r: any) =>
            r.parent_nomenclature ||
            r.component_name ||
            r.nomenclature
          )
      )
    );

    const tableRows = results
      .filter((record: any) => record.has_rcm)
      .map((record: any) => {
        const shipUuid =
          record.ship ||
          record.ship_id ||
          '';

        const resolvedShip =
          shipUuid && getShipLabel(shipUuid) !== shipUuid
            ? getShipLabel(shipUuid)
            : shipUuid || 'Unknown Ship';

        return {
          equipment:
            record.parent_nomenclature ||
            record.component_name ||
            'N/A',
          shipName: resolvedShip,
          assembly:
            record.nomenclature ||
            record.component_name ||
            '',
          recommendation:
            record.maintenance_policy ||
            'N/A',
        };
      });

    const allAnswers = results
      .filter((r: any) => r.has_rcm && r.decision_path?.steps)
      .flatMap((r: any) =>
        r.decision_path.steps.map((step: any) => ({
          question: `[${getShipLabel(
            r.ship || r.ship_id || ''
          )} / ${r.component_name || r.nomenclature}] ${step.question}`,
          answer: step.answer,
        }))
      );

    const now = new Date();

    const blob = await pdf(
      <RCMReportPDF
        shipName={shipName}
        equipmentNames={equipmentNames}
        tableRows={tableRows}
        answers={allAnswers}
        generatedDate={now.toLocaleDateString()}
        generatedTime={now.toLocaleTimeString()}
      />
    ).toBlob();

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `RCM_Consolidated_Report_${now
      .toISOString()
      .split('T')[0]}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error(error);
    alert('Failed to generate consolidated PDF');
  }
};

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
                {/* ✅ Show Ship column when results span multiple ships */}
                {summary.unique_ships > 1 && (
                  <th className="px-4 py-3 text-left text-sm font-medium text-foreground border-b border-border">
                    Ship
                  </th>
                )}
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
              {results.map((record: RCMRecord, index: number) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-background' : 'bg-muted/20'}>
                  <td className="px-4 py-3 text-sm text-foreground border-b border-border/50">
                    <div className="flex flex-col">
                      <span className="font-medium">{record.component_name || '-'}</span>
                      {record.parent_nomenclature && (
                        <span className="text-xs text-muted-foreground">
                          Parent: {record.parent_nomenclature}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* ✅ Per-row ship name — resolved from UUID */}
                  {summary.unique_ships > 1 && (
                    <td className="px-4 py-3 text-sm text-foreground border-b border-border/50">
                      {resolveShipName(record.ship || '')}
                    </td>
                  )}

                  <td className="px-4 py-3 text-sm text-foreground border-b border-border/50">
                    {record.nomenclature || '-'}
                  </td>

                  <td className="px-4 py-3 text-sm text-foreground border-b border-border/50">
                    {record.has_rcm ? (
                      <div className="max-w-md">
                        <span className="line-clamp-2" title={record.maintenance_policy}>
                          {truncateText(record.maintenance_policy, 150)}
                        </span>
                        {record.maintenance_policy && record.maintenance_policy.length > 150 && (
                          <button
                            className="text-xs text-primary hover:underline mt-1"
                            onClick={() => alert(record.maintenance_policy)}
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

                  <td className="px-4 py-3 text-sm border-b border-border/50">
                    <div className="flex justify-center">
                      {record.has_rcm ? (
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2"
                          onClick={() => downloadIndividualPDF(record)}
                        >
                          <Download className="w-4 h-4" />
                          Download PDF
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

        {summary.records_with_rcm > 0 && (
          <div className="border-t border-border p-4 bg-muted/20">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Download a consolidated PDF report containing all {summary.records_with_rcm} RCM record{summary.records_with_rcm !== 1 ? 's' : ''}
              </div>
              <Button
                variant="default"
                className="gap-2"
                onClick={downloadConsolidatedReport}
              >
                <Download className="w-4 h-4" />
                Download All as PDF
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RCMResultsTable;