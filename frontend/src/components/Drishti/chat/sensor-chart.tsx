'use client'

import {
    Line,
    LineChart,
    CartesianGrid,
    Legend,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
    ReferenceLine,
    Brush
} from 'recharts'
import { useState, useEffect, useMemo, useCallback } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Reading {
    date: string
    value: number
    alert: boolean
    operating_hours: number
}

interface SensorData {
    readings: Reading[]
    min_value: number
    max_value: number
    unit: string
}

interface ComponentData {
    nomenclature: string
    ship: string
    sensors: Record<string, SensorData>
}

interface ToolCall {
    name: string
    result?: {
        data?: {
            results?: ComponentData[]
        }
    }
}

interface ChartPoint {
    timestamp: string
    value: number
    alert: boolean
    operating_hours: number
    fullDate: string
}

interface ProcessedSensor {
    id: string
    data: ChartPoint[]
    minValue: number
    maxValue: number
    unit: string
    sensorName: string
    nomenclature: string
    ship: string
    isOutOfBounds: boolean
    latestValue: number | undefined
}

interface BrushIndexes {
    startIndex: number
    endIndex: number
}

interface SensorState {
    brushIndexes: BrushIndexes
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

interface TooltipPayloadEntry {
    payload: ChartPoint & { unit?: string }
}

interface CustomTooltipProps {
    active?: boolean
    payload?: TooltipPayloadEntry[]
    unit: string
}

function CustomTooltip({ active, payload, unit }: CustomTooltipProps) {
    if (!active || !payload?.length) return null
    const data = payload[0].payload
    return (
        <div className="bg-white border border-gray-300 rounded-lg p-3 shadow-lg text-sm">
            <p className="font-medium text-gray-900">{data.timestamp}</p>
            <p className={`font-semibold ${data.alert ? 'text-red-500' : 'text-blue-600'}`}>
                Value: {data.value} {unit}
            </p>
            <p className="text-gray-600">Operating Hours: {data.operating_hours}</p>
            {data.alert && (
                <p className="text-xs text-red-500 mt-1 font-semibold">⚠ Alert Triggered</p>
            )}
        </div>
    )
}

// ─── Custom Dot ───────────────────────────────────────────────────────────────

interface DotProps {
    cx?: number
    cy?: number
    index?: number
    payload?: ChartPoint
    totalLength: number
    endIndex: number
    sensorId: string
    dataLength: number
}

function CustomDot({ cx, cy, index, payload, totalLength, endIndex, sensorId, dataLength }: DotProps) {
    if (cx === undefined || cy === undefined || index === undefined || !payload) return null

    // index here is relative to filteredData; check if it's the last visible point
    const isLast = index === totalLength - 1
    const isShowingLast = endIndex === dataLength - 1

    const radius = isLast && isShowingLast ? 6 : payload.alert ? 4 : 3
    const fill = payload.alert ? '#ef4444' : '#25547e'
    const stroke = isLast && isShowingLast ? '#fff' : 'none'

    return (
        <circle
            key={`dot-${sensorId}-${index}`}
            cx={cx}
            cy={cy}
            r={radius}
            fill={fill}
            stroke={stroke}
            strokeWidth={2}
        />
    )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function SensorChart({ toolCalls }: { toolCalls: ToolCall[] }) {
    const [openAccordions, setOpenAccordions] = useState<Record<string, boolean>>({})
    const [sensorStates, setSensorStates] = useState<Record<string, SensorState>>({})

    const sensorsData = useMemo<ProcessedSensor[]>(() => {
        if (!toolCalls || !Array.isArray(toolCalls)) return []
        const sensorTool = toolCalls.find(tool => tool.name === 'get_sensor_readings')
        if (!sensorTool?.result?.data?.results?.length) return []

        const processed: ProcessedSensor[] = []

        sensorTool.result.data.results.forEach((componentData, componentIndex) => {
            const sensors = componentData.sensors
            if (!sensors) return

            Object.entries(sensors).forEach(([sensorKey, sensorData], sensorIndex) => {
                if (!sensorData?.readings?.length) return

                const { min_value: minValue, max_value: maxValue, unit, readings } = sensorData

                const chartData: ChartPoint[] = readings.map(reading => ({
                    timestamp: new Date(reading.date).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    }),
                    value: reading.value,
                    alert: reading.alert,
                    operating_hours: reading.operating_hours,
                    fullDate: reading.date
                })).reverse()

                const latestReading = chartData[chartData.length - 1]
                const isOutOfBounds = latestReading
                    ? latestReading.value < minValue || latestReading.value > maxValue
                    : false

                processed.push({
                    id: `sensor-${componentIndex}-${sensorIndex}`,
                    data: chartData,
                    minValue,
                    maxValue,
                    unit,
                    sensorName: sensorKey,
                    nomenclature: componentData.nomenclature,
                    ship: componentData.ship,
                    isOutOfBounds,
                    latestValue: latestReading?.value
                })
            })
        })

        return processed
    }, [toolCalls])

