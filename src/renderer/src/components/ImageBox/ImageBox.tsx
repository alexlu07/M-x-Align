import './ImageBox.css';

import { useEffect, useRef } from 'react';

export const ImageBox = ({
  type,
  focused,
  images,
  onClick,
}: {
  type: string;
  focused: boolean;
  images: ImageData[];
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
            <canvas
              key={idx}
              ref={(el) => {
                canvasRefs.current[idx] = el;
              }}
              className="mini-canvas"
            />
          ))
        ) : (
          <div className="fallback-text">Training data appears here...</div>
        )}
      </div>
    </div>
  );
};
