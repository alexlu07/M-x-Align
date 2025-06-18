import { PredictionBar } from '@renderer/components/PredictionBar';
import { Webcam } from '@renderer/components/Webcam';

export const Home = (): React.JSX.Element => {
  return (
    <>
      <div>
        <div>
          <Webcam />
          <PredictionBar />
        </div>
      </div>
    </>
  );
};
