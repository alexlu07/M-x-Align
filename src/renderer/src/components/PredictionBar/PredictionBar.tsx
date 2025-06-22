import './PredictionBar.css';

import { AppContext } from '@renderer/AppContext';
import { preprocess } from '@shared/utils';
import { Tensor, tensor2d } from '@tensorflow/tfjs';
import { useContext, useEffect, useState } from 'react';

export const PredictionBar = (): React.JSX.Element => {
  const { keypointsRef, modelRef } = useContext(AppContext);
  const [prediction, setPrediction] = useState<number>(0.5);

  useEffect(() => {
    let active = true;

    const predictPose = async (): Promise<void> => {
      console.log('hi');
      const keypoints = keypointsRef?.current;
      const model = modelRef?.current;
      if (keypoints && model) {
        const input = preprocess(keypointsRef.current);
        const results = model.predict(tensor2d(input, [1, input.length])) as Tensor;

        setPrediction((await results.data())[0]);
      }

      if (active) requestAnimationFrame(predictPose);
    };

    requestAnimationFrame(predictPose);

    return () => {
      active = false;
    };
  }, [keypointsRef, modelRef]);

  return (
    <div className="prediction-bar">
      <div className="positive">
        <div className="label">Positive</div>
        <div className="bar">
          <div className="inner" style={{ width: `${Math.round(prediction * 100)}%` }}>
            <span className="percentage">{Math.round(prediction * 100)}%</span>
          </div>
        </div>
      </div>
      <div className="negative">
        <div className="label">Negative</div>
        <div className="bar">
          <div className="inner" style={{ width: `${Math.round((1 - prediction) * 100)}%` }}>
            <span className="percentage">{Math.round((1 - prediction) * 100)}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};
