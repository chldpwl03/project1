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
  type: 'shape'
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

export type EditorObject =
  | TextObject
  | ImageObject
  | ShapeObject