import { useEffect, useRef } from 'react';

export const ImageBox = ({
  type,
  images,
  onClick,
}: {
  type: string;
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
    <div className="sample-box vertbox" onClick={onClick}>
      <div className="sample-box-header">{type}</div>

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
        <div>Training data appears here...</div>
      )}
    </div>
  );
};
