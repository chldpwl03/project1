import { useEffect, useState } from 'react'
import { Image } from 'react-konva'
import Konva from 'konva'
import type { ImageObject } from '../types'

type CanvasImageProps = {
  object: ImageObject
  onSelect: () => void
  onChange: (changes: Partial<ImageObject>) => void
}

function CanvasImage({
  object,
  onSelect,
  onChange,
}: CanvasImageProps) {
  const [image, setImage] = useState<HTMLImageElement | null>(null)

  useEffect(() => {
    const img = new window.Image()

    img.onload = () => {
      setImage(img)
    }

    img.src = object.imageUrl
  }, [object.imageUrl])

  if (!image) return null

  return (
    <Image
      id={object.id}
      image={image}
      x={object.x}
      y={object.y}
      width={object.width}
      height={object.height}
      opacity={object.opacity}
      rotation={object.rotation}
      scaleX={object.flipped ? -1 : 1}
      draggable

      onClick={onSelect}
      onTap={onSelect}

      onDragEnd={(e) => {
        onChange({
          x: e.target.x(),
          y: e.target.y(),
        })
      }}

      onTransformEnd={(e) => {
        const node = e.target as Konva.Image

        const scaleX = node.scaleX()
        const scaleY = node.scaleY()

        onChange({
          x: node.x(),
          y: node.y(),
          width: Math.max(20, node.width() * Math.abs(scaleX)),
          height: Math.max(20, node.height() * Math.abs(scaleY)),
          rotation: node.rotation(),
        })

        node.scaleX(object.flipped ? -1 : 1)
        node.scaleY(1)
      }}
    />
  )
}

export default CanvasImage