import './ModelList.css';

import { AppContext } from '@renderer/AppContext';
import { useContext, useEffect, useState } from 'react';
import { PiCheckBold, PiMinusBold, PiPencilSimple, PiTrashSimple } from 'react-icons/pi';

export const ModelList = (): React.JSX.Element => {
  const { currentModel, setModel } = useContext(AppContext);
  const [modelList, setModelList] = useState<string[]>([]);
  const [modelToDelete, setModelToDelete] = useState<string | null>(null);

  useEffect(() => {
    window.electron.ipcRenderer.invoke('listModels').then((models) => {
      setModelList(models);
      if (models.length) {
        const modelId = models[0];
        setModel(modelId);
      }
    });
  }, [setModel]);

  const deleteModel = (modelId): void => {
    window.electron.ipcRenderer.invoke('deleteModel', modelId);

    if (currentModel === modelId) {
      const currIdx = modelList.indexOf(modelId);
      const nextIdx = currIdx > 0 ? currIdx - 1 : 1;
      if (nextIdx < modelList.length) setModel(modelList[nextIdx]);
    }

    setModelList(modelList.filter((id) => id !== modelId));
  };

  return (
    <div className="model-list">
      <div className="model-list-title">Select Model</div>
      <ul>
        {modelList.map((modelId) => {
          const shared = (
            <>
              <div>{modelId}</div>
              <PiPencilSimple className="popups" />
              <PiTrashSimple onClick={() => setModelToDelete(modelId)} className="popups" />
            </>
          );
          if (modelId === currentModel) {
            return (
              <li key={modelId} className="list-item selected-model">
                <PiCheckBold />
                {shared}
              </li>
            );
          } else {
            return (
              <li key={modelId} onClick={() => setModel(modelId)} className="list-item">
                <PiMinusBold />
                {shared}
              </li>
            );
          }
        })}
      </ul>
      {modelToDelete && (
        <div className="confirmation-overlay">
          <div className="confirmation-box">
            <div className="confirmation-text">
              Are you sure you want to delete <span>{modelToDelete}</span>?
            </div>
            <div className="confirmation-buttons">
              <button onClick={() => setModelToDelete(null)} className="cancel-button">
                Cancel
              </button>
              <button
                onClick={() => {
                  deleteModel(modelToDelete);
                  setModelToDelete(null);
                }}
                className="delete-button"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
