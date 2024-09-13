import React, { useState, useRef, useEffect, useCallback } from 'react'
import { useDraw } from '@/hooks/useDraw'

interface Point {
    x: number;
    y: number;
}

type DrawMode = 'free' | 'path';

const PatternMaker: React.FC<{onPatternCreated: (patternImage: HTMLImageElement, count: number) => void}> = ({ onPatternCreated }) => {
    const patternCanvasRef = useRef<HTMLCanvasElement>(null)
    const gridCanvasRef = useRef<HTMLCanvasElement>(null)
    const indicatorCanvasRef = useRef<HTMLCanvasElement>(null)
    const [patternSize] = useState({ width: 300, height: 300 })
    const [isDrawing, setIsDrawing] = useState(false)
    const [count, setCount] = useState(5)
    const [isShowingGrid, setIsShowingGrid] = useState(true)
    const [drawMode, setDrawMode] = useState<DrawMode>('free')
    const [pathPoints, setPathPoints] = useState<Point[]>([])
    const [isPathClosed, setIsPathClosed] = useState(false)



    useEffect(() => {
        const canvas = patternCanvasRef.current
        if (canvas) {
            canvas.width = patternSize.width
            canvas.height = patternSize.height
            const ctx = canvas.getContext('2d')
            if (ctx) {
                ctx.fillStyle = 'white'
                ctx.fillRect(0, 0, canvas.width, canvas.height)
                ctx.lineCap = 'round'
                ctx.lineJoin = 'round'
            }
        }

        // Draw grid
        const gridCanvas = gridCanvasRef.current
        if (gridCanvas) {
            gridCanvas.width = patternSize.width
            gridCanvas.height = patternSize.height
            const ctx = gridCanvas.getContext('2d')
            if (ctx) {
                ctx.strokeStyle = 'rgba(200, 200, 200, 0.5)'
                ctx.lineWidth = 1

                // Draw vertical lines
                for (let x = 0; x <= patternSize.width; x += 20) {
                    ctx.beginPath()
                    ctx.moveTo(x, 0)
                    ctx.lineTo(x, patternSize.height)
                    ctx.stroke()
                }

                // Draw horizontal lines
                for (let y = 0; y <= patternSize.height; y += 20) {
                    ctx.beginPath()
                    ctx.moveTo(0, y)
                    ctx.lineTo(patternSize.width, y)
                    ctx.stroke()
                }
            }
        }

        const indicatorCanvas = indicatorCanvasRef.current
        if (indicatorCanvas) {
            indicatorCanvas.width = patternSize.width
            indicatorCanvas.height = patternSize.height
        }


        const handleKeyPress = (e: KeyboardEvent) => {
            if (e.key === 's' && drawMode === 'path') {
                setIsPathClosed(prev => !prev)
            }
        }
        window.addEventListener('keydown', handleKeyPress)
        return () => {
            window.removeEventListener('keydown', handleKeyPress)
        }

    }, [patternSize, drawMode])


    const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (drawMode === 'free') {
            setIsDrawing(true)
            draw(e)
        } else if (drawMode === 'path') {
            const canvas = patternCanvasRef.current
            if (canvas) {
                const rect = canvas.getBoundingClientRect()
                const x = (e.clientX - rect.left) * (canvas.width / rect.width)
                const y = (e.clientY - rect.top) * (canvas.height / rect.height)
                setPathPoints(prev => [...prev, { x, y }])
            }
        }
    }

    const stopDrawing = () => {
        setIsDrawing(false)
        const ctx = patternCanvasRef.current?.getContext('2d')
        if (ctx) ctx.beginPath() // Start a new path when stopping drawing
    }

    const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (drawMode === 'free' && isDrawing) {
            const canvas = patternCanvasRef.current
            if (canvas) {
                const rect = canvas.getBoundingClientRect()
                const x = (e.clientX - rect.left) * (canvas.width / rect.width)
                const y = (e.clientY - rect.top) * (canvas.height / rect.height)
                const ctx = canvas.getContext('2d')
                if (ctx) {
                    ctx.strokeStyle = 'black'
                    ctx.lineWidth = 4
                    ctx.lineTo(x, y)
                    ctx.stroke()
                    ctx.beginPath()
                    ctx.moveTo(x, y)
                }
            }
        }
    }

    const drawPath = useCallback(() => {
        const canvas = patternCanvasRef.current
        if (canvas && pathPoints.length > 0) {
            const ctx = canvas.getContext('2d')
            if (ctx) {
                // Clear the canvas before redrawing
                ctx.clearRect(0, 0, canvas.width, canvas.height)

                // Draw the path
                ctx.strokeStyle = 'black'
                ctx.lineWidth = 2
                ctx.beginPath()
                ctx.moveTo(pathPoints[0].x, pathPoints[0].y)
                for (let i = 1; i < pathPoints.length; i++) {
                    ctx.lineTo(pathPoints[i].x, pathPoints[i].y)
                }
                if (isPathClosed) {
                    ctx.closePath()
                }
                ctx.stroke()

                // Draw indicator dots
                ctx.fillStyle = 'red'
                pathPoints.forEach((point, index) => {
                    ctx.beginPath()
                    ctx.arc(point.x, point.y, 4, 0, 2 * Math.PI)
                    ctx.fill()

                    // Draw a larger dot for the start point
                    if (index === 0) {
                        ctx.beginPath()
                        ctx.arc(point.x, point.y, 6, 0, 2 * Math.PI)
                        ctx.fill()
                    }
                })

                // Draw an extra indicator for closed path
                if (isPathClosed) {
                    ctx.fillStyle = 'green'
                    ctx.beginPath()
                    ctx.arc(pathPoints[0].x, pathPoints[0].y, 8, 0, 2 * Math.PI)
                    ctx.fill()
                }
            }
        }
    }, [pathPoints, isPathClosed])

    useEffect(() => {
        drawPath()
    }, [pathPoints, drawPath, isPathClosed])

    const createPattern = () => {
        const canvas = patternCanvasRef.current
        if (canvas) {
            const image  = new Image()
            image.onload = () => onPatternCreated(image, count)
            image.src = canvas.toDataURL('image/png')
        }
    }

    const clearPattern = () => {
        const canvas = patternCanvasRef.current
        if (canvas) {
            const ctx = canvas.getContext('2d')
            if (ctx) {
                ctx.fillStyle = 'white'
                ctx.fillRect(0, 0, canvas.width, canvas.height)
            }
        }
    }

    const toggleDrawMode = () => {
        setDrawMode(prev => prev === 'free' ? 'path' : 'free')
        setPathPoints([])
    }

    return (
        <div className="pattern-maker mt-3">
            <h3 className="text-lg font-bold text-neutral-600 pt-12 mb-2">
                draw pattern seed to begin {drawMode === 'path' && "(Press 's' to open/close path)"}
            </h3>
            <div className="relative">
                <canvas
                    ref={patternCanvasRef}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    className="border border-gray-300 mb-2"
                    style={{width: `${patternSize.width}px`, height: `${patternSize.height}px`}}
                />
                <canvas
                    ref={gridCanvasRef}
                    className={`absolute top-0 left-0 pointer-events-none ${!isShowingGrid ? 'hidden' : ' '} `}
                    style={{width: `${patternSize.width}px`, height: `${patternSize.height}px`}}
                />
            </div>
            <div className="flex items-center w-1/3 place-content-around text-neutral-600 mb-2">
                <label className="mr-2">count:</label>
                <button onClick={() => setCount(Math.max(1, count - 1))} className="px-2 py-1 bg-gray-200">-</button>
                <span className="mx-2">{count}</span>
                <button onClick={() => setCount(count + 1)} className="px-2 py-1 bg-gray-200">+</button>
                <button onClick={() => setIsShowingGrid(!isShowingGrid)}>toggle grid</button>
            </div>
            <div className="flex space-x-2 text-[2rem] ">
                <button onClick={createPattern}
                        className="px-4 py-2 bg-transparent hover:bg-neutral-200 text-neutral-600 rounded"> /stamp
                </button>
                <button onClick={clearPattern}
                        className="px-4 py-2 bg-transparent hover:bg-neutral-200  text-neutral-600 rounded">/clear
                </button>
                <button onClick={toggleDrawMode}
                        className="px-4 py-2 bg-transparent hover:bg-neutral-200 text-neutral-600 rounded">
                    {drawMode === 'free' ? '/path' : '/free'}
                </button>
            </div>
        </div>
    )
}

