import { AppContext } from '@renderer/AppContext';
import './Home.css';

import { ModelList } from '@renderer/components/ModelList';
import { PredictionBar } from '@renderer/components/PredictionBar';
import { Webcam } from '@renderer/components/Webcam';
import { useContext } from 'react';
import { PiRocketLaunchBold } from 'react-icons/pi';

export const Home = (): React.JSX.Element => {
  const { currentModel } = useContext(AppContext);

  const deploy = (): void => {
    window.electron.ipcRenderer.invoke('deploy', currentModel);
  }

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
        <button onClick={deploy} className="deploy-link"><PiRocketLaunchBold />Deploy</button>
      </div>
    </div>
  );
};
