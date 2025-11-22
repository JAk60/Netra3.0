const RULResultsTable = ({ toolCalls }: { toolCalls: any }) => {
  console.log('RULResultsTable received:', toolCalls);

  // Parse the response if it's a string
  let parsedResponse;
  try {
    if (typeof toolCalls === 'string') {
      parsedResponse = JSON.parse(toolCalls);
    } else {
      parsedResponse = toolCalls;
    }
  } catch (error) {
    console.error('Failed to parse response:', error);
    return (
      <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-600">Error parsing response data</p>
      </div>
    );
  }

  // Extract RUL data from tool_calls
const toolCall = Array.isArray(parsedResponse) ? parsedResponse[0] : parsedResponse;
  const result = toolCall?.result?.data;
console.log('result', result)
  // Check if we have valid results
  if (!result || !result.results || !Array.isArray(result.results) || result.results.length === 0) {
    return (
      <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-gray-600 text-center">No RUL results found</p>
      </div>
    );
  }

  const getUrgencyColor = (level: string) => {
    if (level.startsWith('CRITICAL')) return 'bg-red-100 text-red-800';
    if (level.startsWith('HIGH')) return 'bg-orange-100 text-orange-800';
    if (level.startsWith('MODERATE')) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  // Prepare table data - flatten sensor data for table rows
  const tableRows: any[] = [];
  result.results.forEach((equipmentResult: any) => {
    Object.entries(equipmentResult.sensors).map(([sensorName, sensorData]: [string, any]) => {
      tableRows.push({
        ship: equipmentResult.ship,
        equipment: equipmentResult.nomenclature,
        sensor: sensorName,
        rul_80: sensorData.Table['0.8'],
        rul_85: sensorData.Table['0.85'],
        rul_90: sensorData.Table['0.9'],
        rul_95: sensorData.Table['0.95'],
        beta: sensorData.weibull_params.beta,
        eta: sensorData.weibull_params.eta,
        vc: sensorData.latest_readings.vc,
        tp: sensorData.latest_readings.tp,
        t0: sensorData.latest_readings.t0
      });
    });
  });

  return (
    <div className="mt-6 space-y-4">
      {/* Query Info */}
      <div className="bg-card/70 border border-border rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-foreground">RUL Analysis Results</h3>
          <span className="text-sm text-muted-foreground">
            {result.summary.total_sensors_analyzed} sensor{result.summary.total_sensors_analyzed !== 1 ? 's' : ''} analyzed
          </span>
        </div>

        {/* Execution Status */}
        {result.urgency_level && (
          <div className="mb-3">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getUrgencyColor(result.urgency_level)}`}>
              {result.urgency_level}
            </span>
          </div>
        )}

        {/* Description */}
        {result.description && (
          <details className="mb-4">
            <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
              View analysis details
            </summary>
            <div className="mt-2 p-3 bg-muted/50 rounded text-xs border border-border">
              <p>{result.description}</p>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <div>
                  <span className="font-medium">Average RUL (90%):</span> {result.summary.overall_average_rul_hours_90pct.toFixed(2)} hrs
                </div>
                <div>
                  <span className="font-medium">Minimum RUL (90%):</span> {result.summary.overall_minimum_rul_hours_90pct.toFixed(2)} hrs
                </div>
                <div>
                  <span className="font-medium">Most Critical:</span> {result.summary.most_critical_sensor}
                </div>
                <div>
                  <span className="font-medium">Ships:</span> {result.summary.ships.join(', ')}
                </div>
              </div>
            </div>
          </details>
        )}
      </div>

      {/* Results Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/30">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-foreground border-b border-border">Ship</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-foreground border-b border-border">Equipment</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-foreground border-b border-border">Sensor</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-foreground border-b border-border">RUL @ 80%</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-foreground border-b border-border">RUL @ 85%</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-foreground border-b border-border">RUL @ 90%</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-foreground border-b border-border">RUL @ 95%</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-foreground border-b border-border">Beta (β)</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-foreground border-b border-border">Eta (η)</th>
              </tr>
            </thead>
            <tbody>
              {tableRows.map((row, index: number) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-background' : 'bg-muted/20'}>
                  <td className="px-4 py-3 text-sm text-foreground border-b border-border/50">
                    {row.ship}
                  </td>
                  <td className="px-4 py-3 text-sm text-foreground border-b border-border/50">
                    {row.equipment}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-foreground border-b border-border/50">
                    {row.sensor}
                  </td>
                  <td className="px-4 py-3 text-sm text-foreground border-b border-border/50">
                    {row.rul_80.toFixed(2)} hrs
                  </td>
                  <td className="px-4 py-3 text-sm text-foreground border-b border-border/50">
                    {row.rul_85.toFixed(2)} hrs
                  </td>
                  <td className="px-4 py-3 text-sm text-foreground border-b border-border/50">
                    {row.rul_90.toFixed(2)} hrs
                  </td>
                  <td className="px-4 py-3 text-sm text-foreground border-b border-border/50">
                    {row.rul_95.toFixed(2)} hrs
                  </td>
                  <td className="px-4 py-3 text-sm text-foreground border-b border-border/50">
                    {row.beta.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-sm text-foreground border-b border-border/50">
                    {row.eta.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RULResultsTable;