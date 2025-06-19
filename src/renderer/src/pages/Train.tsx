import { AppContext } from '@renderer/AppContext';
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
    });

    window.electron.ipcRenderer.invoke('train', trainingData).then((modelId) => {
      stopListening();
      setTraining(false);
      setModel(modelId);
    });

    setTraining(true);
  };

  return (
    <div>
      <div>
        <ImageBox type="Positive" images={posImages} />
        <ImageBox type="Positive" images={negImages} />
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
      {/* Graphs */}
    </div>
  );
};
