'use client'

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

export default function ReliabilityChart({ toolCalls }: ReliabilityChartProps) {
    const getReliabilityChartData = (toolCalls: ToolCall[]): ReliabilityData[] | null => {
        if (!toolCalls || !Array.isArray(toolCalls)) return null

        const reliabilityTool = toolCalls.find(tool => tool.name === 'get_component_reliability')
        if (!reliabilityTool || !reliabilityTool.result) return null

        const result = reliabilityTool.result

        // Handle single component result
        if (result.data && result.data.reliability_score !== undefined) {
            return [{
                name: result.data.nomenclature || result.data.component_name || 'Component',
                shortName: (result.data.nomenclature || result.data.component_name || 'Component').substring(0, 10),
                reliability: (result.data.reliability_score * 100).toFixed(2),
                ship: result.data.ship
            }]
        }

        // Handle multiple component results
        if (result.data && result.data.results && Array.isArray(result.data.results)) {
            return result.data.results
                .filter((item: any) => item.reliability !== null && item.reliability !== undefined)
                .map((item: any): ReliabilityData => {
                    const fullName = `${item.nomenclature || 'Unknown'} (${item.ship || 'Unknown Ship'})`
                    const shortName = `${(item.nomenclature || 'Unknown').substring(0, 8)}...`
                    return {
                        name: fullName,
                        shortName: shortName,
                        reliability: (item.reliability * 100).toFixed(2),
                        ship: item.ship || 'Unknown Ship'
                    }
                })
                .sort((a, b) => a.shortName.localeCompare(b.shortName)) // Sort by shortName alphabetically
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
                    Reliability Distribution (Duration: {toolCalls[0].arguments.duration_hours} hours)
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
                            dataKey="shortName"
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
                        />
                    </BarChart>
                </ResponsiveContainer>

                <div className="mt-3 text-sm text-muted-foreground">
                    * Reliability scores are shown as percentages. Higher values indicate better reliability.
                </div>
            </div>
        </div>
    )
}