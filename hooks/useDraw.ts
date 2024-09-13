import { useEffect, useRef, useState } from 'react'

interface Draw {
    ctx: CanvasRenderingContext2D
    currentPoint: Point
    prevPoint: Point | null
}

interface Point {
    x: number
    y: number
}

interface UseDraw {
    canvasRef: React.RefObject<HTMLCanvasElement>
    onMouseDown: () => void
    onMouseUp: () => void
    onClick: (e: React.MouseEvent<HTMLCanvasElement>) => void
    clear: () => void
}

export const useDraw = (
    onDraw: ({ ctx, currentPoint, prevPoint }: Draw) => void,
    brushColor: string,
    brushSize: number,
    isTwoClickMode: boolean
): UseDraw => {
    const [mouseDown, setMouseDown] = useState(false)
    const [isDrawing, setIsDrawing] = useState(false)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const prevPoint = useRef<null | Point>(null)

    const onMouseDown = () => {
        if (!isTwoClickMode) {
            setMouseDown(true)
        }
    }

    const onMouseUp = () => {
        if (!isTwoClickMode) {
            setMouseDown(false)
            prevPoint.current = null
        }
    }

    const computePointInCanvas = (e: MouseEvent | React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current
        if (!canvas) return null

        const rect = canvas.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top

        return { x, y }
    }

    const onClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (isTwoClickMode) {
            setIsDrawing(!isDrawing)
            if (!isDrawing) {
                const point = computePointInCanvas(e)
                prevPoint.current = point
            } else {
                prevPoint.current = null
            }
        }
    }

    const clear = () => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        ctx.clearRect(0, 0, canvas.width, canvas.height)
    }

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if ((!isTwoClickMode && !mouseDown) || (isTwoClickMode && !isDrawing)) return
            const currentPoint = computePointInCanvas(e)
            const ctx = canvasRef.current?.getContext('2d')
            if (!ctx || !currentPoint) return

            ctx.strokeStyle = brushColor
            ctx.lineWidth = brushSize

            onDraw({ ctx, currentPoint, prevPoint: prevPoint.current })
            prevPoint.current = currentPoint
        }

        const computePointInCanvas = (e: MouseEvent | React.MouseEvent<HTMLCanvasElement>) => {
            const canvas = canvasRef.current
            if (!canvas) return

            const rect = canvas.getBoundingClientRect()
            const x = e.clientX - rect.left
            const y = e.clientY - rect.top

            return { x, y }
        }

        canvasRef.current?.addEventListener('mousemove', handler)

        return () => {
            canvasRef.current?.removeEventListener('mousemove', handler)
        }
    }, [onDraw, mouseDown, isDrawing, brushColor, brushSize, isTwoClickMode])

    return { canvasRef, onMouseDown, onMouseUp, onClick, clear }
}