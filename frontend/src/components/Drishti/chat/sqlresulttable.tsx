const SQLResultsTable = ({ aiResponse }: { aiResponse: any }) => {
  let parsed: any;

  try {
    parsed = typeof aiResponse === 'string'
      ? JSON.parse(aiResponse)
      : aiResponse;
  } catch (e) {
    console.error('Parse error:', e);
    return (
      <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-600">Error parsing response data</p>
      </div>
    );
  }

  // Normalize alternate response shape
  if (!parsed?.result && parsed?.data?.rows) {
    parsed = {
      result: parsed.data.rows,
      records_retrieved: parsed.data.row_count,
      execution_status: parsed.success ? 'success' : 'error',
      generated_sql: parsed.data.generated_sql
        ?? (parsed.data.shape ? `-- Shape: ${parsed.data.shape}` : undefined),
    };
  }

  if (!Array.isArray(parsed?.result) || parsed.result.length === 0) {
    return (
      <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-gray-600 text-center">No results found</p>
      </div>
    );
  }

  const results = parsed.result;

  const columns = Object.keys(results[0])
    .filter((col) => {
      const l = col.toLowerCase();
      return (
        !l.endsWith('id') &&
        !l.endsWith('_id') &&
        l !== 'cmms_equipmentcode'
      );
    })
    .map((col) => ({
      key: col,
      display: col === 'component_name' ? 'equipment_name' : col,
    }));

  return (
    <div className="mt-6 space-y-4">
      {/* Wrapper card */}
      <div className="bg-card/70 border border-border rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-foreground">Query Results</h3>
          <span className="text-sm text-muted-foreground">
            {parsed.records_retrieved ?? results.length} record
            {(parsed.records_retrieved ?? results.length) !== 1 ? 's' : ''} found
          </span>
        </div>

        {parsed.execution_status && (
          <div className="mb-3">
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                parsed.execution_status === 'success'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {parsed.execution_status}
            </span>
          </div>
        )}

        {parsed.generated_sql && (
          <details className="mb-4">
            <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
              View generated query
            </summary>
            <pre className="mt-2 p-3 bg-muted/50 rounded text-xs overflow-x-auto border border-border">
              <code>{parsed.generated_sql}</code>
            </pre>
          </details>
        )}
      </div>

      {/* Table card */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/30">
              <tr>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className="px-4 py-3 text-left text-sm font-medium text-foreground border-b border-border"
                  >
                    {col.display
                      .replace(/_/g, ' ')
                      .replace(/\b\w/g, (l) => l.toUpperCase())}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {results.map((row: any, i: number) => (
                <tr key={i} className={i % 2 === 0 ? 'bg-background' : 'bg-muted/20'}>
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className="px-4 py-3 text-sm text-foreground border-b border-border/50"
                    >
                      {row[col.key] != null ? String(row[col.key]) : '-'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SQLResultsTable;