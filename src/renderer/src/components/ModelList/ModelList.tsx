import './ModelList.css';

import { AppContext } from '@renderer/AppContext';
import { useContext, useEffect, useState } from 'react';
import { PiCheckBold, PiMinusBold } from 'react-icons/pi';

export const ModelList = (): React.JSX.Element => {
  const { currentModel, setModel } = useContext(AppContext);
  const [modelList, setModelList] = useState<string[]>([]);

  useEffect(() => {
    window.electron.ipcRenderer.invoke('listModels').then((models) => {
      setModelList(models);
      if (models.length) {
        const modelId = models[0];
        setModel(modelId);
      }
    });
  }, [setModel]);

  return (
    <div className="model-list">
      <div className="model-list-title">Select Model</div>
      <ul>
        {modelList.map((modelId) => {
          if (modelId === currentModel) {
            return (
              <li key={modelId} className="list-item selected-model">
                <PiCheckBold />
                <div>{modelId}</div>
              </li>
            );
          } else {
            return (
              <li key={modelId} onClick={() => setModel(modelId)} className="list-item">
                <PiMinusBold />
                <div>{modelId}</div>
              </li>
            );
          }
        })}
      </ul>
    </div>
  );
};
