import { useState, type ChangeEvent } from 'react'
import './App.css'
import EditorCanvas from './components/EditorCanvas'
import type { EditorObject } from './types'

function App() {

  // 레이어 패널 열기/닫기
  const [showLayers, setShowLayers] = useState(false)

  // 새로운 다중 객체 구조
  // 모든 편집 객체 저장
  const [objects, setObjects] = useState<EditorObject[]>([])

  // Undo / Redo 기록
  const [past, setPast] = useState<EditorObject[][]>([])
  const [future, setFuture] = useState<EditorObject[][]>([])

  // 현재 선택한 객체의 고유 ID
  const [selectedId, setSelectedId] = useState<string | null>(null)

  // 객체가 변경될 때 이전 상태 저장
  const updateObjects = (newObjects: EditorObject[]) => {
    setPast((prev) => [...prev, objects])
    setObjects(newObjects)
    setFuture([])
  }

  // 실행 취소
  const handleUndo = () => {
    if (past.length === 0) return

    const previousObjects = past[past.length - 1]

    setFuture((prev) => [objects, ...prev])
    setObjects(previousObjects)
    setPast((prev) => prev.slice(0, -1))
    setSelectedId(null)
  }

  // 다시 실행
  const handleRedo = () => {
    if (future.length === 0) return

    const nextObjects = future[0]

    setPast((prev) => [...prev, objects])
    setObjects(nextObjects)
    setFuture((prev) => prev.slice(1))
    setSelectedId(null)
  }

  // 새 텍스트 객체 추가
  const handleAddText = () => {
  const newText: EditorObject = {
    id: `text-${Date.now()}`,
    type: 'text',
    text: '텍스트를 입력하세요',
    x: 230,
    y: 220,
    width: 250,
    fontSize: 24,
    fontFamily: 'Arial',
    fill: '#222222',
    bold: false,
    italic: false,
    align: 'left',
    rotation: 0,
  }

  updateObjects([...objects, newText])
  setSelectedId(newText.id)
}

const handleImageUpload = (
  e: ChangeEvent<HTMLInputElement>
) => {
  const file = e.target.files?.[0]

  if (!file) return

  const url = URL.createObjectURL(file)

  const newImage: EditorObject = {
    id: `image-${Date.now()}`,
    type: 'image',
    imageUrl: url,
    x: 200,
    y: 120,
    width: 300,
    height: 200,
    opacity: 1,
    flipped: false,
    rotation: 0,
  }

  setObjects((prev) => [...prev, newImage])
  setSelectedId(newImage.id)


  // 같은 파일을 다시 선택할 수 있도록 초기화
  e.target.value = ''
}

// 새 도형 객체 추가
const handleAddShape = () => {
  const newShape: EditorObject = {
    id: `shape-${Date.now()}`,
    type: 'shape',
    x: 250,
    y: 170,
    width: 200,
    height: 150,
    fill: '#d9d9d9',
    stroke: '#444444',
    strokeWidth: 2,
    opacity: 1,
    cornerRadius: 0,
    rotation: 0,
  }

  updateObjects([...objects, newShape])
  setSelectedId(newShape.id)
}

  return (
    <div className="app">
      {/* 상단 */}
      <header className="header">
        <h1>Mini Studio</h1>
        <span>나만의 디자인을 만들어보세요</span>
      </header>

      <div className="editor">
        {/* 왼쪽 메뉴 */}
        <aside className="sidebar">
          <h2>도구</h2>

          <button>💾 저장하기</button>
          <button>📂 불러오기</button>

          <div className="divider" />

          <p className="menu-title">객체 추가</p>

          <button onClick={handleAddText}>
            📝 텍스트
          </button>

          <label className="image-upload-button">
            🖼️ 이미지

            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
            />
        </label>

          <button onClick={handleAddShape}>
            ⬜ 도형
          </button>

          <div className="divider" />

          <button onClick={() => setShowLayers(!showLayers)}>
           📚 레이어
          </button>
          {showLayers && (
          <div className="layer-panel">
            <p className="layer-title">레이어 목록</p>

            {objects.map((obj, index) => (
              <div
                key={obj.id}
                className={`layer-item ${
                  selectedId === obj.id ? 'selected' : ''
                }`}
                onClick={() => setSelectedId(obj.id)}
              >
                {obj.type === 'text' && `📝 텍스트 ${index + 1}`}
                {obj.type === 'image' && `🖼️ 이미지 ${index + 1}`}
                {obj.type === 'shape' && `⬜ 도형 ${index + 1}`}
              </div>
            ))}

            {objects.length === 0 && (
              <p className="layer-empty">
                객체가 없습니다.
              </p>
            )}
          </div>
        )}
                </aside>

        {/* 가운데 작업 영역 */}
        <main className="workspace">
          <div className="canvas">
            <EditorCanvas
              objects={objects}
              selectedId={selectedId}
              onSelectObject={setSelectedId}
              onObjectsChange={updateObjects}            
              />
          </div>
        </main>

        {/* 오른쪽 Design Coach */}
        <aside className="design-coach">
          <h2>✨ Design Coach</h2>

          <div className="coach-card">
            <h3>디자인 분석</h3>
            <p>
              {objects.length > 0
                ? '텍스트 객체가 추가되었습니다.'
                : '객체를 추가하면 디자인을 분석합니다.'}
            </p>
          </div>

          <div className="coach-card">
            <h3>현재 상태</h3>
            <p>
              {objects.length > 0
                ? '텍스트 객체 1개'
                : '분석할 객체가 없습니다.'}
            </p>
          </div>
        </aside>
      </div>

      {/* 하단 */}
      <footer className="bottom-bar">
        <div className="history-buttons">
          <button
            onClick={handleUndo}
            disabled={past.length === 0}
          >
            ↶ Undo
          </button>

          <button
            onClick={handleRedo}
            disabled={future.length === 0}
          >
            ↷ Redo
          </button>
        </div>

        <div className="zoom">100%</div>

        <button className="export-button">출력</button>
      </footer>
    </div>
  )
}

export default App