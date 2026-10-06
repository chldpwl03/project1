import { useEffect, useRef, useState } from 'react'
import { Layer, Rect, Stage, Text, Transformer } from 'react-konva'
import Konva from 'konva'
import FloatingToolbar from './FloatingToolbar'
import ImageToolbar from './ImageToolbar'
import ShapeToolbar from './ShapeToolbar'
import CanvasImage from './CanvasImage'
import type { EditorObject } from '../types'

type EditorCanvasProps = {

  objects: EditorObject[]
  selectedId: string | null
  onSelectObject: (id: string | null) => void
  onObjectsChange: (objects: EditorObject[]) => void
}

function EditorCanvas({ 
  objects,
  selectedId, 
  onSelectObject,
  onObjectsChange,
}: EditorCanvasProps) {
    

  // 이미지 설정
  const transformerRef = useRef<Konva.Transformer>(null)

  // 고유 ID로 선택한 객체에 Transformer 연결
  useEffect(() => {
    if (!transformerRef.current) return

    const stage = transformerRef.current.getStage()

    if (!stage || !selectedId) {
      transformerRef.current.nodes([])
      transformerRef.current.getLayer()?.batchDraw()
      return
    }

    const selectedNode = stage.findOne(`#${selectedId}`)

    if (selectedNode) {
      transformerRef.current.nodes([selectedNode])
    } else {
      transformerRef.current.nodes([])
    }

    transformerRef.current.getLayer()?.batchDraw()
  }, [selectedId, objects])

  // 현재 선택된 다중 텍스트 객체 찾기
const selectedTextObject = objects.find(
  (
    obj
  ): obj is Extract<EditorObject, { type: 'text' }> =>
    obj.id === selectedId && obj.type === 'text'
)

// 선택된 텍스트 객체 수정
const updateSelectedText = (
    changes: Partial<Extract<EditorObject, { type: 'text' }>>
  ) => {
    if (!selectedId) return

    const updatedObjects = objects.map((obj) => {
      if (obj.id === selectedId && obj.type === 'text') {
        return {
          ...obj,
          ...changes,
        }
      }

      return obj
    })

    onObjectsChange(updatedObjects)
  }

  // 현재 선택된 다중 이미지 객체 찾기
const selectedImageObject = objects.find(
  (
    obj
  ): obj is Extract<EditorObject, { type: 'image' }> =>
    obj.id === selectedId && obj.type === 'image'
)

// 선택된 이미지 객체 수정
const updateSelectedImage = (
  changes: Partial<Extract<EditorObject, { type: 'image' }>>
) => {
  if (!selectedId) return

  const updatedObjects = objects.map((obj) => {
    if (obj.id === selectedId && obj.type === 'image') {
      return {
        ...obj,
        ...changes,
      }
    }

    return obj
  })

  onObjectsChange(updatedObjects)
}

// 현재 선택된 다중 도형 객체 찾기
const selectedShapeObject = objects.find(
  (
    obj
  ): obj is Extract<EditorObject, { type: 'shape' }> =>
    obj.id === selectedId && obj.type === 'shape'
)

// 선택된 도형 객체 수정
const updateSelectedShape = (
  changes: Partial<Extract<EditorObject, { type: 'shape' }>>
) => {
  if (!selectedId) return

  const updatedObjects = objects.map((obj) => {
    if (obj.id === selectedId && obj.type === 'shape') {
      return {
        ...obj,
        ...changes,
      }
    }

    return obj
  })

  onObjectsChange(updatedObjects)
}

  return (
    <>
      <Stage
        width={700}
        height={500}
        onMouseDown={(e) => {
          if (e.target === e.target.getStage()) {
            onSelectObject(null)
          }
        }}
      >
        <Layer>

          {/* 새로운 다중 텍스트 객체 */}
          {objects
            .filter((obj) => obj.type === 'text')
            .map((obj) => {
              if (obj.type !== 'text') return null

              let objectFontStyle = 'normal'

              if (obj.bold && obj.italic) {
                objectFontStyle = 'bold italic'
              } else if (obj.bold) {
                objectFontStyle = 'bold'
              } else if (obj.italic) {
                objectFontStyle = 'italic'
              }

              return (
                <Text
                  key={obj.id}
                  id={obj.id}
                  text={obj.text}
                  x={obj.x}
                  y={obj.y}
                  width={obj.width}
                  fontSize={obj.fontSize}
                  fontFamily={obj.fontFamily}
                  fontStyle={objectFontStyle}
                  fill={obj.fill}
                  align={obj.align}
                  rotation={obj.rotation}
                  draggable

                  onDragEnd={(e) => {
                    const updatedObjects = objects.map((item) => {
                      if (item.id === obj.id && item.type === 'text') {
                        return {
                          ...item,
                          x: e.target.x(),
                          y: e.target.y(),
                        }
                      }

                      return item
                    })

                    onObjectsChange(updatedObjects)
                  }}

                  onTransformEnd={(e) => {
                    const node = e.target as Konva.Text

                    const scaleX = node.scaleX()
                    const scaleY = node.scaleY()

                    const updatedObjects = objects.map((item) => {
                      if (item.id === obj.id && item.type === 'text') {
                        return {
                          ...item,
                          x: node.x(),
                          y: node.y(),
                          width: Math.max(50, node.width() * scaleX),
                          fontSize: Math.max(8, node.fontSize() * scaleY),
                          rotation: node.rotation(),
                        }
                      }

                      return item
                    })

                    // Transformer의 확대/축소값 초기화
                    node.scaleX(1)
                    node.scaleY(1)

                    onObjectsChange(updatedObjects)
                  }}

                  onClick={() => onSelectObject(obj.id)}
                  onTap={() => onSelectObject(obj.id)}
                />
              )
            })}

            {/* 새로운 다중 이미지 객체 */}
          {objects
            .filter((obj) => obj.type === 'image')
            .map((obj) => {
              if (obj.type !== 'image') return null

              return (
                <CanvasImage
                  key={obj.id}
                  object={obj}
                  onSelect={() => {
                    onSelectObject(obj.id)
                  }}
                  onChange={(changes) => {
                    const updatedObjects = objects.map((item) => {
                      if (item.id === obj.id && item.type === 'image') {
                        return {
                          ...item,
                          ...changes,
                        }
                      }

                      return item
                    })

                    onObjectsChange(updatedObjects)
                  }}
                />
              )
            })}

            {/* 새로운 다중 도형 객체 */}
            {objects
              .filter((obj) => obj.type === 'shape')
              .map((obj) => {
                if (obj.type !== 'shape') return null

                return (
                  <Rect
                    key={obj.id}
                    id={obj.id}
                    x={obj.x}
                    y={obj.y}
                    width={obj.width}
                    height={obj.height}
                    fill={obj.fill}
                    stroke={obj.stroke}
                    strokeWidth={obj.strokeWidth}
                    opacity={obj.opacity}
                    cornerRadius={obj.cornerRadius}
                    rotation={obj.rotation}
                    draggable

                    onClick={() => {
                      onSelectObject(obj.id)
                    }}

                    onTap={() => {
                      onSelectObject(obj.id)
                    }}

                    onDragEnd={(e) => {
                      const updatedObjects = objects.map((item) => {
                        if (item.id === obj.id && item.type === 'shape') {
                          return {
                            ...item,
                            x: e.target.x(),
                            y: e.target.y(),
                          }
                        }

                        return item
                      })

                      onObjectsChange(updatedObjects)
                    }}

                    onTransformEnd={(e) => {
                      const node = e.target as Konva.Rect

                      const scaleX = node.scaleX()
                      const scaleY = node.scaleY()

                      const updatedObjects = objects.map((item) => {
                        if (item.id === obj.id && item.type === 'shape') {
                          return {
                            ...item,
                            x: node.x(),
                            y: node.y(),
                            width: Math.max(20, node.width() * scaleX),
                            height: Math.max(20, node.height() * scaleY),
                            rotation: node.rotation(),
                          }
                        }

                        return item
                      })

                      node.scaleX(1)
                      node.scaleY(1)

                      onObjectsChange(updatedObjects)
                    }}
                  />
                )
              })}

        {/* 선택 테두리 */}
        {selectedId && (
          <Transformer
            ref={transformerRef}
            rotateEnabled={true}
              enabledAnchors={[
                'top-left',
                'top-center',
                'top-right',
                'middle-left',
                'middle-right',
                'bottom-left',
                'bottom-center',
                'bottom-right',
              ]}
            />
          )}
        </Layer>
      </Stage>

      {/* 다중 텍스트 선택 시 툴바 표시 */}
      {selectedTextObject && (
        <FloatingToolbar
          text={selectedTextObject.text}
          fontSize={selectedTextObject.fontSize}
          fontFamily={selectedTextObject.fontFamily}
          textColor={selectedTextObject.fill}
          bold={selectedTextObject.bold}
          italic={selectedTextObject.italic}
          align={selectedTextObject.align}

          onTextChange={(value) =>
            updateSelectedText({ text: value })
          }

          onFontSizeChange={(value) =>
            updateSelectedText({ fontSize: value })
          }

          onFontFamilyChange={(value) =>
            updateSelectedText({ fontFamily: value })
          }

          onColorChange={(value) =>
            updateSelectedText({ fill: value })
          }

          onBoldChange={() =>
            updateSelectedText({
              bold: !selectedTextObject.bold,
            })
          }

          onItalicChange={() =>
            updateSelectedText({
              italic: !selectedTextObject.italic,
            })
          }

          onAlignChange={(value) =>
            updateSelectedText({ align: value })
          }
        />
      )}

      {/* 다중 이미지 선택 시 툴바 표시 */}
      {selectedImageObject && (
        <ImageToolbar
          opacity={selectedImageObject.opacity}

          onOpacityChange={(value) =>
            updateSelectedImage({ opacity: value })
          }

          onFlip={() =>
            updateSelectedImage({
              flipped: !selectedImageObject.flipped,
            })
          }

          onRotate={() =>
            updateSelectedImage({
              rotation: selectedImageObject.rotation + 90,
            })
          }

          onDelete={() => {
            const updatedObjects = objects.filter(
              (obj) => obj.id !== selectedImageObject.id
            )

            onObjectsChange(updatedObjects)
            onSelectObject(null)
          }}
        />
      )}

      {/* 다중 도형 선택 시 툴바 표시 */}
      {selectedShapeObject && (
        <ShapeToolbar
          fillColor={selectedShapeObject.fill}
          strokeColor={selectedShapeObject.stroke}
          opacity={selectedShapeObject.opacity}
          cornerRadius={selectedShapeObject.cornerRadius}

          onFillColorChange={(value) =>
            updateSelectedShape({ fill: value })
          }

          onStrokeColorChange={(value) =>
            updateSelectedShape({ stroke: value })
          }

          onOpacityChange={(value) =>
            updateSelectedShape({ opacity: value })
          }

          onCornerRadiusChange={(value) =>
            updateSelectedShape({ cornerRadius: value })
          }

          onDelete={() => {
            const updatedObjects = objects.filter(
              (obj) => obj.id !== selectedShapeObject.id
            )

            onObjectsChange(updatedObjects)
            onSelectObject(null)
          }}
        />
      )}
    </>
  )
}

export default EditorCanvas