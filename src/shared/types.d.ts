type ModelFiles = {
  json: {
    name: string;
    type: string;
    data: ArrayBuffer;
  };
  weights: {
    name: string;
    type: string;
    data: ArrayBuffer;
  };
};

type Keypoint3D = {
  x: number;
  y: number;
  z: number;
  score: number;
  name: string;
};
