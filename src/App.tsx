import { useRef, useState, type ChangeEvent } from 'react'
import './App.css'
import EditorCanvas from './components/EditorCanvas'
import type { EditorObject } from './types'
import Konva from 'konva'


const getTextVisualWidth = (
  obj: Extract<EditorObject, { type: 'text' }>
): number => {
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')

  if (!context) return obj.width

  const fontStyle = obj.italic ? 'italic ' : ''
  const fontWeight = obj.bold ? 'bold ' : ''

  context.font =
    `${fontStyle}${fontWeight}${obj.fontSize}px ${obj.fontFamily}`

  const lines = obj.text.split('\n')

  const measuredWidth = Math.max(
    0,
    ...lines.map((line) => context.measureText(line).width)
  )

  // 기존 텍스트 영역을 넘지 않도록 제한
  return Math.min(obj.width, measuredWidth)
}

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

  // 디자인 파일 불러오기용 input
  const loadInputRef = useRef<HTMLInputElement>(null)

  // 캔버스를 PNG 이미지로 출력
  
const handleExportPNG = () => {
  const stage = Konva.stages.find(
    (item) => item.container().id === 'mini-studio-stage'
  )

  if (!stage) {
    alert('캔버스를 찾을 수 없습니다.')
    return
  }

  // 출력할 때 편집용 선택 테두리 숨기기
  const transformers = stage.find('.editor-transformer')

  transformers.forEach((node) => node.hide())
  stage.batchDraw()

  try {
    const dataURL = stage.toDataURL({
      pixelRatio: 2,
      mimeType: 'image/png',
    })

    const link = document.createElement('a')
    link.href = dataURL
    link.download = 'mini-studio-design.png'
    link.click()
  } catch (error) {
    console.error('PNG 출력 오류:', error)
    alert('PNG 파일을 저장하지 못했습니다.')
  } finally {
    // 출력 후 선택 테두리 다시 표시
    transformers.forEach((node) => node.show())
    stage.batchDraw()
  }
}


  // 현재 디자인을 JSON 파일로 저장
  const handleSaveDesign = () => {
    const designData = {
      version: 1,
      objects,
    }

    const blob = new Blob(
      [JSON.stringify(designData, null, 2)],
      { type: 'application/json' }
    )

    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')

    link.href = url
    link.download = 'mini-studio-design.json'
    link.click()

    URL.revokeObjectURL(url)
  }

  // 저장한 JSON 파일 불러오기
  const handleLoadDesign = async (
    e: ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const content = await file.text()
      const data: unknown = JSON.parse(content)

      if (
        typeof data !== 'object' ||
        data === null ||
        !('objects' in data) ||
        !Array.isArray(data.objects)
      ) {
        throw new Error('올바른 디자인 파일이 아닙니다.')
      }

      const loadedObjects = data.objects as EditorObject[]

      // 객체 기본 구조 확인
      const isValid = loadedObjects.every(
        (obj) =>
          obj !== null &&
          typeof obj === 'object' &&
          typeof obj.id === 'string' &&
          ['text', 'image', 'shape'].includes(obj.type) &&
          typeof obj.x === 'number' &&
          Number.isFinite(obj.x) &&
          typeof obj.y === 'number' &&
          Number.isFinite(obj.y) &&
          typeof obj.width === 'number' &&
          Number.isFinite(obj.width)
      )

      if (!isValid) {
        throw new Error('디자인 객체 데이터가 올바르지 않습니다.')
      }

      updateObjects(loadedObjects)
      setSelectedId(null)

      alert('디자인을 불러왔습니다.')
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : '파일을 불러오지 못했습니다.'
      )
    } finally {
      e.target.value = ''
    }
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


  // 이미지 파일을 Data URL로 변환
  const fileToDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()

      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result)
        } else {
          reject(new Error('이미지를 읽지 못했습니다.'))
        }
      }

      reader.onerror = () => {
        reject(new Error('이미지 파일을 읽는 중 오류가 발생했습니다.'))
      }

      reader.readAsDataURL(file)
    })
  }

  // 이미지 업로드
  const handleImageUpload = async (
    e: ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0]
    if (!file) return

    // 같은 파일을 다시 선택할 수 있도록 초기화
    e.target.value = ''

    if (!file.type.startsWith('image/')) {
      alert('이미지 파일을 선택해 주세요.')
      return
    }

    try {
      const url = await fileToDataUrl(file)

      const newImage: EditorObject = {
        id: `image-${crypto.randomUUID()}`,
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
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : '이미지를 불러오지 못했습니다.'
      )
    }
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



