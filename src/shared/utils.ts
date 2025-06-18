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

export const preprocess = (kp): number[] => {
  const keypoints = keypointIdxs.map((idx) => kp[idx]);
  const flattened = keypoints.flatMap((kp) => [kp.x, kp.y, kp.z, kp.score]);

  const lShoulder = kp[11];
  const rShoulder = kp[12];
  const lHip = kp[23];
  const rHip = kp[24];
  const lEar = kp[7];
  const rEar = kp[8];
  const nose = kp[0];

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

  return [...flattened, shoulderDist, shoulderTilt, headForward, neckAngle, backAngle, torsoLength];
};

function euclidean(a, b): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2 + (a.z - b.z) ** 2);
}

function angleBetween(a, b, c): number {
  // angle at point b
  const ab = [a.x - b.x, a.y - b.y, a.z - b.z];
  const cb = [c.x - b.x, c.y - b.y, c.z - b.z];
  const dot = ab[0] * cb[0] + ab[1] * cb[1] + ab[2] * cb[2];
  const mag1 = Math.sqrt(ab[0] ** 2 + ab[1] ** 2 + ab[2] ** 2);
  const mag2 = Math.sqrt(cb[0] ** 2 + cb[1] ** 2 + cb[2] ** 2);
  const clamped = Math.max(-1, Math.min(1, dot / (mag1 * mag2))); // clamp to avoid NaN
  return Math.acos(clamped); // in radians
}

function midpoint(a, b): { x: number; y: number; z: number } {
  return {
    x: (a.x + b.x) / 2,
    y: (a.y + b.y) / 2,
    z: (a.z + b.z) / 2,
  };
}
