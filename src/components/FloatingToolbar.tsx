import ToolbarFrame from './ToolbarFrame'

type TextAlign = 'left' | 'center' | 'right'

type FloatingToolbarProps = {
  text: string
  fontSize: number
  fontFamily: string
  textColor: string
  bold: boolean
  italic: boolean
  align: TextAlign
  onTextChange: (text: string) => void
  onFontSizeChange: (size: number) => void
  onFontFamilyChange: (font: string) => void
  onColorChange: (color: string) => void
  onBoldChange: () => void
  onItalicChange: () => void
  onAlignChange: (align: TextAlign) => void
  onDelete: () => void
}

const alignOptions = [
  { value: 'left', label: '왼쪽 정렬' },
  { value: 'center', label: '가운데 정렬' },
  { value: 'right', label: '오른쪽 정렬' },
] as const

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
  onDelete,
}: FloatingToolbarProps) {
  return (
    <ToolbarFrame
      name="텍스트"
      className="floating-toolbar"
      dragClassName="toolbar-drag-handle"
      resizeClassName="floating-toolbar-resize"
      initialX={window.innerWidth / 2 - 250}
      initialY={80}
    >
      <div className="toolbar-controls">
        {/* 텍스트 내용 */}
        <input
          className="text-input"
          type="text"
          value={text}
          title="텍스트 내용 수정"
          aria-label="텍스트 내용"
          onChange={(e) => onTextChange(e.target.value)}
        />

        {/* 글꼴 */}
        <select
          value={fontFamily}
          title="글꼴 선택"
          aria-label="글꼴 선택"
          onChange={(e) => onFontFamilyChange(e.target.value)}
        >
          <option value="Arial">Arial</option>
          <option value="Georgia">Georgia</option>
          <option value="Verdana">Verdana</option>
          <option value="Times New Roman">Times New Roman</option>
        </select>

        {/* 글자 크기 */}
        <button
          type="button"
          title="글자 크기 줄이기"
          aria-label="글자 크기 줄이기"
          onClick={() => onFontSizeChange(Math.max(8, fontSize - 2))}
        >
          −
        </button>

        <span className="font-size-number" title="현재 글자 크기">
          {fontSize}
        </span>

        <button
          type="button"
          title="글자 크기 늘리기"
          aria-label="글자 크기 늘리기"
          onClick={() => onFontSizeChange(Math.min(100, fontSize + 2))}
        >
          +
        </button>

        {/* 굵게 */}
        <button
          type="button"
          className={bold ? 'active-tool' : ''}
          title="굵게"
          aria-label="굵게"
          aria-pressed={bold}
          onClick={onBoldChange}
        >
          <b>B</b>
        </button>

        {/* 기울임꼴 */}
        <button
          type="button"
          className={italic ? 'active-tool' : ''}
          title="기울임꼴"
          aria-label="기울임꼴"
          aria-pressed={italic}
          onClick={onItalicChange}
        >
          <i>I</i>
        </button>

        {/* 텍스트 정렬 */}
        {alignOptions.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            className={align === value ? 'active-tool' : ''}
            title={label}
            aria-label={label}
            aria-pressed={align === value}
            onClick={() => onAlignChange(value)}
          >
            <span className={`align-icon align-${value}`} aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
          </button>
        ))}

        {/* 글자 색상 */}
        <label className="color-button" title="글자 색상 변경">
          🎨
          <input
            type="color"
            value={textColor}
            title="글자 색상 변경"
            aria-label="글자 색상 변경"
            onChange={(e) => onColorChange(e.target.value)}
          />
        </label>

        {/* 텍스트 삭제 */}
        <button
          type="button"
          className="delete-tool"
          title="선택한 텍스트 삭제"
          onClick={onDelete}
        >
          🗑️ 삭제
        </button>
      </div>
    </ToolbarFrame>
  )
}

export default FloatingToolbar