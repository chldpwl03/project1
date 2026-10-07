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

  updateObjects([...objects, newImage])
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

// 정렬 상태 분석
const getAlignmentFeedback = () => {
  // 비교할 객체가 2개 미만이면 정렬 분석 불가
  if (objects.length < 2) {
    return {
      status: 'info',
      message: '정렬을 분석하려면 객체가 2개 이상 필요합니다.',
    }
  }

  //const ALIGN_THRESHOLD = 10

  for (let i = 0; i < objects.length; i++) {
    for (let j = i + 1; j < objects.length; j++) {
      const first = objects[i]
      const second = objects[j]

      const leftDifference = Math.abs(first.x - second.x)

      if (leftDifference > 0) {
        return {
          status: 'warning',
          message:
            `정렬 개선 필요: 두 객체의 왼쪽 기준선이 ` +
            `${Math.round(leftDifference)}px 차이납니다. ` +
            `같은 기준선으로 정렬해보세요.`,
        }
      }
    }
  }

  return {
    status: 'good',
    message: '현재 감지된 정렬 개선 요소가 없습니다.',
  }
}

 // 객체 간 간격 분석
  const getSpacingFeedback = () => {
    if (objects.length < 2) {
      return {
        status: 'info',
        message: '간격을 분석하려면 객체가 2개 이상 필요합니다.',
      }
    }

    const MIN_SPACING = 20

    for (let i = 0; i < objects.length; i++) {
      for (let j = i + 1; j < objects.length; j++) {
        const first = objects[i]
        const second = objects[j]

        const firstCenterX = first.x + first.width / 2
        const firstCenterY =
          first.y + ('height' in first ? first.height / 2 : 0)

        const secondCenterX = second.x + second.width / 2
        const secondCenterY =
          second.y + ('height' in second ? second.height / 2 : 0)

        const distance = Math.sqrt(
          Math.pow(firstCenterX - secondCenterX, 2) +
          Math.pow(firstCenterY - secondCenterY, 2)
        )

        if (distance < MIN_SPACING) {
          return {
            status: 'warning',
            message:
              '간격 개선 필요: 객체 사이의 간격이 너무 가깝습니다.',
          }
        }
      }
    }

    return {
      status: 'good',
      message: '현재 감지된 간격 개선 요소가 없습니다.',
    }
  }

  // HEX 색상을 RGB로 변환
  const hexToRgb = (hex: string) => {
    const value = hex.replace('#', '')

    if (value.length !== 6) return null

    return {
      r: parseInt(value.substring(0, 2), 16),
      g: parseInt(value.substring(2, 4), 16),
      b: parseInt(value.substring(4, 6), 16),
    }
  }

  // 상대 명도 계산
  const getLuminance = (hex: string) => {
    const rgb = hexToRgb(hex)

    if (!rgb) return 0

    const values = [rgb.r, rgb.g, rgb.b].map((value) => {
      const channel = value / 255

      return channel <= 0.04045
        ? channel / 12.92
        : Math.pow((channel + 0.055) / 1.055, 2.4)
    })

    return (
      0.2126 * values[0] +
      0.7152 * values[1] +
      0.0722 * values[2]
    )
  }

  // 두 색상의 대비율 계산
  const getContrastRatio = (
    firstColor: string,
    secondColor: string
  ) => {
    const firstLuminance = getLuminance(firstColor)
    const secondLuminance = getLuminance(secondColor)

    const lighter = Math.max(firstLuminance, secondLuminance)
    const darker = Math.min(firstLuminance, secondLuminance)

    return (lighter + 0.05) / (darker + 0.05)
  }

  // 텍스트와 배경의 색상 대비 분석
  const getContrastFeedback = () => {
    const textObjects = objects.filter(
      (obj) => obj.type === 'text'
    )

    if (textObjects.length === 0) {
      return {
        status: 'info',
        message: '색상 대비를 분석할 텍스트가 없습니다.',
      }
    }

    // 현재 캔버스 배경은 흰색
    const backgroundColor = '#ffffff'

    for (const text of textObjects) {
      if (text.type !== 'text') continue

      const ratio = getContrastRatio(
        text.fill,
        backgroundColor
      )

      if (ratio < 4.5) {
        return {
          status: 'warning',
          message:
            `색상 대비 개선 필요: 현재 대비율은 ` +
            `${ratio.toFixed(2)}:1입니다. ` +
            `글자와 배경의 대비를 높여보세요.`,
        }
      }
    }

    return {
      status: 'good',
      message: '현재 텍스트의 색상 대비가 충분합니다.',
    }
  }

  // 타이포그래피 분석
  const getTypographyFeedback = () => {
    const textObjects = objects.filter(
      (obj): obj is Extract<EditorObject, { type: 'text' }> =>
        obj.type === 'text'
    )

    if (textObjects.length < 2) {
      return {
        status: 'info',
        message: '타이포그래피를 분석하려면 텍스트가 2개 이상 필요합니다.',
      }
    }

    // 현재 사용 중인 글꼴 종류
    const fonts = new Set(
      textObjects.map((text) => text.fontFamily)
    )

    if (fonts.size >= 3) {
      return {
        status: 'warning',
        message:
          `타이포그래피 개선 필요: 현재 ${fonts.size}개의 글꼴이 사용되고 있습니다. ` +
          `글꼴 종류를 줄여 디자인의 일관성을 높여보세요.`,
      }
    }

    return {
      status: 'good',
      message: `현재 ${fonts.size}개의 글꼴을 사용하고 있습니다. 글꼴 구성이 일관적입니다.`,
    }
  }

// 선택한 객체와 가장 가까운 객체만 자동 정렬
const handleAutoAlign = () => {
  if (!selectedId || objects.length < 2) return

  const selectedObject = objects.find(
    (obj) => obj.id === selectedId
  )

  if (!selectedObject) return

  // 선택 객체를 제외한 나머지 객체
  const otherObjects = objects.filter(
    (obj) => obj.id !== selectedId
  )

  // x 좌표 기준으로 가장 가까운 객체 찾기
  const closestObject = otherObjects.reduce((closest, current) => {
    const closestDifference = Math.abs(
      closest.x - selectedObject.x
    )

    const currentDifference = Math.abs(
      current.x - selectedObject.x
    )

    return currentDifference < closestDifference
      ? current
      : closest
  })

  // 가장 가까운 객체만 선택 객체의 x 위치로 이동
  const updatedObjects = objects.map((obj) => {
    if (obj.id === closestObject.id) {
      return {
        ...obj,
        x: selectedObject.x,
      }
    }

    return obj
  })

  updateObjects(updatedObjects)
}

const alignmentFeedback = getAlignmentFeedback()
const spacingFeedback = getSpacingFeedback()
const contrastFeedback = getContrastFeedback()
const typographyFeedback = getTypographyFeedback()

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
            <h3>간격 분석</h3>
            <p>{spacingFeedback.message}</p>
          </div>

          <div className="coach-card">
            <h3>색상 대비</h3>
            <p>{contrastFeedback.message}</p>
          </div>

          <div className="coach-card">
            <h3>타이포그래피</h3>
            <p>{typographyFeedback.message}</p>
          </div>

          <div className="coach-card">
            <h3>현재 상태</h3>

            <p>{alignmentFeedback.message}</p>

            {alignmentFeedback.status === 'warning' && (
              <button onClick={handleAutoAlign}>
                자동 정렬
              </button>
            )}
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