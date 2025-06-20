import { ModelList } from '@renderer/components/ModelList';
import { PredictionBar } from '@renderer/components/PredictionBar';
import { Webcam } from '@renderer/components/Webcam';

export const Home = (): React.JSX.Element => {
  return (
    <div className="container vertbox">
      <div className="upper-box horibox">
        <ModelList />
        <div className="webcam-box vertbox">
          <Webcam />
          <PredictionBar />
        </div>
      </div>
    </div>
  );
};
