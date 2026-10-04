import { useState, type ChangeEvent } from 'react'
import './App.css'
import EditorCanvas from './components/EditorCanvas'

function App() {
  // 텍스트가 캔버스에 표시되는지 관리
  const [showText, setShowText] = useState(false)

  // 업로드한 이미지 주소 관리
  const [imageUrl, setImageUrl] = useState<string | null>(null)

  const [showShape, setShowShape] = useState(false)

const handleImageUpload = (
  e: ChangeEvent<HTMLInputElement>
) => {
  const file = e.target.files?.[0]

  if (!file) return

  const url = URL.createObjectURL(file)
  setImageUrl(url)
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

          <button onClick={() => setShowText(true)}>
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
          <button onClick={() => setShowShape(true)}>
            ⬜ 도형
        </button>

          <div className="divider" />

          <button>📚 레이어</button>
        </aside>

        {/* 가운데 작업 영역 */}
        <main className="workspace">
          <div className="canvas">
            <EditorCanvas 
              showText={showText}
              imageUrl={imageUrl}
              showShape={showShape}
               />
          </div>
        </main>

        {/* 오른쪽 Design Coach */}
        <aside className="design-coach">
          <h2>✨ Design Coach</h2>

          <div className="coach-card">
            <h3>디자인 분석</h3>
            <p>
              {showText
                ? '텍스트 객체가 추가되었습니다.'
                : '객체를 추가하면 디자인을 분석합니다.'}
            </p>
          </div>

          <div className="coach-card">
            <h3>현재 상태</h3>
            <p>
              {showText
                ? '텍스트 객체 1개'
                : '분석할 객체가 없습니다.'}
            </p>
          </div>
        </aside>
      </div>

      {/* 하단 */}
      <footer className="bottom-bar">
        <div className="history-buttons">
          <button>↶ Undo</button>
          <button>↷ Redo</button>
        </div>

        <div className="zoom">100%</div>

        <button className="export-button">출력</button>
      </footer>
    </div>
  )
}

export default App