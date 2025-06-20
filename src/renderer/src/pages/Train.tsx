import { AppContext } from '@renderer/AppContext';
import { Graphs } from '@renderer/components/Graphs';
import { ImageBox } from '@renderer/components/ImageBox';
import { PredictionBar } from '@renderer/components/PredictionBar';
import { Webcam } from '@renderer/components/Webcam';
import { Logs } from '@tensorflow/tfjs';
import { useCallback, useContext, useRef, useState } from 'react';

export const Train = (): React.JSX.Element => {
  const { setModel } = useContext(AppContext);

  const [trainView, setTrainView] = useState<boolean>(false);
  const [training, setTraining] = useState<boolean>(false);

  const [posImages, setPosImages] = useState<ImageData[]>([]);
  const [negImages, setNegImages] = useState<ImageData[]>([]);
  const [trainingData, setTrainingData] = useState<Sample[]>([]);

  const [logs, setLogs] = useState<Logs[]>([]);

  const focusRef = useRef<boolean>(false); // positive = false

  const captureCallback = useCallback((imageData: ImageData, keypoints: Keypoint3D[]) => {
    const label = +focusRef.current;
    setTrainingData((prev) => [...prev, { keypoints, label } as Sample]);
    (label ? setNegImages : setPosImages)((prev) => [...prev, imageData]);
  }, []);

  const startTraining = (): void => {
    const stopListening = window.electron.ipcRenderer.on('trainProgress', (_, log) => {
      setLogs((prev) => [...prev, log]);
      console.log(log);
    });

    window.electron.ipcRenderer.invoke('train', trainingData).then((modelId) => {
      stopListening();
      setTraining(false);
      setModel(modelId);
    });

    setTraining(true);
  };

  return (
    <div className="container horibox">
      <div className="dropdown-box vertbox">
        <div className="header">
          <span>
            <i className="fa-solid fa-caret-down"></i>Training Samples
          </span>
        </div>
        {!trainView && (
          <div className="samples vertbox">
            <ImageBox
              type="Positive"
              images={posImages}
              onClick={() => {
                focusRef.current = false;
              }}
            />
            <ImageBox
              type="Negative"
              images={negImages}
              onClick={() => {
                focusRef.current = true;
              }}
            />
          </div>
        )}
      </div>

      {trainView && <button onClick={() => setTrainView(false)} />}

      <div>
        <Webcam capture={trainView ? null : captureCallback} />
        {trainView && <PredictionBar />}
      </div>

      {!trainView && (
        <button
          onClick={() => {
            setTrainView(true);
            if (!training) startTraining();
          }}
        />
      )}

      {trainView && <Graphs logs={logs} />}
    </div>
  );
};
