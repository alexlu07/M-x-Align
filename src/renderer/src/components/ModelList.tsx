import { AppContext } from '@renderer/AppContext';
import * as tf from '@tensorflow/tfjs';
import { useCallback, useContext, useEffect, useState } from 'react';

export const ModelList = (): React.JSX.Element => {
  const { modelRef } = useContext(AppContext);
  const [modelList, setModelList] = useState<string[]>([]);
  const [currentModel, setCurrentModel] = useState<string | null>(null);

  const updateModel = useCallback(
    async (modelId: string): Promise<void> => {
      const files = await window.electron.ipcRenderer.invoke('loadFiles', modelId);
      const jsonFile = new File([files.json.data], files.json.name, { type: files.json.type });
      const weightsFile = new File([files.weights.data], files.weights.name, {
        type: files.weights.type,
      });

      const model = await tf.loadLayersModel(tf.io.browserFiles([jsonFile, weightsFile]));
      if (modelRef) modelRef.current = model;
      setCurrentModel(modelId);
    },
    [modelRef],
  );

  useEffect(() => {
    window.electron.ipcRenderer.invoke('listModels').then((models) => {
      setModelList(models);
      if (models.length) {
        const modelId = models[0];
        updateModel(modelId);
      }
    });
  }, [updateModel]);

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
              <li key={modelId} onClick={() => updateModel(modelId)}>
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
