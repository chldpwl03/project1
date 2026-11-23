import ToolbarFrame from './ToolbarFrame'

type ShapeToolbarProps = {
  // 선택한 도형에서 모서리 둥글기를 조절할 수 있는지 표시
  showCornerRadius: boolean
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
  showCornerRadius,
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
  const opacityPercent = `${Math.round(opacity * 100)}%`

  return (
    <ToolbarFrame
      name="도형"
      className="shape-toolbar"
      dragClassName="shape-toolbar-drag"
      resizeClassName="shape-toolbar-resize"
      initialX={300}
      initialY={100}
    >
      <div className={`shape-toolbar-controls${showCornerRadius ? ' has-radius' : ''}`}>
        {/* 도형 채우기 색상 */}
        <label className="shape-toolbar-field" title="도형 채우기 색상 변경">
          <span>채우기</span>
          <input
            type="color"
            value={fillColor}
            title="도형 채우기 색상 변경"
            onChange={(e) => onFillColorChange(e.target.value)}
          />
        </label>

        {/* 도형 테두리 색상 */}
        <label className="shape-toolbar-field" title="도형 테두리 색상 변경">
          <span>테두리</span>
          <input
            type="color"
            value={strokeColor}
            title="도형 테두리 색상 변경"
            onChange={(e) => onStrokeColorChange(e.target.value)}
          />
        </label>

        {/* 도형 투명도 */}
        <label className="shape-toolbar-field" title="도형 투명도 조절">
          <span>투명도</span>
          <input
            type="range"
            min="0.1"
            max="1"
            step="0.1"
            value={opacity}
            title="도형 투명도 조절"
            aria-valuetext={opacityPercent}
            onChange={(e) => onOpacityChange(Number(e.target.value))}
          />
          <span className="shape-toolbar-value" aria-hidden="true">
            {opacityPercent}
          </span>
        </label>

        {/* 사각형 모서리 둥글기 */}
        {showCornerRadius && (
          <label className="shape-toolbar-field" title="사각형 모서리 둥글기 조절">
            <span>둥글기</span>
            <input
              type="range"
              min="0"
              max="50"
              step="5"
              value={cornerRadius}
              title="사각형 모서리 둥글기 조절"
              onChange={(e) => onCornerRadiusChange(Number(e.target.value))}
            />
          </label>
        )}

        {/* 도형 삭제 */}
        <button
          type="button"
          className="delete-shape-button"
          title="선택한 도형 삭제"
          onClick={onDelete}
        >
          삭제
        </button>
      </div>
    </ToolbarFrame>
  )
}

export default ShapeToolbar