import * as poseDetection from '@tensorflow-models/pose-detection';

const THRESHOLD = 0.5;
const LINE_WIDTH = 2;
const RADIUS = 4;
const BLAZEPOSE_MODEL = poseDetection.SupportedModels.BlazePose;

const drawKeypoints = (ctx, keypoints): void => {
  const keypointInd = poseDetection.util.getKeypointIndexBySide(BLAZEPOSE_MODEL);

  ctx.lineWidth = LINE_WIDTH;
  ctx.strokeStyle = 'White';
  ctx.fillStyle = 'Red';

  for (const i of keypointInd.middle) {
    drawKeypoint(ctx, keypoints[i]);
  }

  ctx.fillStyle = 'Green';
  for (const i of keypointInd.left) {
    drawKeypoint(ctx, keypoints[i]);
  }

  ctx.fillStyle = 'Orange';
  for (const i of keypointInd.right) {
    drawKeypoint(ctx, keypoints[i]);
  }
};

const drawKeypoint = (ctx, keypoint): void => {
  // If score is null, just show the keypoint.
  if (!keypoint.score || keypoint.score >= THRESHOLD) {
    const circle = new Path2D();
    circle.arc(keypoint.x, keypoint.y, RADIUS, 0, 2 * Math.PI);
    ctx.fill(circle);
    ctx.stroke(circle);
  }
};

const drawSkeleton = (ctx, keypoints): void => {
  ctx.fillStyle = 'White';
  ctx.strokeStyle = 'White';
  ctx.lineWidth = LINE_WIDTH;

  poseDetection.util.getAdjacentPairs(BLAZEPOSE_MODEL).forEach(([i, j]) => {
    const kp1 = keypoints[i];
    const kp2 = keypoints[j];

    // If score is null, just show the keypoint.
    const score1 = kp1.score != null ? kp1.score : 1;
    const score2 = kp2.score != null ? kp2.score : 1;

    if (score1 >= THRESHOLD && score2 >= THRESHOLD) {
      ctx.beginPath();
      ctx.moveTo(kp1.x, kp1.y);
      ctx.lineTo(kp2.x, kp2.y);
      ctx.stroke();
    }
  });
};

export { drawKeypoints, drawSkeleton };
