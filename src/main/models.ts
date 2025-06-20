import { join } from 'path';
import fs from 'fs';
import { app } from 'electron';
import * as tf from '@tensorflow/tfjs-node';
import { preprocess } from '@shared/utils';

const MODEL_DIR = join(app.getPath('userData'), 'models');

export const listModels = (): string[] => {
  if (!fs.existsSync(MODEL_DIR)) {
    fs.mkdirSync(MODEL_DIR, { recursive: true });
    return [];
  }

  return fs.readdirSync(MODEL_DIR).filter((file) => {
    return fs.statSync(join(MODEL_DIR, file)).isDirectory();
  });
};

export const loadFiles = (model: string): ModelFiles => {
  const path = join(MODEL_DIR, model);

  return {
    json: {
      name: 'model.json',
      type: 'application/json',
      data: fs.readFileSync(join(path, 'model.json')),
    },
    weights: {
      name: 'weights.bin',
      type: 'application/octet-stream',
      data: fs.readFileSync(join(path, 'weights.bin')),
    },
  };
};

const prepareData = (
  samples: Sample[],
): {
  xs: tf.Tensor;
  ys: tf.Tensor;
  inputShape: number;
  outputShape: number;
} => {
  const data = samples.map((s) => preprocess(s.keypoints));

  const labels = samples.map((s) => s.label);

  const xs = tf.tensor2d(data);
  const ys = tf.oneHot(tf.tensor1d(labels, 'int32'), 2);

  return { xs, ys, inputShape: data[0].length, outputShape: 2 };
};

export const train = async (
  samples: Sample[],
  callbacks: tf.CustomCallbackArgs,
): Promise<string> => {
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
    optimizer: tf.train.adam(1e-3),
    loss: 'categoricalCrossentropy',
    metrics: ['accuracy'],
  });

  await model.fit(xs, ys, {
    epochs: 16,
    batchSize: 16,
    validationSplit: 0.2,
    callbacks: callbacks,
  });

  const name = new Date().toISOString();
  const path = join(MODEL_DIR, name);

  await model.save(`file://${path}`);

  return name;
};
