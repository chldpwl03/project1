import { useState, type MouseEvent as ReactMouseEvent } from 'react'

type ShapeToolbarProps = {
  fillColor: string
  strokeColor: string
  opacity: number
  cornerRadius: number

  onFillColorChange: (color: string) => void
  onStrokeColorChange: (color: string) => void
  onOpacityChange: (opacity: number) => void
  onCornerRadiusChange: (radius: number) => void
  onDelete: () => void
}

function ShapeToolbar({
  fillColor,
  strokeColor,
  opacity,
  cornerRadius,
  onFillColorChange,
  onStrokeColorChange,
  onOpacityChange,
  onCornerRadiusChange,
  onDelete,
}: ShapeToolbarProps) {
  const [position, setPosition] = useState({
    x: 300,
    y: 100,
  })

  const [dragging, setDragging] = useState(false)

  const handleMouseDown = (e: ReactMouseEvent<HTMLDivElement>) => {
    setDragging(true)

    const startMouseX = e.clientX
    const startMouseY = e.clientY
    const startX = position.x
    const startY = position.y

    const handleMouseMove = (moveEvent: MouseEvent) => {
      setPosition({
        x: startX + (moveEvent.clientX - startMouseX),
        y: startY + (moveEvent.clientY - startMouseY),
      })
    }

    const handleMouseUp = () => {
      setDragging(false)

      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
  }

  return (
    <div
      className="shape-toolbar"
      style={{
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
        zIndex: 99999,
      }}
    >
      <div
        className="shape-toolbar-drag"
        onMouseDown={handleMouseDown}
      >
        {dragging ? '이동 중...' : '⋮⋮ 드래그해서 이동'}
      </div>

      <div className="shape-toolbar-controls">
        <span>채우기</span>

        <input
          type="color"
          value={fillColor}
          onChange={(e) => onFillColorChange(e.target.value)}
        />

        <span>테두리</span>

        <input
          type="color"
          value={strokeColor}
          onChange={(e) => onStrokeColorChange(e.target.value)}
        />

        <span>투명도</span>

        <input
          type="range"
          min="0.1"
          max="1"
          step="0.1"
          value={opacity}
          onChange={(e) =>
            onOpacityChange(Number(e.target.value))
          }
        />

        <span>{Math.round(opacity * 100)}%</span>

        <span>둥글기</span>

        <input
          type="range"
          min="0"
          max="50"
          step="5"
          value={cornerRadius}
          onChange={(e) =>
            onCornerRadiusChange(Number(e.target.value))
          }
        />

        <button
          className="delete-shape-button"
          onClick={onDelete}
        >
          🗑 삭제
        </button>
      </div>
    </div>
  )
}

export default ShapeToolbar