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

// Distinct, accessible color palette for ships
const SHIP_COLORS = [
    '#25547e', // navy blue
    '#e05c2e', // burnt orange
    '#2e9e6e', // teal green
    '#8b3fc8', // violet
    '#c8a82e', // golden
    '#c82e5e', // crimson
    '#2e7fc8', // sky blue
    '#5e8b3f', // olive green
]

const WARNING_COLOR = '#f59e0b'

export default function ReliabilityChart({ toolCalls }: ReliabilityChartProps) {
    const getReliabilityChartData = (toolCalls: ToolCall[]): ReliabilityData[] | null => {
        if (!toolCalls || !Array.isArray(toolCalls)) return null

        const reliabilityTool = toolCalls.find(tool => tool.name === 'get_component_reliability')
        if (!reliabilityTool || !reliabilityTool.result) return null

        const result = reliabilityTool.result

        // Handle single component result
        if (result.data && result.data.reliability_score !== undefined) {
            const fullName = result.data.nomenclature || result.data.component_name || 'Component'
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
                .map((item: any): ReliabilityData => {
                    const nomenclature = item.nomenclature || 'Unknown'
                    const ship = item.ship || item.ship_name || 'Unknown Ship'
                    const uniqueId = `${nomenclature} | ${ship}`
                    const fullName = `${nomenclature}`

                    return {
                        id: uniqueId,
                        name: fullName,
                        displayName: uniqueId,
                        reliability: (item.reliability * 100).toFixed(2),
                        ship: ship,
                        hasWarning: item.reliability === 0 || item.error !== null,
                        error: item.error
                    }
                })
                .sort((a: ReliabilityData, b: ReliabilityData) =>
                    a.id.localeCompare(b.id, undefined, { numeric: true, sensitivity: 'base' })
                )
        }

        return null
    }

    interface CustomTooltipProps {
        active?: boolean
        payload?: Array<{ payload: ReliabilityData }>
        label?: string
    }

    const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload
            const shipColor = data.hasWarning ? WARNING_COLOR : getShipColor(data.ship, shipColorMap)
            return (
                <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
                    <div className="flex items-center gap-2 mb-1">
                        <span
                            className="inline-block w-3 h-3 rounded-sm flex-shrink-0"
                            style={{ backgroundColor: shipColor }}
                        />
                        <p className="font-medium text-sm">{data.name}</p>
                    </div>
                    <p className="font-semibold">
                        {`Reliability: ${data.reliability}%`}
                    </p>
                    <p style={{ color: shipColor }} className="text-sm text-muted-foreground">
                        {`Ship: ${data.ship}`}
                    </p>
                    {data.hasWarning && (
                        <div className="mt-2 pt-2 border-t border-border">
                            <p className="text-xs text-amber-600 font-medium flex items-center gap-1">
                                ⚠️ {parseFloat(data.reliability) === 0 ? 'Zero reliability detected' : 'Data quality issue'}
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

    // Build a stable ship → color mapping based on order of first appearance
    const shipColorMap = buildShipColorMap(chartData)
    const barSize = Math.min(60, Math.max(20, 300 / chartData.length))

    // Unique ships for the legend
    const uniqueShips = Array.from(new Set(chartData.map(d => d.ship)))
    const hasWarnings = chartData.some(item => item.hasWarning)

    return (
        <div className="mt-6 w-[600px] max-w-full">
            <div className="rounded-lg border border-border p-4 bg-white" style={{ minHeight: 420 }}>
                <h3 className="text-black font-semibold mb-4">
                    Reliability Distribution (Duration: {toolCalls[0]?.arguments?.duration_hours || 'N/A'} hours)
                </h3>

                <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                        data={chartData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                        <XAxis dataKey="id" tick={false} height={10} />
                        <YAxis
                            className="text-muted-foreground"
                            tick={{ fontSize: 12 }}
                            domain={[0, 100]}
                            label={{ value: 'Reliability (%)', angle: -90, position: 'center', offset: 10 }}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={false} />
                        <Bar
                            dataKey="reliability"
                            name="Reliability"
                            radius={[4, 4, 0, 0]}
                            barSize={barSize}
                        >
                            {chartData.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={entry.hasWarning ? WARNING_COLOR : getShipColor(entry.ship, shipColorMap)}
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>

                {/* Ship color legend */}
                {uniqueShips.length > 1 && (
                    <div className="mt-4 pt-3 border-t border-border">
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-2">
                            Ships
                        </p>
                        <div className="flex flex-wrap gap-x-4 gap-y-2">
                            {uniqueShips.map(ship => (
                                <div key={ship} className="flex items-center gap-1.5">
                                    <span
                                        className="inline-block w-3 h-3 rounded-sm flex-shrink-0"
                                        style={{ backgroundColor: getShipColor(ship, shipColorMap) }}
                                    />
                                    <span className="text-xs text-gray-700">{ship}</span>
                                </div>
                            ))}
                            {hasWarnings && (
                                <div className="flex items-center gap-1.5">
                                    <span
                                        className="inline-block w-3 h-3 rounded-sm flex-shrink-0"
                                        style={{ backgroundColor: WARNING_COLOR }}
                                    />
                                    <span className="text-xs text-amber-600 font-medium">⚠️ Warning</span>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {hasWarnings && (
                    <div className="mt-3 text-sm text-amber-600 font-medium flex items-center gap-1">
                        ⚠️ Some components show zero reliability or data quality issues (highlighted in amber)
                    </div>
                )}
            </div>
        </div>
    )
}

// Build a map of ship name → color index based on order of appearance
function buildShipColorMap(data: ReliabilityData[]): Map<string, number> {
    const map = new Map<string, number>()
    let colorIndex = 0
    for (const item of data) {
        if (!map.has(item.ship)) {
            map.set(item.ship, colorIndex % SHIP_COLORS.length)
            colorIndex++
        }
    }
    return map
}

function getShipColor(ship: string, colorMap: Map<string, number>): string {
    const idx = colorMap.get(ship)
    return idx !== undefined ? SHIP_COLORS[idx] : SHIP_COLORS[0]
}