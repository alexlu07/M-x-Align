import { ModelList } from '@renderer/components/ModelList';
import { PredictionBar } from '@renderer/components/PredictionBar';
import { Webcam } from '@renderer/components/Webcam';

export const Home = (): React.JSX.Element => {
  return (
    <>
      <div>
        <ModelList />
        <div>
          <Webcam />
          <PredictionBar />
        </div>
      </div>
    </>
  );
};
