import { useState, type MouseEvent as ReactMouseEvent } from 'react'

type FloatingToolbarProps = {
  text: string
  fontSize: number
  fontFamily: string
  textColor: string
  bold: boolean
  italic: boolean
  align: 'left' | 'center' | 'right'

  onTextChange: (text: string) => void
  onFontSizeChange: (size: number) => void
  onFontFamilyChange: (font: string) => void
  onColorChange: (color: string) => void
  onBoldChange: () => void
  onItalicChange: () => void
  onAlignChange: (align: 'left' | 'center' | 'right') => void
}

function FloatingToolbar({
  text,
  fontSize,
  fontFamily,
  textColor,
  bold,
  italic,
  align,
  onTextChange,
  onFontSizeChange,
  onFontFamilyChange,
  onColorChange,
  onBoldChange,
  onItalicChange,
  onAlignChange,
}: FloatingToolbarProps) {
  const [position, setPosition] = useState({
  x: window.innerWidth / 2 - 250,
  y: 80,
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
      className="floating-toolbar"
      style={{
        left: position.x,
        top: position.y,
      }}
    >
      <div
        className="toolbar-drag-handle"
        onMouseDown={handleMouseDown}
      >
        {dragging ? '이동 중...' : '⋮⋮ 드래그해서 이동'}
      </div>

      <div className="toolbar-controls">
        {/* 텍스트 내용 */}
        <input
          className="text-input"
          type="text"
          value={text}
          onChange={(e) => onTextChange(e.target.value)}
        />

        {/* 글꼴 */}
        <select
          value={fontFamily}
          onChange={(e) => onFontFamilyChange(e.target.value)}
        >
          <option value="Arial">Arial</option>
          <option value="Georgia">Georgia</option>
          <option value="Verdana">Verdana</option>
          <option value="Times New Roman">Times New Roman</option>
        </select>

        {/* 글씨 크기 */}
        <button
          onClick={() =>
            onFontSizeChange(Math.max(8, fontSize - 2))
          }
        >
          −
        </button>

        <span className="font-size-number">{fontSize}</span>

        <button
          onClick={() =>
            onFontSizeChange(Math.min(100, fontSize + 2))
          }
        >
          +
        </button>

        {/* 굵게 */}
        <button
          className={bold ? 'active-tool' : ''}
          onClick={onBoldChange}
        >
          <b>B</b>
        </button>

        {/* 기울임 */}
        <button
          className={italic ? 'active-tool' : ''}
          onClick={onItalicChange}
        >
          <i>I</i>
        </button>

        {/* 왼쪽 정렬 */}
        <button
          className={align === 'left' ? 'active-tool' : ''}
          onClick={() => onAlignChange('left')}
          title="왼쪽 정렬"
        >
          ≡
        </button>

        {/* 가운데 정렬 */}
        <button
          className={align === 'center' ? 'active-tool' : ''}
          onClick={() => onAlignChange('center')}
          title="가운데 정렬"
        >
          ≣
        </button>

        {/* 오른쪽 정렬 */}
        <button
          className={align === 'right' ? 'active-tool' : ''}
          onClick={() => onAlignChange('right')}
          title="오른쪽 정렬"
        >
          ≡
        </button>

        {/* 글자 색상 */}
        <label className="color-button" title="글자 색상">
          🎨
          <input
            type="color"
            value={textColor}
            onChange={(e) => onColorChange(e.target.value)}
          />
        </label>
      </div>
    </div>
  )
}

export default FloatingToolbar