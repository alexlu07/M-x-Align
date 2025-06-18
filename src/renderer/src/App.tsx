import electronLogo from './assets/electron.svg';
import { useState, useEffect, useRef } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as poseDetection from '@tensorflow-models/pose-detection';
import { AppContext } from '@renderer/AppContext';
import { Webcam } from '@renderer/components/Webcam/Webcam';
import { PredictionBar } from './components/PredictionBar';
// import { FilesetResolver, PoseLandmarker } from '@mediapipe/tasks-vision';

export const App = (): React.JSX.Element => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const modelRef = useRef<tf.LayersModel>(null);
  const poseModelRef = useRef<poseDetection.PoseDetector>(null);
  const keypointsRef = useRef<Keypoint3D[]>(null);

  const initialized = useRef<boolean>(false);

  useEffect(() => {
    console.log('test');
    const initPoseModel = async (): Promise<void> => {
      await tf.ready();

      const model = poseDetection.SupportedModels.BlazePose;
      const detectorConfig = {
        runtime: 'mediapipe',
        modelType: 'full',
        solutionPath: '/blazepose',
      };

      poseModelRef.current = await poseDetection.createDetector(model, detectorConfig);
    };

    if (!initialized.current) {
      initialized.current = true;
      initPoseModel();
    }
  }, []);

  // const testTrain = (): void => {
  //   // Each sample must have at least 27 keypoints (indices up to 26)
  //   const sample1 = {
  //     keypoints3D: Array.from({ length: 33 }, (_, i): Keypoint3D => {
  //       return { x: i, y: i, z: i, score: 1, name: `kp${i}` };
  //     }),
  //     label: 0,
  //   };

  //   const sample2 = {
  //     keypoints3D: Array.from({ length: 33 }, (_, i): Keypoint3D => {
  //       return { x: i + 1, y: i + 2, z: i + 3, score: 1, name: `kp${i}` };
  //     }),
  //     label: 1,
  //   };

  //   const samples = Array.from({ length: 20 }, () => [sample1, sample2]).flat();

  //   const log = (_, progress): void => {
  //     console.log(
  //       `Epoch: ${progress.epoch}, Loss: ${progress.loss}, Accuracy: ${progress.accuracy}`,
  //     );
  //   };

  //   const stopListening = window.electron.ipcRenderer.on('trainProgress', log);

  //   window.electron.ipcRenderer.invoke('train', samples).then((modelId) => {
  //     console.log(`Model trained with ID: ${modelId}`);
  //     stopListening();
  //   });
  // };

  // const listModels = (): void => {
  //   window.electron.ipcRenderer.invoke('listModels').then((models) => {
  //     console.log('Available models:', models);
  //   });
  // };

  // window.getModelFiles = (modelId: string): void => {
  //   window.electron.ipcRenderer.invoke('loadFiles', modelId).then((files) => {
  //     const jsonFile = new File([files.json.data], files.json.name, { type: files.json.type });
  //     const weightsFile = new File([files.weights.data], files.weights.name, {
  //       type: files.weights.type,
  //     });

  //     console.log('Model files:', jsonFile, weightsFile);

  //     // print contents of the JSON file
  //     const reader = new FileReader();
  //     reader.onload = (e) => {
  //       console.log('Model JSON content:', e.target?.result);
  //     };
  //     reader.readAsText(jsonFile);
  //   });
  // };

  return (
    <AppContext value={{ stream, modelRef, poseModelRef, keypointsRef, setStream }}>
      <img alt="logo" className="logo" src={electronLogo} />
      {/* <div className="creator">Powered by electron-vite</div>
      <div className="text">
        Build an Electron app with <span className="react">React</span>
        &nbsp;and <span className="ts">TypeScript</span>
      </div> */}
      <p className="tip">
        Please try pressing <code>F12</code> to open the devTool
      </p>
      <div className="actions">
        <div className="action">
          <a href="https://electron-vite.org/" target="_blank" rel="noreferrer">
            Documentation
          </a>
        </div>
      </div>
      <Webcam
        capture={(ctx, keypoints3D) => {
          console.log(ctx);
          console.log(keypoints3D);
        }}
      />
      <PredictionBar />
    </AppContext>
  );
};
