import { AppContext } from '@renderer/AppContext';
import { useContext, useEffect, useState } from 'react';

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
    <div>
      <h1>Choose Model {currentModel}</h1>
      <ul>
        {modelList.map((modelId) => {
          if (modelId === currentModel) {
            return (
              <li key={modelId}>
                <i className="fa-solid fa-check fa-fw" />
                {modelId}
              </li>
            );
          } else {
            return (
              <li key={modelId} onClick={() => setModel(modelId)}>
                <i className="fa-solid fa-minus fa-fw" />
                {modelId}
              </li>
            );
          }
        })}
      </ul>
    </div>
  );
};
