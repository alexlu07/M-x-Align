import React, { createContext } from 'react';
import * as tf from '@tensorflow/tfjs';
import { PoseDetector } from '@tensorflow-models/pose-detection';

export interface AppContextInterface {
  stream: MediaStream | null;
  modelRef: React.RefObject<tf.LayersModel | null> | null;
  poseModelRef: React.RefObject<PoseDetector | null> | null;
  keypointsRef: React.RefObject<Keypoint3D[] | null> | null;
  setStream: (stream: MediaStream) => void;
}

const initialContext: AppContextInterface = {
  stream: null,
  modelRef: null,
  poseModelRef: null,
  keypointsRef: null,
  setStream: () => {},
};

export const AppContext = createContext<AppContextInterface>(initialContext);
