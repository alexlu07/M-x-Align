import { join } from 'path';
import fs from 'fs';
import { app } from 'electron';
import * as tf from '@tensorflow/tfjs-node';
import { angleBetween, euclidean, midpoint } from './utils';

const MODEL_DIR = join(app.getPath('userData'), 'models');

// Keypoints: https://github.com/tensorflow/tfjs-models/tree/master/pose-detection
const keypointIdxs = [
  /* eslint-disable */
  0, // nose
  2, 5, // eyes
  7, 8, // ears
  9, 10, // mouth
  11, 12, // shoulders
  13, 14, // elbows
  15, 16, // wrists
  23, 24, // hips
  25, 26, // knees
  /* eslint-enable */
];

export function listModels(): string[] {
  if (!fs.existsSync(MODEL_DIR)) {
    fs.mkdirSync(MODEL_DIR, { recursive: true });
    return [];
  }

  return fs.readdirSync(MODEL_DIR).filter((file) => {
    return fs.statSync(join(MODEL_DIR, file)).isDirectory();
  });
}

export function loadFiles(model: string): ModelFiles {
  const toFile = (base: string, name: string, type: string): File => {
    const path = join(base, name);
    const blob = new Blob([fs.readFileSync(path)], { type });
    return new File([blob], name, { type });
  };

  const path = join(MODEL_DIR, model);

  return {
    json: toFile(path, 'model.json', 'application/json'),
    weights: toFile(path, 'weights.bin', 'application/octet-stream'),
  };
}

function prepareData(samples: { keypoints3D: Keypoint3D[]; label: number }[]): {
  xs: tf.Tensor;
  ys: tf.Tensor;
  inputShape: number;
  outputShape: number;
} {
  const data = samples.map((s) => {
    const keypoints = keypointIdxs.map((idx) => s.keypoints3D[idx]);
    const flattened = keypoints.flatMap((kp) => [kp.x, kp.y, kp.z, kp.score]);

    const lShoulder = s.keypoints3D[11];
    const rShoulder = s.keypoints3D[12];
    const lHip = s.keypoints3D[23];
    const rHip = s.keypoints3D[24];
    const lEar = s.keypoints3D[7];
    const rEar = s.keypoints3D[8];
    const nose = s.keypoints3D[0];

    const shoulderDist = euclidean(lShoulder, rShoulder);
    const shoulderTilt = lShoulder.y - rShoulder.y;
    const spineMid = midpoint(lShoulder, rShoulder);
    const headForward = nose.z - spineMid.z;

    const neckAngleLeft = angleBetween(lShoulder, lEar, nose);
    const neckAngleRight = angleBetween(rShoulder, rEar, nose);
    const neckAngle = (neckAngleLeft + neckAngleRight) / 2;

    const backAngleLeft = angleBetween(lHip, lShoulder, nose);
    const backAngleRight = angleBetween(rHip, rShoulder, nose);
    const backAngle = (backAngleLeft + backAngleRight) / 2;
    const torsoLength = euclidean(lShoulder, lHip) + euclidean(rShoulder, rHip);

    return [
      ...flattened,
      shoulderDist,
      shoulderTilt,
      headForward,
      neckAngle,
      backAngle,
      torsoLength,
    ];
  });

  const labels = samples.map((s) => s.label);

  const xs = tf.tensor2d(data);
  const ys = tf.oneHot(tf.tensor1d(labels, 'int32'), 2);

  return { xs, ys, inputShape: data[0].length, outputShape: 2 };
}

export async function train(
  samples: { keypoints3D: Keypoint3D[]; label: number }[],
  callbacks: tf.CustomCallbackArgs,
): Promise<string> {
  const { xs, ys, inputShape, outputShape } = prepareData(samples);

  const model = tf.sequential({
    layers: [
      tf.layers.dense({ units: 128, inputShape: [inputShape], activation: 'relu' }),
      tf.layers.dense({ units: 64, activation: 'relu' }),
      tf.layers.dropout({ rate: 0.5 }),
      tf.layers.dense({ units: outputShape, activation: 'softmax' }),
    ],
  });

  model.compile({
    optimizer: tf.train.adam(1e-4),
    loss: 'categoricalCrossentropy',
    metrics: ['accuracy'],
  });

  await model.fit(xs, ys, {
    epochs: 16,
    batchSize: 16,
    validationSplit: 0.2,
    callbacks: callbacks,
  });

  const name = new Date().toLocaleString();
  const path = join(MODEL_DIR, name);

  await model.save(`file://${path}`);

  return name;
}
