import { PiTrash } from 'react-icons/pi';
import './ImageBox.css';

import { useEffect, useRef } from 'react';

export const ImageBox = ({
  type,
  focused,
  images,
  setImages,
  onClick,
}: {
  type: string;
  focused: boolean;
  images: ImageData[];
  setImages: (images: ImageData[]) => void;
  onClick: () => void;
}): React.JSX.Element => {
  const canvasRefs = useRef<(HTMLCanvasElement | null)[]>([]);

  useEffect(() => {
    canvasRefs.current.forEach((canvas, idx) => {
      const imageData = images[idx];
      if (canvas && imageData) {
        canvas.width = imageData.width;
        canvas.height = imageData.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.putImageData(imageData, 0, 0);
        }
      }
    });
  }, [images]);

  return (
    <div className={'image-box' + ' image-box-' + type + ' focused-' + focused} onClick={onClick}>
      <div className="image-box-title">
        {type}
        <span>{images.length}</span>
      </div>
      <div className="images">
        {images.length ? (
          images.map((_, idx) => (
            <div key={idx} className="mini-canvas">
              <canvas
                ref={(el) => {
                  canvasRefs.current[idx] = el;
                }}
              />
              <div
                onClick={() => {
                  setImages(images.filter((_, index) => index != idx));
                }}
                className="delete-image"
              >
                <PiTrash />
              </div>
            </div>
          ))
        ) : (
          <div className="fallback-text">Training data appears here...</div>
        )}
      </div>
    </div>
  );
};
