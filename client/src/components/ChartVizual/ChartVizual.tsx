import { forwardRef, useEffect, useMemo, useState } from 'react'
import { CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import './ChartVizual.sass'

interface ChartVizualProps {
    data: Array<{
        timestamp: string
        value: number
    }>
    dataKey: string
    color?: string
    minValue?: number
    maxValue?: number
}

const ChartVizual = forwardRef<HTMLDivElement, ChartVizualProps>(
    ({ data, dataKey, color = '#3498db', minValue, maxValue }, ref) => {
        const [windowWidth, setWindowWidth] = useState(window.innerWidth)

        useEffect(() => {
            const handleResize = () => {
                setWindowWidth(window.innerWidth)
            }

            window.addEventListener('resize', handleResize)
            return () => window.removeEventListener('resize', handleResize)
        }, [])

        const aggregatedData = useMemo(() => {
            if (!data || data.length === 0) {
                return []
            }

            const now = new Date()
            const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
            const thirtyDaysAgo = new Date(now.getTime() - 31 * 24 * 60 * 60 * 1000)

            if (data.every(item => new Date(item.timestamp) >= sevenDaysAgo)) {
                return data.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
            }

            const groupedData = new Map<string, Map<number, { sum: number; count: number }>>()

            data.forEach(item => {
                const date = new Date(item.timestamp)
                const dateKey = date.toISOString().split('T')[0]

                let intervalsPerDay = 1
                if (date >= thirtyDaysAgo) {
                    intervalsPerDay = 10
                }

                if (!groupedData.has(dateKey)) {
                    groupedData.set(dateKey, new Map())
                }

                const dayData = groupedData.get(dateKey)!

                if (intervalsPerDay === 1) {
                    if (!dayData.has(0)) {
                        dayData.set(0, { sum: 0, count: 0 })
                    }
                    const intervalData = dayData.get(0)!
                    intervalData.sum += item.value
                    intervalData.count += 1
                } else {
                    const intervalLength = 24 / intervalsPerDay
                    const intervalIndex = Math.floor(date.getHours() / intervalLength)

                    if (!dayData.has(intervalIndex)) {
                        dayData.set(intervalIndex, { sum: 0, count: 0 })
                    }
                    const intervalData = dayData.get(intervalIndex)!
                    intervalData.sum += item.value
                    intervalData.count += 1
                }
            })

            const result: Array<{ timestamp: string; value: number }> = []

            groupedData.forEach((intervals, date) => {
                intervals.forEach(({ sum, count }, intervalIndex) => {
                    const dateObj = new Date(date)

                    if (intervals.size === 1) {
                        dateObj.setHours(12, 0, 0, 0)
                    } else {
                        const intervalLength = 2.4
                        const hours = intervalIndex * intervalLength
                        dateObj.setHours(hours, 0, 0, 0)
                    }

                    result.push({
                        timestamp: dateObj.toISOString(),
                        value: sum / count,
                    })
                })
            })

            const sortedResult = result.sort(
                (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
            )
            return sortedResult
        }, [data])

        const values = aggregatedData.map(item => item.value)
        const dataMinValue = Math.min(...values)
        const dataMaxValue = Math.max(...values)

        const yAxisMin = Math.min(dataMinValue, minValue || dataMinValue)
        const yAxisMax = Math.max(dataMaxValue, maxValue || dataMaxValue)

        const range = yAxisMax - yAxisMin
        const paddingPercent = 0.1
        const paddedMin = yAxisMin - range * paddingPercent
        const paddedMax = yAxisMax + range * paddingPercent

        const step = (paddedMax - paddedMin) / 8

        const isMobile = windowWidth < 768
        const dotSize = isMobile ? 2 : 4
        const lineWidth = isMobile ? 1 : 2
        const activeDotSize = isMobile ? 4 : 8
        const fontSize = isMobile ? 10 : 12

        const formatDate = (timestamp: string) => {
            const date = new Date(timestamp)
            const now = new Date()
            const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
            const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

            if (date < thirtyDaysAgo) {
                return date.toLocaleString('sk-SK', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                })
            } else {
                return date.toLocaleString('sk-SK', {
                    day: '2-digit',
                    month: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                })
            }
        }

        return (
            <div className="chart-vizual" ref={ref}>
                <div className="chart-legend">
                    {minValue && (
                        <div className="legend-item">
                            <div className="legend-color" style={{ backgroundColor: '#326e23' }} />
                            <span>Min: {minValue}</span>
                        </div>
                    )}
                    {maxValue && (
                        <div className="legend-item">
                            <div className="legend-color" style={{ backgroundColor: '#e800d9' }} />
                            <span>Max: {maxValue}</span>
                        </div>
                    )}
                </div>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={aggregatedData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                        <XAxis
                            dataKey="timestamp"
                            stroke="rgba(255,255,255,0.5)"
                            tick={{ fill: 'rgba(255,255,255,0.5)', fontSize }}
                            tickFormatter={formatDate}
                        />
                        <YAxis
                            stroke="rgba(255,255,255,0.5)"
                            tick={{ fill: 'rgba(255,255,255,0.5)', fontSize }}
                            domain={[Math.floor(paddedMin), Math.ceil(paddedMax)]}
                            ticks={Array.from({ length: 9 }, (_, i) => Math.floor(paddedMin) + step * i)}
                            tickFormatter={value => Math.round(value).toString()}
                        />
                        <Tooltip
                            contentStyle={{
                                background: 'rgba(0,0,0,0.8)',
                                border: 'none',
                                borderRadius: '8px',
                                color: 'white',
                                fontSize: `${fontSize}px`,
                            }}
                            formatter={(value: number) => [value.toFixed(2), 'Priemerná hodnota']}
                            labelFormatter={formatDate}
                        />

                        <Line
                            type="monotone"
                            dataKey="value"
                            stroke={color}
                            strokeWidth={lineWidth}
                            dot={{ fill: color, r: dotSize }}
                            activeDot={{ r: activeDotSize }}
                        />

                        {minValue && (
                            <ReferenceLine
                                y={minValue}
                                stroke="#326e23"
                                strokeDasharray="3 3"
                                strokeWidth={lineWidth}
                            />
                        )}
                        {maxValue && (
                            <ReferenceLine
                                y={maxValue}
                                stroke="#e800d9"
                                strokeDasharray="3 3"
                                strokeWidth={lineWidth}
                            />
                        )}
                    </LineChart>
                </ResponsiveContainer>
            </div>
        )
    },
)

export default ChartVizual
