import { useRef, useState, type PointerEvent, type ReactNode } from 'react'

type ToolbarFrameProps = {
  name: string
  className: string
  dragClassName: string
  resizeClassName: string
  initialX: number
  initialY: number
  children: ReactNode
}

type DragStart = {
  mouseX: number
  mouseY: number
  x: number
  y: number
}

type ResizeStart = {
  mouseX: number
  width: number
  scale: number
}

// 툴바 확대 비율을 75~200%로 제한
function limitScale(value: number) {
  return Math.min(2, Math.max(0.75, value))
}

function ToolbarFrame({
  name,
  className,
  dragClassName,
  resizeClassName,
  initialX,
  initialY,
  children,
}: ToolbarFrameProps) {
  const toolbarRef = useRef<HTMLDivElement>(null)
  const dragStart = useRef<DragStart | null>(null)
  const resizeStart = useRef<ResizeStart | null>(null)

  const [position, setPosition] = useState({ x: initialX, y: initialY })
  const [dragging, setDragging] = useState(false)
  const [scale, setScale] = useState(1)

  // 툴바 이동 시작
  const handleDragStart = (e: PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 || !e.isPrimary) return

    dragStart.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      x: position.x,
      y: position.y,
    }

    e.currentTarget.setPointerCapture(e.pointerId)
    setDragging(true)
  }

  // 포인터 이동 거리에 따라 툴바 위치 변경
  const handleDragMove = (e: PointerEvent<HTMLDivElement>) => {
    const start = dragStart.current
    if (!start || !e.currentTarget.hasPointerCapture(e.pointerId)) return

    setPosition({
      x: start.x + e.clientX - start.mouseX,
      y: start.y + e.clientY - start.mouseY,
    })
  }

  // 툴바 크기 조절 시작
  const handleResizeStart = (e: PointerEvent<HTMLButtonElement>) => {
    if (e.button !== 0 || !e.isPrimary || !toolbarRef.current) return

    resizeStart.current = {
      mouseX: e.clientX,
      width: toolbarRef.current.getBoundingClientRect().width,
      scale,
    }

    e.currentTarget.setPointerCapture(e.pointerId)
  }

  // 가로 드래그 거리에 따라 툴바 확대·축소
  const handleResizeMove = (e: PointerEvent<HTMLButtonElement>) => {
    const start = resizeStart.current
    if (!start || !e.currentTarget.hasPointerCapture(e.pointerId)) return

    const movedX = e.clientX - start.mouseX
    setScale(limitScale(start.scale * (1 + movedX / start.width)))
  }

  return (
    <div
      ref={toolbarRef}
      className={className}
      style={{
        position: 'fixed',
        left: position.x,
        top: position.y,
        zIndex: 99999,
        scale,
        transformOrigin: 'top left',
      }}
    >
      {/* 툴바 이동 손잡이 */}
      <div
        className={dragClassName}
        title={`드래그해서 ${name} 툴바 이동`}
        onPointerDown={handleDragStart}
        onPointerMove={handleDragMove}
        onLostPointerCapture={() => {
          dragStart.current = null
          setDragging(false)
        }}
        style={{
          cursor: dragging ? 'grabbing' : 'grab',
          touchAction: 'none',
          userSelect: 'none',
        }}
      >
        {dragging ? '이동 중...' : '⋮⋮ 드래그해서 이동'}
      </div>

      {children}

      {/* 툴바 크기 조절 손잡이 */}
      <button
        type="button"
        className={resizeClassName}
        title={`${name} 툴바 크기 조절 · 드래그 또는 좌우 방향키`}
        aria-label={`${name} 툴바 크기 조절`}
        onPointerDown={handleResizeStart}
        onPointerMove={handleResizeMove}
        onLostPointerCapture={() => {
          resizeStart.current = null
        }}
        onKeyDown={(e) => {
          if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return

          e.preventDefault()
          const step = e.key === 'ArrowRight' ? 0.1 : -0.1
          setScale((current) => limitScale(current + step))
        }}
      >
        <span aria-hidden="true">◢</span>
      </button>
    </div>
  )
}

export default ToolbarFrame