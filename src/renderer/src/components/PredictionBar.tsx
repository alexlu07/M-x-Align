import { AppContext } from '@renderer/AppContext';
import { preprocess } from '@shared/utils';
import { tensor1d } from '@tensorflow/tfjs';
import { useContext, useEffect, useRef, useState } from 'react';

export const PredictionBar = (): React.JSX.Element => {
  const { keypointsRef, modelRef } = useContext(AppContext);
  const [prediction, setPrediction] = useState<number>(0.5);

  const requestRef = useRef<number>(null);

  useEffect(() => {
    const predictPose = async (): Promise<void> => {
      const keypoints = keypointsRef?.current;
      const model = modelRef?.current;
      if (keypoints && model) {
        const input = preprocess(keypointsRef);
        const results = model.predict(tensor1d(input));
        setPrediction(results[0]);
      }

      requestRef.current = requestAnimationFrame(predictPose);
    };

    requestRef.current = requestAnimationFrame(predictPose);

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [keypointsRef, modelRef]);

  return (
    <div className="label-box vertbox">
      <div className="positive">
        <div className="label">Positive</div>
        <div className="progress-bar">
          <div className="inner" style={{ width: `${Math.round(prediction * 100)}%` }}>
            <span className="percentage">{Math.round(prediction * 100)}%</span>
          </div>
        </div>
      </div>
      <div className="negative">
        <div className="label">Negative</div>
        <div className="progress-bar">
          <div className="inner" style={{ width: `${Math.round((1 - prediction) * 100)}%` }}>
            <span className="percentage">{Math.round((1 - prediction) * 100)}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};