    useEffect(() => {
        if (sensorsData.length === 0) return
        const initialStates: Record<string, SensorState> = {}
        const initialAccordions: Record<string, boolean> = {}
        sensorsData.forEach((sensor, i) => {
            const dataLength = sensor.data.length
            const defaultView = Math.min(50, dataLength)
            initialStates[sensor.id] = {
                brushIndexes: { startIndex: dataLength - defaultView, endIndex: dataLength - 1 }
            }
            initialAccordions[sensor.id] = i === 0
        })
        setSensorStates(initialStates)
        setOpenAccordions(initialAccordions)
    }, [sensorsData])

    const toggleAccordion = useCallback((sensorId: string) => {
        setOpenAccordions(prev => ({ ...prev, [sensorId]: !prev[sensorId] }))
    }, [])

    const handleBrushChange = useCallback((sensorId: string, newIndexes: BrushIndexes) => {
        if (newIndexes?.startIndex !== undefined && newIndexes?.endIndex !== undefined) {
            setSensorStates(prev => ({
                ...prev,
                [sensorId]: { ...prev[sensorId], brushIndexes: newIndexes }
            }))
        }
    }, [])

    const setTimeRange = useCallback((sensorId: string, dataLength: number, range: string) => {
        let startIdx = 0
        switch (range) {
            case '24h': startIdx = Math.max(0, dataLength - 24); break
            case '7d': startIdx = Math.max(0, dataLength - 168); break
            case '30d': startIdx = Math.max(0, dataLength - 720); break
            case 'all': startIdx = 0; break
            default: startIdx = Math.max(0, dataLength - 50)
        }
        setSensorStates(prev => ({
            ...prev,
            [sensorId]: { ...prev[sensorId], brushIndexes: { startIndex: startIdx, endIndex: dataLength - 1 } }
        }))
    }, [])

    if (!sensorsData.length) return null

