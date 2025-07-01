import './Train.css';

import { AppContext } from '@renderer/AppContext';
import { Graphs } from '@renderer/components/Graphs';
import { ImageBox } from '@renderer/components/ImageBox';
import { PredictionBar } from '@renderer/components/PredictionBar';
import { Webcam } from '@renderer/components/Webcam';
import { Logs } from '@tensorflow/tfjs';
import { useCallback, useContext, useRef, useState } from 'react';
import { PiCaretDoubleLeftBold, PiCaretDoubleRightBold } from 'react-icons/pi';

export const Train = (): React.JSX.Element => {
  const { setModel } = useContext(AppContext);

  const [trainView, setTrainView] = useState<boolean>(false);
  const [training, setTraining] = useState<boolean>(false);

  const [posImages, setPosImages] = useState<ImageData[]>([]);
  const [negImages, setNegImages] = useState<ImageData[]>([]);
  const [trainingData, setTrainingData] = useState<Sample[]>([]);
  const disabled = !(posImages.length > 10 && negImages.length > 10);

  const [logs, setLogs] = useState<Logs[]>([]);

  const [focus, setFocus] = useState<boolean>(false); // positive = false
  const focusRef = useRef<boolean>(false);

  const captureCallback = useCallback((imageData: ImageData, keypoints: Keypoint3D[]) => {
    const label = +focusRef.current;
    setTrainingData((prev) => [...prev, { keypoints, label } as Sample]);
    (label ? setNegImages : setPosImages)((prev) => [...prev, imageData]);
  }, []);

  const startTraining = (): void => {
    setTraining(true);
    setLogs([]);

    const stopListening = window.electron.ipcRenderer.on('trainProgress', (_, log) => {
      setLogs((prev) => [...prev, log]);
      console.log(log);
    });

    window.electron.ipcRenderer.once('trainComplete', (_, modelId) => {
      stopListening();
      setTraining(false);
      setModel(modelId);
    });

    window.electron.ipcRenderer.invoke('train', trainingData);
  };

  return (
    <div className="train">
      {!trainView && (
        <div className="train-samples">
          <ImageBox
            type="Positive"
            focused={!focus}
            images={posImages}
            setImages={setPosImages}
            onClick={() => {
              focusRef.current = false;
              setFocus(false);
            }}
          />
          <ImageBox
            type="Negative"
            focused={focus}
            images={negImages}
            setImages={setNegImages}
            onClick={() => {
              focusRef.current = true;
              setFocus(true);
            }}
          />
        </div>
      )}

      <div className="train-webcam-container">
        <Webcam capture={trainView ? null : captureCallback} />
        {trainView && <PredictionBar />}
      </div>

      {trainView && <Graphs logs={logs} />}

      {trainView && (
        <button className="back-btn" onClick={() => setTrainView(false)}>
          <PiCaretDoubleLeftBold />
        </button>
      )}

      {!trainView && (
        <button
          className={'forward-btn' + (disabled ? ' disabled' : '')}
          onClick={() => {
            if (!disabled) {
              setTrainView(true);
              if (!training) startTraining();
            }
          }}
        >
          <PiCaretDoubleRightBold />
        </button>
      )}
    </div>
  );
};
