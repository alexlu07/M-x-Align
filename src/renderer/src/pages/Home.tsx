import { ModelList } from '@renderer/components/ModelList';
import { PredictionBar } from '@renderer/components/PredictionBar';
import { Webcam } from '@renderer/components/Webcam';
import { Link } from 'react-router';

export const Home = (): React.JSX.Element => {
  return (
    <div>
      <div>
        <ModelList />
        <div>
          <Webcam />
          <PredictionBar />
        </div>
      </div>
      <Link to="/train">Train</Link>
    </div>
  );
};
