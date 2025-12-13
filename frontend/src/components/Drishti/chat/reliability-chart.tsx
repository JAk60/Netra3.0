'use client'

import { Bar, BarChart, CartesianGrid, Cell, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

interface ReliabilityData {
    id: string  // Unique identifier for the bar
    name: string
    displayName: string  // What to show on the axis
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
            return [{
                id: fullName,
                name: fullName,
                displayName: fullName,
                reliability: (result.data.reliability_score * 100).toFixed(2),
                ship: result.data.ship,
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
                    const ship = item.ship || 'Unknown Ship'
                    
                    // Use full nomenclature as unique ID
                    const uniqueId = `${nomenclature}-${item.component_id || index}`
                    
                    // Full name for tooltip
                    const fullName = `${nomenclature} (${ship})`
                    
                    // Shorter display name for axis
                    const displayName = nomenclature.length > 15 ? nomenclature.substring(0, 15) + '...' : nomenclature
                    
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
                .sort((a, b) => parseFloat(b.reliability) - parseFloat(a.reliability)) // Sort by reliability descending
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

    const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload
            return (
                <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
                    <p className="font-medium">{`${data.name}`}</p>
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

    return (
        <div className="mt-6">
            <div className=" rounded-lg border border-border p-4 bg-white">
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
                            bottom: 60, // Increased for rotated labels
                        }}
                    >
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                        <XAxis
                            dataKey="displayName"
                            className="text-muted-foreground"
                            tick={{ fontSize: 10 }}
                            angle={-45}
                            textAnchor="end"
                            interval={0} // Force show all labels
                            height={60}
                        />
                        <YAxis
                            className="text-muted-foreground"
                            tick={{ fontSize: 12 }}
                            label={{ value: 'Reliability (%)', angle: -90, position: 'insideLeft' }}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Bar
                            dataKey="reliability"
                            name="Equipment"
                            fill="#25547e"
                            radius={[4, 4, 0, 0]}
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

                <div className="mt-3 text-sm text-muted-foreground">
                    * Reliability scores are shown as percentages. Higher values indicate better reliability.
                    {chartData.some(item => item.hasWarning) && (
                        <div className="mt-2 text-amber-600 font-medium flex items-center gap-1">
                            ⚠️ Warning: Some components show zero reliability or data quality issues (highlighted in amber)
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}