type ModelFiles = {
  json: {
    name: string;
    type: string;
    data: Buffer<ArrayBuffer>;
  };
  weights: {
    name: string;
    type: string;
    data: Buffer<ArrayBuffer>;
  };
};

type Keypoint3D = {
  x: number;
  y: number;
  z: number;
  score: number;
  name: string;
};

type Sample = {
  keypoints: Keypoint3D[];
  label: number;
};
