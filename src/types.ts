export type ObjectType = 'text' | 'image' | 'shape'

export type TextObject = {
  id: string
  type: 'text'
  text: string
  x: number
  y: number
  width: number
  fontSize: number
  fontFamily: string
  fill: string
  bold: boolean
  italic: boolean
  align: 'left' | 'center' | 'right'
  rotation: number
}

export type ImageObject = {
  id: string
  type: 'image'
  imageUrl: string
  x: number
  y: number
  width: number
  height: number
  opacity: number
  flipped: boolean
  rotation: number
}

export type ShapeObject = {
  id: string
  layerName?: string
  type: 'shape'
  shapeType?: 'rectangle' | 'ellipse' | 'triangle'
  x: number
  y: number
  width: number
  height: number
  fill: string
  stroke: string
  strokeWidth: number
  opacity: number
  cornerRadius: number
  rotation: number
}

// 레이어 목록에 표시할 사용자 지정 이름
export type EditorObject = (TextObject | ImageObject | ShapeObject) & {
  layerName?: string
}