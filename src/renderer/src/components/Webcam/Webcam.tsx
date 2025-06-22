import './Webcam.css';

import { AppContext } from '@renderer/AppContext';
import { memo, Ref, useContext, useEffect, useRef } from 'react';
import { drawKeypoints, drawSkeleton } from './drawing';

const WebcamComponent = ({
  display = true,
  capture = null,
}: {
  display?: boolean;
  capture?: ((imageData: ImageData, keypoints: Keypoint3D[]) => void) | null;
  keypointsRef?: Ref<Keypoint3D>;
}): React.JSX.Element => {
  const { stream, setStream, poseModelRef, keypointsRef } = useContext(AppContext);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!stream) {
      navigator.mediaDevices.getUserMedia({ video: { width: 320, height: 240 } }).then((result) => {
        setStream(result);
      });
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas) return; // should never happen

    let hasWarned = false;
    let active = true;
    const id = Math.random();

    video.srcObject = stream;
    video.play().then(() => {
      video.width = video.videoWidth;
      video.height = video.videoHeight;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      requestAnimationFrame(detectPose);
    });

    const detectPose = async (): Promise<void> => {
      console.log(id);
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        const poseModel = poseModelRef?.current;
        if (poseModel) {
          const poses = await poseModel.estimatePoses(video);
          if (poses.length) {
            const keypoints2D = poses[0].keypoints;

            drawKeypoints(ctx, keypoints2D);
            drawSkeleton(ctx, keypoints2D);

            const keypoints3D = poses[0].keypoints3D;
            if (keypoints3D) {
              const keypoints = keypoints3D.map((kp) => {
                return { ...kp, z: kp.z ?? 0 } as Keypoint3D;
              });

              if (keypointsRef) keypointsRef.current = keypoints;
            }
          }
        } else {
          if (!hasWarned) {
            console.warn('Pose model has not yet initialized');
            hasWarned = true;
          }
        }
      }

      if (active) requestAnimationFrame(detectPose);
    };

    return () => {
      active = false;
    };
  }, [stream, setStream, poseModelRef, keypointsRef]);

  const handleCapture = (): void => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    const keypoints = keypointsRef?.current;

    if (capture && canvas && ctx && keypoints) {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      capture(imageData, keypoints);
    }
  };

  return (
    <div className="webcam">
      <video style={{ display: 'none' }} ref={videoRef} />
      <canvas className="canvas" style={{ display: display ? 'flex' : 'none' }} ref={canvasRef} />

      {capture && (
        <button className="webcam-button" onClick={handleCapture}>
          <i className="fa-solid fa-record-vinyl" />
          Capture
        </button>
      )}
    </div>
  );
};

export const Webcam = memo(WebcamComponent);
