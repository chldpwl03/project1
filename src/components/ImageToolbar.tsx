import ToolbarFrame from './ToolbarFrame'

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
  const opacityPercent = `${Math.round(opacity * 100)}%`

  return (
    <ToolbarFrame
      name="이미지"
      className="image-toolbar"
      dragClassName="image-toolbar-drag"
      resizeClassName="image-toolbar-resize"
      initialX={300}
      initialY={100}
    >
      <div className="image-toolbar-controls">
        {/* 이미지 투명도 */}
        <label className="image-toolbar-field" title="이미지 투명도 조절">
          <span>투명도</span>
          <input
            type="range"
            min="0.1"
            max="1"
            step="0.1"
            value={opacity}
            title="이미지 투명도 조절"
            aria-valuetext={opacityPercent}
            onChange={(e) => onOpacityChange(Number(e.target.value))}
          />
          <span className="image-toolbar-value" aria-hidden="true">
            {opacityPercent}
          </span>
        </label>

        {/* 좌우 반전 */}
        <button type="button" title="이미지 좌우 반전" onClick={onFlip}>
          ↔ 반전
        </button>

        {/* 이미지 회전 */}
        <button
          type="button"
          title="이미지 90도 회전"
          aria-label="이미지 90도 회전"
          onClick={onRotate}
        >
          ↻ 90°
        </button>

        {/* 이미지 삭제 */}
        <button
          type="button"
          className="delete-image-button"
          title="선택한 이미지 삭제"
          onClick={onDelete}
        >
          삭제
        </button>
      </div>
    </ToolbarFrame>
  )
}

export default ImageToolbar