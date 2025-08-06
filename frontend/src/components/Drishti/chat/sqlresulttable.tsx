const SQLResultsTable = ({ aiResponse }: { aiResponse: any }) => {
  console.log('SQLResultsTable received:', aiResponse);

  // Parse the response if it's a string
  let parsedResponse;
  try {
    if (typeof aiResponse === 'string') {
      parsedResponse = JSON.parse(aiResponse);
    } else {
      parsedResponse = aiResponse;
    }
  } catch (error) {
    console.error('Failed to parse AI response:', error);
    return (
      <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-600">Error parsing response data</p>
      </div>
    );
  }

  // Check if we have valid results
  if (!parsedResponse || !parsedResponse.result || !Array.isArray(parsedResponse.result) || parsedResponse.result.length === 0) {
    return (
      <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-gray-600 text-center">No results found</p>
      </div>
    );
  }

  const results = parsedResponse.result;
  const allColumns = Object.keys(results[0]);

  // Filter out ID columns and other unwanted columns
  const filteredColumns = allColumns.filter(column => {
    const lowerColumn = column.toLowerCase();
    return !lowerColumn.endsWith('id') &&
      !lowerColumn.endsWith('_id');
  });

  // Create display columns with renamed headers
  const displayColumns = filteredColumns.map(column => ({
    key: column,
    display: column === 'component_name' ? 'equipment_name' : column
  }));

  return (
    <div className="mt-6 space-y-4">
      {/* Query Info */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900">Query Results</h3>
          <span className="text-sm text-gray-600">
            {parsedResponse.records_retrieved || results.length} record{(parsedResponse.records_retrieved || results.length) !== 1 ? 's' : ''} found
          </span>
        </div>

        {/* Execution Status */}
        {parsedResponse.execution_status && (
          <div className="mb-3">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${parsedResponse.execution_status === 'success'
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
              }`}>
              {parsedResponse.execution_status}
            </span>
          </div>
        )}

        {/* Generated SQL */}
        {parsedResponse.generated_sql && (
          <details className="mb-4">
            <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-900">
              View generated SQL query
            </summary>
            <pre className="mt-2 p-3 bg-gray-50 rounded text-xs overflow-x-auto border border-gray-200">
              <code className="text-gray-800">{parsedResponse.generated_sql}</code>
            </pre>
          </details>
        )}
      </div>

      {/* Results Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                {displayColumns.map((column) => (
                  <th
                    key={column.key}
                    className="px-4 py-3 text-left text-sm font-medium text-gray-900 border-b border-gray-200"
                  >
                    {column.display.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {results.map((row, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  {displayColumns.map((column) => (
                    <td
                      key={column.key}
                      className="px-4 py-3 text-sm text-gray-900 border-b border-gray-100"
                    >
                      {row[column.key] !== null && row[column.key] !== undefined
                        ? String(row[column.key])
                        : '-'
                      }
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