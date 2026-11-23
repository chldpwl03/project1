import { useState, type FormEvent } from 'react'

type LayerItemProps = {
  name: string
  selected: boolean
  onSelect: () => void
  onRename: (name: string) => void
}

function LayerItem({ name, selected, onSelect, onRename }: LayerItemProps) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')

  // 레이어 이름 편집 시작
  const handleEdit = () => {
    onSelect()
    setDraft(name)
    setEditing(true)
  }

  // 레이어 이름 저장
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const newName = draft.trim()
    if (!newName) return

    if (newName !== name) onRename(newName)
    setEditing(false)
  }

  return (
    <div className={`layer-card${selected ? ' is-selected' : ''}`}>
      {editing ? (
        <form className="layer-edit-form" onSubmit={handleSubmit}>
          <input
            className="layer-edit-input"
            type="text"
            value={draft}
            aria-label="레이어 이름"
            autoFocus
            onFocus={(e) => e.currentTarget.select()}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              // 한글 조합 중 Enter 저장 방지
              if (e.nativeEvent.isComposing) {
                if (e.key === 'Enter') e.preventDefault()
                return
              }

              if (e.key === 'Escape') {
                e.preventDefault()
                setEditing(false)
              }
            }}
          />

          <div className="layer-card-actions">
            <button
              type="submit"
              className="layer-icon-button"
              title="이름 저장"
              aria-label="레이어 이름 저장"
              disabled={!draft.trim()}
            >
              ✓
            </button>

            <button
              type="button"
              className="layer-icon-button"
              title="수정 취소"
              aria-label="레이어 이름 수정 취소"
              onClick={() => setEditing(false)}
            >
              ×
            </button>
          </div>
        </form>
      ) : (
        <>
          {/* 레이어 선택 */}
          <button
            type="button"
            className="layer-card-name"
            title={name}
            aria-pressed={selected}
            onClick={onSelect}
          >
            {name}
          </button>

          {/* 레이어 이름 수정 */}
          <div className="layer-card-actions">
            <button
              type="button"
              className="layer-icon-button"
              title="레이어 이름 수정"
              aria-label={`${name} 이름 수정`}
              onClick={handleEdit}
            >
              ✎
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export default LayerItem