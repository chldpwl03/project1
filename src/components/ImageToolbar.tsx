import { useState, type MouseEvent as ReactMouseEvent } from 'react'

type ImageToolbarProps = {
  opacity: number
  onOpacityChange: (opacity: number) => void
  onFlip: () => void
  onRotate: () => void
  onDelete: () => void
}

function ImageToolbar({
  opacity,
  onOpacityChange,
  onFlip,
  onRotate,
  onDelete,
}: ImageToolbarProps) {
  // 이미지 툴바가 처음 나타나는 위치
  const [position, setPosition] = useState({
    x: 300,
    y: 100,
  })

  const [dragging, setDragging] = useState(false)

  // 툴바 드래그 이동
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
      className="image-toolbar"
      style={{
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
        zIndex: 99999,
        display: 'block',
      }}
    >
      {/* 드래그 영역 */}
      <div
        className="image-toolbar-drag"
        onMouseDown={handleMouseDown}
      >
        {dragging ? '이동 중...' : '⋮⋮ 드래그해서 이동'}
      </div>

      {/* 이미지 편집 기능 */}
      <div className="image-toolbar-controls">
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

        <button onClick={onFlip}>
          ↔ 반전
        </button>

        <button onClick={onRotate}>
          ↻ 90°
        </button>

        <button
          className="delete-image-button"
          onClick={onDelete}
        >
          🗑 삭제
        </button>
      </div>
    </div>
  )
}

export default ImageToolbar