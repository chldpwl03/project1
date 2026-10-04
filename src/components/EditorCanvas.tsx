import { useEffect, useRef, useState } from 'react'
import { Image, Layer, Rect, Stage, Text, Transformer } from 'react-konva'
import Konva from 'konva'
import FloatingToolbar from './FloatingToolbar'
import ImageToolbar from './ImageToolbar'
import ShapeToolbar from './ShapeToolbar'

type EditorCanvasProps = {
  showText: boolean
  imageUrl: string | null
  showShape: boolean
}

function EditorCanvas({ showText, imageUrl, showShape, }: EditorCanvasProps) {
  const [selectedType, setSelectedType] =
    useState<'text' | 'image' | 'shape' | null>(null)
    

  // 텍스트 설정
  const [text, setText] = useState('텍스트를 입력하세요')
  const [fontSize, setFontSize] = useState(24)
  const [fontFamily, setFontFamily] = useState('Arial')
  const [textColor, setTextColor] = useState('#222222')
  const [bold, setBold] = useState(false)
  const [italic, setItalic] = useState(false)

  const [align, setAlign] =
    useState<'left' | 'center' | 'right'>('left')

  // 이미지 설정
  const [image, setImage] =
    useState<HTMLImageElement | null>(null)

    const [imageOpacity, setImageOpacity] = useState(1)
    const [imageFlipped, setImageFlipped] = useState(false)

  const textRef = useRef<Konva.Text>(null)
  const imageRef = useRef<Konva.Image>(null)
  const shapeRef = useRef<Konva.Rect>(null)
  const transformerRef = useRef<Konva.Transformer>(null)

  // 도형 설정
  const [shapeFillColor, setShapeFillColor] = useState('#d9d9d9')
  const [shapeStrokeColor, setShapeStrokeColor] = useState('#444444')
  const [shapeOpacity, setShapeOpacity] = useState(1)
  const [shapeCornerRadius, setShapeCornerRadius] = useState(0)
  const [shapeVisible, setShapeVisible] = useState(true)

  // 선택한 객체에 Transformer 연결
  useEffect(() => {
    if (!transformerRef.current) return

    if (selectedType === 'text' && textRef.current) {
    transformerRef.current.nodes([textRef.current])
    } else if (selectedType === 'image' && imageRef.current) {
      transformerRef.current.nodes([imageRef.current])
    } else if (selectedType === 'shape' && shapeRef.current) {
      transformerRef.current.nodes([shapeRef.current])
    } else {
      transformerRef.current.nodes([])
    }

    transformerRef.current.getLayer()?.batchDraw()
  }, [selectedType, image])

  // 업로드한 이미지 불러오기
  useEffect(() => {
    if (!imageUrl) {
      setImage(null)
      return
    }

    const img = new window.Image()

    img.onload = () => {
      setImage(img)
      setSelectedType('image')
    }

    img.src = imageUrl
  }, [imageUrl])

  let fontStyle = 'normal'

  if (bold && italic) {
    fontStyle = 'bold italic'
  } else if (bold) {
    fontStyle = 'bold'
  } else if (italic) {
    fontStyle = 'italic'
  }

  return (
    <>
      <Stage
        width={700}
        height={500}
        onMouseDown={(e) => {
          if (e.target === e.target.getStage()) {
            setSelectedType(null)
          }
        }}
      >
        <Layer>
          {/* 텍스트 */}
          {showText && (
            <Text
              ref={textRef}
              text={text}
              x={230}
              y={220}
              width={250}
              fontSize={fontSize}
              fontFamily={fontFamily}
              fontStyle={fontStyle}
              fill={textColor}
              align={align}
              draggable
              onClick={() => setSelectedType('text')}
              onTap={() => setSelectedType('text')}
            />
          )}

          {/* 이미지 */}
          {image && (
          <Image
            ref={imageRef}
            image={image}
            x={imageFlipped ? 500 : 200}
            y={120}
            width={300}
            height={200}
            opacity={imageOpacity}
            scaleX={imageFlipped ? -1 : 1}
            draggable
            onClick={() => setSelectedType('image')}
            onTap={() => setSelectedType('image')}
          />
        )}

          {/* 도형 */}
          {showShape && shapeVisible && (
            <Rect
              ref={shapeRef}
              x={250}
              y={170}
              width={200}
              height={150}
              fill={shapeFillColor}
              stroke={shapeStrokeColor}
              strokeWidth={2}
              opacity={shapeOpacity}
              cornerRadius={shapeCornerRadius}
              draggable
              onClick={() => setSelectedType('shape')}
              onTap={() => setSelectedType('shape')}
            />
          )}

        {/* 선택 테두리 */}
        {selectedType && (
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

      {/* 텍스트 선택 시에만 텍스트 툴바 표시 */}
      {showText && selectedType === 'text' && (
        <FloatingToolbar
          text={text}
          fontSize={fontSize}
          fontFamily={fontFamily}
          textColor={textColor}
          bold={bold}
          italic={italic}
          align={align}
          onTextChange={setText}
          onFontSizeChange={setFontSize}
          onFontFamilyChange={setFontFamily}
          onColorChange={setTextColor}
          onBoldChange={() => setBold(!bold)}
          onItalicChange={() => setItalic(!italic)}
          onAlignChange={setAlign}
        />
      )}

      {/* 이미지를 선택했을 때 */}
      {image && selectedType === 'image' && (
        <ImageToolbar
          opacity={imageOpacity}
          onOpacityChange={setImageOpacity}

          onFlip={() => {
            setImageFlipped(!imageFlipped)
          }}

          onRotate={() => {
            if (imageRef.current) {
              imageRef.current.rotate(90)
              imageRef.current.getLayer()?.batchDraw()
            }
          }}

          onDelete={() => {
            setImage(null)
            setSelectedType(null)
          }}
        />
      )}

      {/* 도형을 선택했을 때 */}
      {showShape && shapeVisible && selectedType === 'shape' && (
        <ShapeToolbar
          fillColor={shapeFillColor}
          strokeColor={shapeStrokeColor}
          opacity={shapeOpacity}
          cornerRadius={shapeCornerRadius}
          onFillColorChange={setShapeFillColor}
          onStrokeColorChange={setShapeStrokeColor}
          onOpacityChange={setShapeOpacity}
          onCornerRadiusChange={setShapeCornerRadius}
          onDelete={() => {
            setShapeVisible(false)
            setSelectedType(null)
          }}
        />
      )}
    </>
  )
}

export default EditorCanvas