    return (
        <div className="mt-6 space-y-4">
            <style>{`
                @keyframes borderBlink {
                    0%, 49% { border-color: #dc2626; }
                    50%, 100% { border-color: transparent; }
                }
                .border-blink {
                    border: 2px solid #dc2626;
                    animation: borderBlink 1s step-end infinite;
                }
            `}</style>

            {sensorsData.map(sensor => {
                const state = sensorStates[sensor.id]
                if (!state) return null

                const isOpen = openAccordions[sensor.id]
                const { startIndex, endIndex } = state.brushIndexes
                const filteredData = sensor.data.slice(startIndex, endIndex + 1)

                // Domain must fit both threshold lines AND any out-of-bounds data points
                const allValues = sensor.data.map(d => d.value)
                const dataMin = Math.min(...allValues)
                const dataMax = Math.max(...allValues)
                const padding = (sensor.maxValue - sensor.minValue) * 0.3
                const yMin = Math.floor(Math.min(sensor.minValue - padding, dataMin - padding))
                const yMax = Math.ceil(Math.max(sensor.maxValue + padding, dataMax + padding))

                // Build ticks: evenly-spaced steps + exact min/max threshold values
                // Always include yMin and yMax so the axis boundaries never get clipped
                const range = yMax - yMin
                const step = Math.ceil(range / 5)
                const tickSet = new Set<number>()
                tickSet.add(yMin)                 // ← always show bottom of axis
                tickSet.add(yMax)                 // ← always show top of axis
                for (let v = yMin; v <= yMax; v += step) tickSet.add(v)
                tickSet.add(sensor.minValue)      // exact threshold line value
                tickSet.add(sensor.maxValue)      // exact threshold line value
                const yTicks = Array.from(tickSet).sort((a, b) => a - b)

                return (
                    <div
                        key={sensor.id}
                        className="rounded-lg overflow-hidden bg-white shadow-sm border border-gray-300"
                    >
                        {/* Accordion header */}
                        <button
                            onClick={() => toggleAccordion(sensor.id)}
                            className="w-full px-6 py-4 flex items-center justify-between bg-gradient-to-r from-blue-50 to-white hover:from-blue-100 hover:to-blue-50 transition-colors"
                        >
                            <div className="flex items-center gap-4 flex-1">
                                <div className="flex flex-col items-start">
                                    <h3 className="text-xl font-semibold text-gray-900">{sensor.nomenclature}</h3>
                                    <div className="flex items-center gap-3 mt-1">
                                        <span className="text-sm text-gray-600">
                                            {sensor.ship} • {sensor.sensorName}
                                        </span>
                                        {sensor.isOutOfBounds && (
                                            <span className="text-xs font-semibold text-red-600 bg-red-100 px-2 py-0.5 rounded-full">
                                                Alert
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="ml-auto mr-4">
                                    <span className="text-3xl font-bold text-gray-900">
                                        {sensor.latestValue} {sensor.unit}
                                    </span>
                                </div>
                            </div>
                            {isOpen
                                ? <ChevronUp className="w-6 h-6 text-gray-600" />
                                : <ChevronDown className="w-6 h-6 text-gray-600" />
                            }
                        </button>

                        {isOpen && (
                            <div className="p-6 border-t border-gray-200">
                                <p className="text-sm text-gray-600 mb-6">
                                    {sensor.isOutOfBounds
                                        ? '⚠ Latest value exceeds threshold'
                                        : '✓ Operating within normal range'}
                                </p>

                                <div className={`rounded-lg overflow-hidden ${sensor.isOutOfBounds ? 'border-blink' : ''}`}>
                                    <ResponsiveContainer width="100%" height={400}>
                                        <LineChart
                                            data={filteredData}
                                            margin={{ top: 20, right: 80, left: 20, bottom: 40 }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />

                                            {/* X axis — no tick labels, just a "Date" label */}
                                            <XAxis
                                                dataKey="timestamp"
                                                tick={false}
                                                label={{ value: 'Date', position: 'insideBottom', offset: -10, fill: '#6b7280', fontSize: 13 }}
                                            />

                                            {/* Y axis — clean ticks based on actual min/max */}
                                            <YAxis
                                                tick={{ fontSize: 12 }}
                                                domain={[yMin, yMax]}
                                                ticks={yTicks}
                                                label={{
                                                    value: `${sensor.sensorName} (${sensor.unit})`,
                                                    angle: -90,
                                                    position: 'insideLeft',
                                                    style: { fill: '#374151' }
                                                }}
                                            />
                                            <Tooltip
                                                content={<CustomTooltip unit={sensor.unit} />}
                                            />
                                            <Legend wrapperStyle={{ paddingTop: '10px' }} />

                                            {/* Reference lines use the values straight from the data */}
                                            <ReferenceLine
                                                y={sensor.maxValue}
                                                stroke="#ef4444"
                                                strokeDasharray="5 5"
                                                label={{
                                                    value: `Max (${sensor.maxValue})`,
                                                    position: 'right',
                                                    fill: '#ef4444',
                                                    fontSize: 11,
                                                    fontWeight: 'bold'
                                                }}
                                            />
                                            <ReferenceLine
                                                y={sensor.minValue}
                                                stroke="#3b82f6"
                                                strokeDasharray="5 5"
                                                label={{
                                                    value: `Min (${sensor.minValue})`,
                                                    position: 'right',
                                                    fill: '#3b82f6',
                                                    fontSize: 11,
                                                    fontWeight: 'bold'
                                                }}
                                            />

                                            <Line
                                                type="monotone"
                                                dataKey="value"
                                                stroke="#25547e"
                                                strokeWidth={2.5}
                                                dot={({ key, ...props }) => (
                                                    <CustomDot
                                                        key={key}
                                                        {...props}
                                                        totalLength={filteredData.length}
                                                        endIndex={endIndex}
                                                        sensorId={sensor.id}
                                                        dataLength={sensor.data.length}
                                                    />
                                                )}
                                                isAnimationActive={false}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>

                                {/* Time range navigator */}
                                <div className="rounded-lg border border-gray-300 bg-gray-50 p-4 mt-6">
                                    <h4 className="text-sm font-semibold mb-3">Time Range Navigator</h4>
                                    <ResponsiveContainer width="100%" height={50}>
                                        <LineChart data={sensor.data}>
                                            <YAxis hide domain={['dataMin', 'dataMax']} />
                                            <Brush
                                                dataKey="timestamp"
                                                height={60}
                                                stroke="#1e40af"
                                                fill="#dbeafe"
                                                startIndex={startIndex}
                                                endIndex={endIndex}
                                                onChange={(idx) =>
                                                    handleBrushChange(sensor.id, idx as BrushIndexes)
                                                }
                                                travellerWidth={12}
                                            >
                                                <Line
                                                    type="monotone"
                                                    dataKey="value"
                                                    stroke="#3b82f6"
                                                    strokeWidth={1.5}
                                                    dot={false}
                                                    isAnimationActive={false}
                                                />
                                            </Brush>
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>

                                {/* Quick-range buttons */}
                                <div className="mt-4 pt-4 border-t border-gray-200 flex gap-2 flex-wrap">
                                    {(['24h', '7d', '30d', 'all'] as const).map(r => (
                                        <button
                                            key={r}
                                            onClick={() => setTimeRange(sensor.id, sensor.data.length, r)}
                                            className={`px-4 py-2 text-sm font-medium rounded-lg shadow-sm text-white transition-colors ${r === 'all'
                                                ? 'bg-gray-600 hover:bg-gray-700'
                                                : 'bg-blue-600 hover:bg-blue-700'
                                                }`}
                                        >
                                            {r === '24h' ? 'Last 24h'
                                                : r === '7d' ? 'Last 7 Days'
                                                    : r === '30d' ? 'Last 30 Days'
                                                        : 'All Data'}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )
            })}
        </div>
    )
}