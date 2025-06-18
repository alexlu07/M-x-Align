import { useState, useEffect, useRef } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as poseDetection from '@tensorflow-models/pose-detection';
import { AppContext } from '@renderer/AppContext';
import { Route, Routes } from 'react-router';
import { Home } from './pages/home';
// import { FilesetResolver, PoseLandmarker } from '@mediapipe/tasks-vision';

export const App = (): React.JSX.Element => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const modelRef = useRef<tf.LayersModel>(null);
  const poseModelRef = useRef<poseDetection.PoseDetector>(null);
  const keypointsRef = useRef<Keypoint3D[]>(null);

  const initialized = useRef<boolean>(false);

  useEffect(() => {
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

  /*
  TODO:
  - Create Hook for managing modelRef and currentModel
  - Put webcam + keypoint + pose logic on a single process
  */

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
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </AppContext>
  );
};
