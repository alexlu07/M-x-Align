import { useState, useEffect, useRef, useCallback } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as poseDetection from '@tensorflow-models/pose-detection';
import { AppContext } from '@renderer/AppContext';
import { Route, Routes } from 'react-router';
import { Home } from './pages/Home';

export const App = (): React.JSX.Element => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [currentModel, setCurrentModel] = useState<string | null>(null);
  const modelRef = useRef<tf.LayersModel>(null);
  const poseModelRef = useRef<poseDetection.PoseDetector>(null);
  const keypointsRef = useRef<Keypoint3D[]>(null);

  const initialized = useRef<boolean>(false);

  const setModel = useCallback(async (modelId: string): Promise<void> => {
    const files = await window.electron.ipcRenderer.invoke('loadFiles', modelId);
    const jsonFile = new File([files.json.data], files.json.name, { type: files.json.type });
    const weightsFile = new File([files.weights.data], files.weights.name, {
      type: files.weights.type,
    });

    const model = await tf.loadLayersModel(tf.io.browserFiles([jsonFile, weightsFile]));
    modelRef.current = model;
    setCurrentModel(modelId);
  }, []);

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
  - Rename models (and check for conflict)

  REFACTORING:
  - Create Hook for managing modelRef and currentModel
  - Put webcam + keypoint + pose logic on a single process
  */

  return (
    <AppContext
      value={{
        stream,
        currentModel,
        modelRef,
        poseModelRef,
        keypointsRef,
        setStream,
        setModel,
      }}
    >
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </AppContext>
  );
};
