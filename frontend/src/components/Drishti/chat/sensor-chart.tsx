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
import { useState, useEffect, useMemo } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

export default function SensorChart({ toolCalls }) {
    const [openAccordions, setOpenAccordions] = useState({})
    const [sensorStates, setSensorStates] = useState({})

    const sensorsData = useMemo(() => {
        if (!toolCalls || !Array.isArray(toolCalls)) return []
        const sensorTool = toolCalls.find(tool => tool.name === 'get_sensor_readings')
        if (!sensorTool || !sensorTool.result) return []
        const result = sensorTool.result
        if (!result.data?.results?.length) return []

        return result.data.results.map((componentData, index) => {
            const sensors = componentData.sensors
            const sensorKey = Object.keys(sensors)[0]
            const sensorData = sensors[sensorKey]
            
            if (!sensorData?.readings?.length) return null

            const minValue = sensorData.min_value
            const unit = sensorData.unit
            const maxValue = sensorData.max_value
            const readings = sensorData.readings

            const chartData = readings.map(reading => ({
                timestamp: new Date(reading.date).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
                value: reading.value,
                alert: reading.alert,
                operating_hours: reading.operating_hours,
                fullDate: reading.date
            })).reverse()

            const latestReading = chartData[chartData.length - 1]
            const isOutOfBounds = latestReading && (latestReading.value < minValue || latestReading.value > maxValue)

            return {
                id: `sensor-${index}`,
                data: chartData,
                minValue,
                maxValue,
                unit,
                sensorName: sensorKey,
                nomenclature: componentData.nomenclature,
                ship: componentData.ship,
                isOutOfBounds,
                latestValue: latestReading?.value
            }
        }).filter(Boolean)
    }, [toolCalls])

    useEffect(() => {
        if (sensorsData.length > 0) {
            const initialStates = {}
            const initialAccordions = {}
            
            sensorsData.forEach(sensor => {
                const dataLength = sensor.data.length
                const defaultView = Math.min(50, dataLength)
                initialStates[sensor.id] = {
                    showLastDot: true,
                    brushIndexes: { startIndex: dataLength - defaultView, endIndex: dataLength - 1 }
                }
                initialAccordions[sensor.id] = sensor.id === sensorsData[0].id
            })
            
            setSensorStates(initialStates)
            setOpenAccordions(initialAccordions)
        }
    }, [sensorsData])

    useEffect(() => {
        const intervals = []
        
        sensorsData.forEach(sensor => {
            const state = sensorStates[sensor.id]
            if (!state?.brushIndexes?.endIndex || !sensor.data) return
            
            const lastPoint = sensor.data[sensor.data.length - 1]
            const isLastPointOutOfBounds = lastPoint && (lastPoint.value < sensor.minValue || lastPoint.value > sensor.maxValue)
            const isShowingLastPoint = state.brushIndexes.endIndex === sensor.data.length - 1

            if (isLastPointOutOfBounds && isShowingLastPoint) {
                const interval = setInterval(() => {
                    setSensorStates(prev => ({
                        ...prev,
                        [sensor.id]: { ...prev[sensor.id], showLastDot: !prev[sensor.id].showLastDot }
                    }))
                }, 500)
                intervals.push(interval)
            }
        })

        return () => intervals.forEach(interval => clearInterval(interval))
    }, [sensorsData, sensorStates])

    const toggleAccordion = (sensorId) => {
        setOpenAccordions(prev => ({ ...prev, [sensorId]: !prev[sensorId] }))
    }

    const handleBrushChange = (sensorId, newIndexes) => {
        if (newIndexes?.startIndex !== undefined && newIndexes?.endIndex !== undefined) {
            setSensorStates(prev => ({
                ...prev,
                [sensorId]: { ...prev[sensorId], brushIndexes: { startIndex: newIndexes.startIndex, endIndex: newIndexes.endIndex } }
            }))
        }
    }

    const setTimeRange = (sensorId, sensor, range) => {
        const dataLength = sensor.data.length
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
    }

    if (!sensorsData.length) return null

    return (
        <div className="mt-6 space-y-4">
            {sensorsData.map((sensor) => {
                const state = sensorStates[sensor.id]
                if (!state) return null

                const isOpen = openAccordions[sensor.id]
                const filteredData = sensor.data.slice(state.brushIndexes.startIndex, state.brushIndexes.endIndex + 1)
                
                const allValues = sensor.data.map(d => d.value)
                const dataMin = Math.min(...allValues)
                const dataMax = Math.max(...allValues)
                const yMin = Math.floor(Math.min(sensor.minValue, dataMin) - 5)
                const yMax = Math.ceil(Math.max(sensor.maxValue, dataMax) + 5)

                const step = Math.ceil((yMax - yMin) / 6)
                const ticks = []
                for (let i = yMin; i <= yMax; i += step) ticks.push(i)
                if (!ticks.includes(sensor.minValue)) ticks.push(sensor.minValue)
                if (!ticks.includes(sensor.maxValue)) ticks.push(sensor.maxValue)
                const generateYAxisTicks = ticks.sort((a, b) => a - b)

                const renderDot = (props) => {
                    const { cx, cy, index, payload } = props
                    const isLast = index === (sensor.data.length - 1)
                    const isShowingLast = state.brushIndexes.endIndex === (sensor.data.length - 1)
                    if (isLast && isShowingLast && !state.showLastDot && (payload.value < sensor.minValue || payload.value > sensor.maxValue)) return null

                    const radius = (isLast && isShowingLast) ? 6 : (payload.alert ? 4 : 3)
                    const fill = payload.alert ? '#ef4444' : '#25547e'
                    const stroke = (isLast && isShowingLast) ? '#fff' : 'none'
                    return <circle key={`dot-${sensor.id}-${index}`} cx={cx} cy={cy} r={radius} fill={fill} stroke={stroke} strokeWidth={2} />
                }

                const CustomTooltip = ({ active, payload }) => {
                    if (active && payload && payload.length) {
                        const data = payload[0].payload
                        return (
                            <div className="bg-white border border-gray-300 rounded-lg p-3 shadow-lg">
                                <p className="font-medium text-gray-900">{data.timestamp}</p>
                                <p className={`font-semibold ${data.alert ? 'text-red-500' : 'text-blue-600'}`}>
                                    Value: {data.value}°C
                                </p>
                                <p className="text-sm text-gray-600">
                                    Operating Hours: {data.operating_hours}
                                </p>
                                {data.alert && (
                                    <p className="text-xs text-red-500 mt-1 font-semibold">⚠ Alert Triggered</p>
                                )}
                            </div>
                        )
                    }
                    return null
                }

                return (
                    <div key={sensor.id} className="rounded-lg border border-gray-300 bg-white shadow-sm overflow-hidden">
                        <button
                            onClick={() => toggleAccordion(sensor.id)}
                            className="w-full px-6 py-4 flex items-center justify-between bg-gradient-to-r from-blue-50 to-white hover:from-blue-100 hover:to-blue-50 transition-colors"
                        >
                            <div className="flex items-center gap-4 flex-1">
                                <div className="flex flex-col items-start">
                                    <h3 className="text-xl font-semibold text-gray-900">{sensor.nomenclature}</h3>
                                    <div className="flex items-center gap-3 mt-1">
                                        <span className="text-sm text-gray-600">{sensor.ship} • {sensor.sensorName}</span>
                                        {sensor.isOutOfBounds && (
                                            <span className="text-xs font-semibold text-red-600 bg-red-100 px-2 py-0.5 rounded-full">
                                                Alert
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="ml-auto mr-4">
                                    <span className="text-3xl font-bold text-gray-900">{sensor.latestValue} {sensor.unit}</span>
                                </div>
                            </div>
                            {isOpen ? <ChevronUp className="w-6 h-6 text-gray-600" /> : <ChevronDown className="w-6 h-6 text-gray-600" />}
                        </button>

                        {isOpen && (
                            <div className="p-6 border-t border-gray-200">
                                <div className="mb-6">
                                    <p className="text-sm text-gray-600">
                                        {sensor.isOutOfBounds ? '⚠ Latest value exceeds threshold' : '✓ Operating within normal range'}
                                    </p>
                                </div>

                                <ResponsiveContainer width="100%" height={400}>
                                    <LineChart data={filteredData} margin={{ top: 20, right: 30, left: 20, bottom: 70 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                        <XAxis dataKey="timestamp" tick={{ fontSize: 10, fill: '#6b7280' }} angle={-45} textAnchor="end" height={60} />
                                        <YAxis tick={{ fontSize: 12 }} domain={[yMin, yMax]} ticks={generateYAxisTicks} label={{ value: 'Temperature (°C)', angle: -90, position: 'insideLeft', style: { fill: '#374151' } }} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Legend wrapperStyle={{ paddingTop: '10px' }} />
                                        <ReferenceLine y={sensor.maxValue} stroke="#ef4444" strokeDasharray="5 5" label={{ value: `Max (${sensor.maxValue})`, position: 'right', fill: '#ef4444', fontSize: 11, fontWeight: 'bold' }} />
                                        <ReferenceLine y={sensor.minValue} stroke="#3b82f6" strokeDasharray="5 5" label={{ value: `Min (${sensor.minValue})`, position: 'right', fill: '#3b82f6', fontSize: 11, fontWeight: 'bold' }} />
                                        <Line type="monotone" dataKey="value" stroke="#25547e" strokeWidth={2.5} dot={renderDot} isAnimationActive={false} />
                                    </LineChart>
                                </ResponsiveContainer>

                                <div className="rounded-lg border border-gray-300 bg-gray-50 p-4 mt-6">
                                    <h4 className="text-sm font-semibold mb-3">Time Range Navigator</h4>
                                    <ResponsiveContainer width="100%" height={50}>
                                        <LineChart data={sensor.data}>
                                            <YAxis hide={true} domain={['dataMin', 'dataMax']} />
                                            <Brush
                                                dataKey="timestamp"
                                                height={60}
                                                stroke="#1e40af"
                                                fill="#dbeafe"
                                                startIndex={state.brushIndexes.startIndex}
                                                endIndex={state.brushIndexes.endIndex}
                                                onChange={(newIndexes) => handleBrushChange(sensor.id, newIndexes)}
                                                travellerWidth={12}
                                            >
                                                <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={1.5} dot={false} isAnimationActive={false} />
                                            </Brush>
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>

                                <div className="mt-4 pt-4 border-t border-gray-200 flex gap-2 flex-wrap">
                                    {['24h', '7d', '30d', 'all'].map(r => (
                                        <button 
                                            key={r} 
                                            onClick={() => setTimeRange(sensor.id, sensor, r)} 
                                            className={`px-4 py-2 text-sm font-medium rounded-lg shadow-sm text-white transition-colors ${r === 'all' ? 'bg-gray-600 hover:bg-gray-700' : 'bg-blue-600 hover:bg-blue-700'}`}
                                        >
                                            {r === '24h' ? 'Last 24h' : r === '7d' ? 'Last 7 Days' : r === '30d' ? 'Last 30 Days' : 'All Data'}
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