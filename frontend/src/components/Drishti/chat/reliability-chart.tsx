'use client'

import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

interface ReliabilityData {
    id: string
    name: string
    displayName: string
    reliability: string
    ship: string
    hasWarning: boolean
    error: string | null
}

interface ToolCall {
    name: string
    arguments?: {
        duration_hours?: number
    }
    result?: any
}

interface ReliabilityChartProps {
    toolCalls: ToolCall[]
}

export default function ReliabilityChart({ toolCalls }: ReliabilityChartProps) {
    const getReliabilityChartData = (toolCalls: ToolCall[]): ReliabilityData[] | null => {
        if (!toolCalls || !Array.isArray(toolCalls)) return null

        const reliabilityTool = toolCalls.find(tool => tool.name === 'get_component_reliability')
        if (!reliabilityTool || !reliabilityTool.result) return null

        const result = reliabilityTool.result

        // Handle single component result
        if (result.data && result.data.reliability_score !== undefined) {
            const fullName = result.data.nomenclature || result.data.component_name || 'Component'
            // FIX: check both 'ship' and 'ship_name' fields
            const shipName = result.data.ship || result.data.ship_name || 'Unknown Ship'
            return [{
                id: fullName,
                name: fullName,
                displayName: fullName,
                reliability: (result.data.reliability_score * 100).toFixed(2),
                ship: shipName,
                hasWarning: result.data.reliability_score === 0,
                error: null
            }]
        }

        // Handle multiple component results
        if (result.data && result.data.results && Array.isArray(result.data.results)) {
            return result.data.results
                .filter((item: any) => item.reliability !== null && item.reliability !== undefined)
                .map((item: any, index: number): ReliabilityData => {
                    const nomenclature = item.nomenclature || 'Unknown'
                    // FIX: check both 'ship' and 'ship_name' fields to handle backend inconsistency
                    const ship = item.ship || item.ship_name || 'Unknown Ship'

                    const uniqueId = `${nomenclature} | ${ship}`
                    const fullName = `${nomenclature} (${ship})`
                    const displayName = uniqueId

                    return {
                        id: uniqueId,
                        name: fullName,
                        displayName: displayName,
                        reliability: (item.reliability * 100).toFixed(2),
                        ship: ship,
                        hasWarning: item.reliability === 0 || item.error !== null,
                        error: item.error
                    }
                })
                // FIX: sort alphanumerically (GT1, GT2, GT3...) instead of by reliability
                .sort((a: ReliabilityData, b: ReliabilityData) =>
                    a.id.localeCompare(b.id, undefined, { numeric: true, sensitivity: 'base' })
                )
        }

        return null
    }

    interface CustomTooltipProps {
        active?: boolean
        payload?: Array<{
            payload: ReliabilityData
        }>
        label?: string
    }

    const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload
            return (
                <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
                    <p className="font-medium">{data.name}</p>
                    <p className="text-primary">
                        {`Reliability: ${data.reliability}%`}
                    </p>
                    <p className="text-sm text-muted-foreground">
                        {`Ship: ${data.ship}`}
                    </p>
                    {data.hasWarning && (
                        <div className="mt-2 pt-2 border-t border-border">
                            <p className="text-xs text-amber-600 font-medium flex items-center gap-1">
                                ⚠️ Warning: {parseFloat(data.reliability) === 0 ? 'Zero reliability detected' : 'Data quality issue'}
                            </p>
                            {data.error && (
                                <p className="text-xs text-muted-foreground mt-1">
                                    Error: {data.error}
                                </p>
                            )}
                        </div>
                    )}
                </div>
            )
        }
        return null
    }

    const chartData = getReliabilityChartData(toolCalls)

    if (!chartData || chartData.length === 0) return null

    // FIX: cap bar width so single bars look like bars, not rectangles
    const barSize = Math.min(60, Math.max(20, 300 / chartData.length))

    return (
        <div className="mt-6 w-[600px] max-w-full">
            {/* FIX: fixed min-height so removing bottom text doesn't shrink the chart */}
            <div className="rounded-lg border border-border p-4 bg-white" style={{ minHeight: 420 }}>
                <h3 className="text-black font-semibold mb-4">
                    Reliability Distribution (Duration: {toolCalls[0]?.arguments?.duration_hours || 'N/A'} hours)
                </h3>

                <ResponsiveContainer width="100%" height={350}>
                    <BarChart
                        data={chartData}
                        margin={{
                            top: 20,
                            right: 30,
                            left: 20,
                            bottom: 10,
                        }}
                    >
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                        <XAxis
                            dataKey="id"
                            tick={false}
                            height={10}
                        />
                        {/* FIX: static 0–100 domain, not dynamic */}
                        <YAxis
                            className="text-muted-foreground"
                            tick={{ fontSize: 12 }}
                            domain={[0, 100]}
                            label={{ value: 'Reliability (%)', angle: -90, position: 'center', offset: 10 }}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={false} />
                        {/* FIX: Legend removed */}
                        <Bar
                            dataKey="reliability"
                            name="Reliability"
                            fill="#25547e"
                            radius={[4, 4, 0, 0]}
                            barSize={barSize}  // FIX: constrained bar width
                        >
                            {chartData.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={entry.hasWarning ? "#f59e0b" : "#25547e"}
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>

                {/* FIX: warning line kept, static note line removed — height maintained by minHeight above */}
                {chartData.some(item => item.hasWarning) && (
                    <div className="mt-3 text-sm text-amber-600 font-medium flex items-center gap-1">
                        ⚠️ Warning: Some components show zero reliability or data quality issues (highlighted in amber)
                    </div>
                )}
            </div>
        </div>
    )
}