const getRenderedBounds = (obj: EditorObject) => {
  const stage = Konva.stages.find(
    (item) => item.container().id === 'mini-studio-stage'
  )

  const node = stage?.findOne(`#${obj.id}`)

  // 회전된 객체는 실제 렌더링 경계 사용
  if (node && obj.rotation % 360 !== 0) {
    const rect = node.getClientRect({
      skipStroke: true,
      skipShadow: true,
    })

    return {
      left: rect.x,
      width: rect.width,
    }
  }

  // 회전하지 않은 텍스트는 글자 너비 기준
  if (obj.type === 'text') {
    const visualWidth = getTextVisualWidth(obj)

    let offset = 0

    if (obj.align === 'center') {
      offset = (obj.width - visualWidth) / 2
    } else if (obj.align === 'right') {
      offset = obj.width - visualWidth
    }

    return {
      left: obj.x + offset,
      width: visualWidth,
    }
  }

  // 일반 이미지와 도형
  if (node) {
    const rect = node.getClientRect({
      skipStroke: true,
      skipShadow: true,
    })

    return {
      left: rect.x,
      width: rect.width,
    }
  }

  return {
    left: obj.x,
    width: obj.width,
  }
}


// 정렬 상태 분석
const getAlignmentFeedback = () => {
  if (objects.length < 2) {
    return {
      status: 'good',
      message: '정렬을 분석하려면 객체가 2개 이상 필요합니다.',
    }
  }

  const THRESHOLD = 5

  // 자동 정렬과 동일한 시각적 경계 계산

  const bounds = objects.map(getRenderedBounds)
  // 두 객체가 공유하는 정렬 기준이 있는지 확인
  const isAligned = (
    a: (typeof bounds)[number],
    b: (typeof bounds)[number]
  ) => {
    const aAnchors = [
      a.left,
      a.left + a.width / 2,
      a.left + a.width,
    ]

    const bAnchors = [
      b.left,
      b.left + b.width / 2,
      b.left + b.width,
    ]

    return aAnchors.some(
      (anchor, index) =>
        Math.abs(anchor - bAnchors[index]) <= THRESHOLD
    )
  }

  // 각 객체가 적어도 하나의 다른 객체와 정렬되는지 검사
  const allAligned = bounds.every((current, index) =>
    bounds.some(
      (other, otherIndex) =>
        index !== otherIndex && isAligned(current, other)
    )
  )

  if (allAligned) {
    return {
      status: 'good',
      message: '객체들이 왼쪽, 가운데 또는 오른쪽 기준으로 정렬되어 있습니다.',
    }
  }

  return {
    status: 'warning',
    message:
      '일부 객체의 정렬 기준이 일치하지 않습니다. 자동 정렬 기능을 사용해 보세요.',
  }
}



  const MIN_SPACING = 20

  const getSpacingBounds = (obj: EditorObject) => {
    const height =
      obj.type === 'text'
        ? obj.fontSize * 1.2
        : obj.height

    return {
      left: obj.x,
      right: obj.x + obj.width,
      top: obj.y,
      bottom: obj.y + height,
    }
  }

  // 배경 도형 안에 텍스트가 포함된 경우 제외
  const isBackgroundTextPair = (
    first: EditorObject,
    second: EditorObject
  ) => {
    const check = (shape: EditorObject, text: EditorObject) => {
      if (shape.type !== 'shape' || text.type !== 'text') {
        return false
      }

      const s = getSpacingBounds(shape)
      const t = getSpacingBounds(text)

      return (
        t.left >= s.left &&
        t.right <= s.right &&
        t.top >= s.top &&
        t.bottom <= s.bottom
      )
    }

    return check(first, second) || check(second, first)
  }

  const getObjectDistance = (
    first: EditorObject,
    second: EditorObject
  ) => {
    const a = getSpacingBounds(first)
    const b = getSpacingBounds(second)

    const gapX = Math.max(
      0,
      a.left - b.right,
      b.left - a.right
    )

    const gapY = Math.max(
      0,
      a.top - b.bottom,
      b.top - a.bottom
    )

    return Math.hypot(gapX, gapY)
  }


  // 객체 간 간격 분석 (경계 기준)
  const getSpacingFeedback = () => {
    if (objects.length < 2) {
      return {
        status: 'info',
        message: '간격을 분석하려면 객체가 2개 이상 필요합니다.',
      }
    }

    for (let i = 0; i < objects.length; i++) {
      for (let j = i + 1; j < objects.length; j++) {
        const first = objects[i]
        const second = objects[j]

        if (isBackgroundTextPair(first, second)) continue

        const distance = getObjectDistance(first, second)

        if (distance < MIN_SPACING) {
          return {
            status: 'warning',
            message:
              `간격 개선 제안: 객체 간 거리가 ` +
              `${Math.round(distance)}px입니다. ` +
              `최소 ${MIN_SPACING}px 간격을 권장합니다.`,
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

 
  // 텍스트와 실제 배경의 색상 대비 분석
  const getContrastFeedback = () => {
    const textObjects = objects.filter(
      (obj): obj is Extract<EditorObject, { type: 'text' }> =>
        obj.type === 'text'
    )

    if (textObjects.length === 0) {
      return {
        status: 'info',
        message: '색상 대비를 분석할 텍스트가 없습니다.',
      }
    }

    const DEFAULT_BACKGROUND = '#ffffff'
    const MIN_CONTRAST = 4.5

    for (const text of textObjects) {
      let backgroundColor = DEFAULT_BACKGROUND

      // 텍스트보다 아래 레이어에 있는 도형 검색
      const textIndex = objects.findIndex(
        (obj) => obj.id === text.id
      )

      for (let i = textIndex - 1; i >= 0; i--) {
        const obj = objects[i]

        if (obj.type !== 'shape') continue

        // 텍스트 중심점 계산
        const centerX = text.x + text.width / 2
        const centerY = text.y + text.fontSize * 0.6

        // 텍스트 중심점이 도형 내부에 있는지 확인
        const isInside =
          centerX >= obj.x &&
          centerX <= obj.x + obj.width &&
          centerY >= obj.y &&
          centerY <= obj.y + obj.height

        if (isInside) {
          backgroundColor = obj.fill
          break
        }
      }

      const ratio = getContrastRatio(
        text.fill,
        backgroundColor
      )

      if (ratio < MIN_CONTRAST) {
        return {
          status: 'warning',
          message:
            `색상 대비 개선 제안: 텍스트와 배경의 대비율이 ` +
            `${ratio.toFixed(2)}:1입니다. ` +
            `최소 ${MIN_CONTRAST}:1 이상이 되도록 색상을 조정해보세요.`,
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


  // 선택한 객체를 기준으로 자동 정렬
const handleAutoAlign = (
  alignType: 'left' | 'center' | 'right'
) => {
  if (!selectedId || objects.length < 2) return

  const selectedObject = objects.find(
    (obj) => obj.id === selectedId
  )

  if (!selectedObject) return

  const getAnchor = (left: number, width: number) => {
    if (alignType === 'left') return left
    if (alignType === 'center') return left + width / 2
    return left + width
  }

  const selectedBounds = getRenderedBounds(selectedObject)

  const targetAnchor = getAnchor(
    selectedBounds.left,
    selectedBounds.width
  )

  const updatedObjects = objects.map((obj) => {
    if (obj.id === selectedId) return obj

    const bounds = getRenderedBounds(obj)

    const currentAnchor = getAnchor(
      bounds.left,
      bounds.width
    )

    const difference = targetAnchor - currentAnchor

    return {
      ...obj,
      x: obj.x + difference,
    }
  })

  const hasChanges = updatedObjects.some(
    (obj, index) => obj.x !== objects[index].x
  )

  if (hasChanges) {
    updateObjects(updatedObjects)
  }
}


  // Design Coach 개선 추천 생성
  const getDesignRecommendations = () => {
    const recommendations: string[] = []

    const alignment = getAlignmentFeedback()
    const spacing = getSpacingFeedback()
    const contrast = getContrastFeedback()
    const typography = getTypographyFeedback()

    if (alignment.status === 'warning') {
      recommendations.push(
        '정렬: 관련 객체들의 왼쪽, 가운데 또는 오른쪽 기준선을 맞춰보세요.'
      )
    }

    if (spacing.status === 'warning') {
      recommendations.push(
        '간격: 객체가 겹치거나 너무 가까운 경우 최소 20px 이상의 여백을 확보해보세요.'
      )
    }

    if (contrast.status === 'warning') {
      recommendations.push(
        '색상: 글자와 배경의 대비율을 4.5:1 이상으로 높여보세요.'
      )
    }

    if (typography.status === 'warning') {
      recommendations.push(
        '글꼴: 사용 중인 글꼴을 1~2종류로 통일해보세요.'
      )
    }

    if (objects.length === 0) {
      return ['객체를 추가하면 디자인 개선 추천이 표시됩니다.']
    }

    if (recommendations.length === 0) {
      return ['현재 분석 규칙에서 발견된 개선 항목이 없습니다.']
    }

    return recommendations
  }

  
  // 색상 대비 자동 개선
  const handleAutoContrast = () => {
    const DEFAULT_BACKGROUND = '#ffffff'

    const updatedObjects = objects.map((obj, index) => {
      if (obj.type !== 'text') return obj

      let backgroundColor = DEFAULT_BACKGROUND

      // 텍스트보다 아래에 있는 도형의 배경색 확인
      for (let i = index - 1; i >= 0; i--) {
        const shape = objects[i]

        if (shape.type !== 'shape') continue

        const centerX = obj.x + obj.width / 2
        const centerY = obj.y + obj.fontSize * 0.6

        const isInside =
          centerX >= shape.x &&
          centerX <= shape.x + shape.width &&
          centerY >= shape.y &&
          centerY <= shape.y + shape.height

        if (isInside) {
          backgroundColor = shape.fill
          break
        }
      }

      // 현재 대비가 충분하면 기존 색상 유지
      if (getContrastRatio(obj.fill, backgroundColor) >= 4.5) {
        return obj
      }

      // 검정과 흰색 중 대비율이 높은 색상 선택
      const blackContrast = getContrastRatio(
        '#000000',
        backgroundColor
      )
      const whiteContrast = getContrastRatio(
        '#ffffff',
        backgroundColor
      )

      return {
        ...obj,
        fill:
          blackContrast >= whiteContrast
            ? '#000000'
            : '#ffffff',
      }
    })

    // 실제 색상이 바뀐 경우에만 Undo 기록
    const hasChanges = updatedObjects.some(
      (obj, index) =>
        obj.type === 'text' &&
        objects[index].type === 'text' &&
        obj.fill !== objects[index].fill
    )

    if (hasChanges) {
      updateObjects(updatedObjects)
    }
  }

  // 객체 간 간격 자동 개선
 
  const handleAutoSpacing = () => {
    if (objects.length < 2) return

    const updatedObjects = objects.map((obj) => ({ ...obj }))

    const sortedIndices = updatedObjects
      .map((_, index) => index)
      .sort((a, b) => updatedObjects[a].y - updatedObjects[b].y)

    let changed = false

    for (let i = 1; i < sortedIndices.length; i++) {
      const current = updatedObjects[sortedIndices[i]]

      for (let j = 0; j < i; j++) {
        const previous = updatedObjects[sortedIndices[j]]

        if (isBackgroundTextPair(previous, current)) continue

        const distance = getObjectDistance(previous, current)

        if (distance >= MIN_SPACING) continue

        const a = getSpacingBounds(previous)
        const b = getSpacingBounds(current)

        // 오른쪽으로 이동할 때 필요한 거리
        const moveRight = a.right + MIN_SPACING - b.left

        // 아래로 이동할 때 필요한 거리
        const moveDown = a.bottom + MIN_SPACING - b.top

        // 객체를 되도록 적게 이동시키는 방향 선택
        if (moveRight > 0 && moveRight < moveDown) {
          current.x += moveRight
        } else if (moveDown > 0) {
          current.y += moveDown
        } else if (moveRight > 0) {
          current.x += moveRight
        }

        changed = true
      }
    }

    if (changed) {
      updateObjects(updatedObjects)
    }
  }



const alignmentFeedback = getAlignmentFeedback()
const spacingFeedback = getSpacingFeedback()
const contrastFeedback = getContrastFeedback()
const typographyFeedback = getTypographyFeedback()
const designRecommendations = getDesignRecommendations()

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

          
      <button onClick={handleSaveDesign}>
        💾 저장하기
      </button>

      <button onClick={() => loadInputRef.current?.click()}>
        📂 불러오기
      </button>

      <input
        ref={loadInputRef}
        type="file"
        accept=".json,application/json"
        onChange={handleLoadDesign}
        style={{ display: 'none' }}
      />


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
            <h3>💡 디자인 개선 추천</h3>

            {designRecommendations.map((recommendation, index) => (
              <p key={index}>
                {recommendation}
              </p>
            ))}
          </div>

          
          <div className="coach-card">
            <h3>디자인 분석</h3>

            {objects.length === 0 ? (
              <p>객체를 추가하면 디자인을 분석합니다.</p>
            ) : (
              <>
                <p>전체 객체: {objects.length}개</p>
                <p>
                  텍스트: {objects.filter((obj) => obj.type === 'text').length}개
                </p>
                <p>
                  이미지: {objects.filter((obj) => obj.type === 'image').length}개
                </p>
                <p>
                  도형: {objects.filter((obj) => obj.type === 'shape').length}개
                </p>
              </>
            )}
          </div>


          
          <div className="coach-card">
            <h3>간격 분석</h3>
            <p>{spacingFeedback.message}</p>

            {spacingFeedback.status === 'warning' && (
              <button onClick={handleAutoSpacing}>
                간격 자동 개선
              </button>
            )}
          </div>


          <div className="coach-card">
            <h3>색상 대비</h3>
            <p>{contrastFeedback.message}</p>

            {contrastFeedback.status === 'warning' && (
              <button onClick={handleAutoContrast}>
                색상 자동 개선
              </button>
            )}
          </div>

          <div className="coach-card">
            <h3>타이포그래피</h3>
            <p>{typographyFeedback.message}</p>
          </div>

          <div className="coach-card">
            <h3>현재 상태</h3>

            <p>{alignmentFeedback.message}</p>

            
            {objects.length >= 2 && selectedId && (
              <div className="auto-align-buttons">
                <button onClick={() => handleAutoAlign('left')}>
                  왼쪽 정렬
                </button>

                <button onClick={() => handleAutoAlign('center')}>
                  가운데 정렬
                </button>

                <button onClick={() => handleAutoAlign('right')}>
                  오른쪽 정렬
                </button>
              </div>
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

        <button
          className="export-btn"
          onClick={handleExportPNG}
        >
          📤 출력
        </button>
        
      </footer>
    </div>
  )
}

export default App