const DrawingTool: React.FC = () => {
    const [canvasSize] = useState({width: 800, height: 800})
    const [patternImage, setPatternImage] = useState<HTMLImageElement | null>(null)
    const [patternCount, setPatternCount] = useState(0)

    const drawPattern = useCallback(({ctx}: { ctx: CanvasRenderingContext2D }) => {
        if (patternImage && patternCount > 0) {
            const patternWidth = canvasSize.width / patternCount
            const patternHeight = patternWidth
            const rowCount = Math.ceil(canvasSize.height / patternHeight)

            for (let i = 0; i < patternCount; i++) {
                for (let j = 0; j < rowCount; j++) {
                    ctx.drawImage(
                        patternImage,
                        i * patternWidth,
                        j * patternHeight,
                        patternWidth,
                        patternHeight
                    )
                }
            }
        }
    }, [patternImage, patternCount, canvasSize])

    const { canvasRef } = useDraw(drawPattern)

    const handlePatternCreated = (image: HTMLImageElement, count: number) => {
        setPatternImage(image)
        setPatternCount(count)
    }

    useEffect(() => {
        if (canvasRef.current) {
            const ctx = canvasRef.current.getContext('2d')
            if (ctx) {
                ctx.clearRect(0, 0, canvasSize.width, canvasSize.height)
                drawPattern({ ctx })
            }
        }
    }, [patternImage, patternCount, canvasSize, drawPattern, canvasRef])

    return (
        <div className="grid grid-cols-2 gap-44 items-start p-4 bg-gray-100">
            <div>
                <h1 className="text-6xl font-bold italic mb-4 text-gray-700">CANVUS</h1>
                <canvas
                    ref={canvasRef}
                    width={canvasSize.width}
                    height={canvasSize.height}
                    className="border border-gray-300 rounded-md bg-white shadow-lg"
                />
            </div>
            <div>
                <PatternMaker onPatternCreated={handlePatternCreated} />
            </div>
        </div>
    )
}

export default DrawingTool