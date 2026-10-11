import { useState } from 'react'

interface ProductGalleryProps {
  images: string[]
  alt: string
}

export function ProductGallery({ images, alt }: ProductGalleryProps) {
  const [selected, setSelected] = useState(0)
  const current = images[selected]

  return (
    <div className="gallery">
      <div className="gallery-main">
        {current ? (
          <img src={current} alt={alt} />
        ) : (
          <span className="product-card-placeholder" aria-hidden>
            {alt.charAt(0)}
          </span>
        )}
      </div>

      {images.length > 1 && (
        <div className="gallery-thumbs">
          {images.map((image, index) => (
            <button
              key={image}
              type="button"
              className="gallery-thumb"
              aria-pressed={index === selected}
              aria-label={`Ver imagem ${index + 1}`}
              onClick={() => setSelected(index)}
            >
              <img src={image} alt="" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
