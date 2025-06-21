import './Home.css';

import { ModelList } from '@renderer/components/ModelList';
import { PredictionBar } from '@renderer/components/PredictionBar';
import { Webcam } from '@renderer/components/Webcam';
import { Link } from 'react-router';

export const Home = (): React.JSX.Element => {
  return (
    <div className="home">
      <div className="left-panel">
        <div className="title">
          M-x <span className="highlight">Align</span>.
        </div>
        <div className="model-list-container">
          <ModelList />
        </div>
      </div>
      <div className="right-panel">
        <div className="webcam-container">
          <Webcam />
          <PredictionBar />
        </div>
        <div className="train-link">
          <Link to="/train">Train new model</Link>
        </div>
      </div>
    </div>
  );
};
