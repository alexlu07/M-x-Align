import './ModelList.css';

import { AppContext } from '@renderer/AppContext';
import { useContext, useEffect, useState } from 'react';
import {
  PiArrowArcLeft,
  PiCheckBold,
  PiMinusBold,
  PiPencilSimple,
  PiTrashSimple,
} from 'react-icons/pi';

export const ModelList = (): React.JSX.Element => {
  const { currentModel, setModel } = useContext(AppContext);
  const [modelList, setModelList] = useState<string[]>([]);
  const [modelToEdit, setModelToEdit] = useState<string | null>(null);
  const [editText, setEditText] = useState<string>('');
  const [modelToDelete, setModelToDelete] = useState<string | null>(null);

  useEffect(() => {
    window.electron.ipcRenderer.invoke('listModels').then((models) => {
      console.log('Models:', models);
      setModelList(models);
      if (models.length) {
        const modelId = models[0];
        setModel(modelId);
      }
    });
  }, [setModel]);

  const renameModel = (): boolean => {
    const newModelId = editText.trim();
    if (modelToEdit && newModelId !== '' && !modelList.includes(newModelId)) {
      window.electron.ipcRenderer.invoke('renameModel', modelToEdit, newModelId);
      setModelToEdit(null);
      setModelList((prevList) => prevList.map((id) => (id === modelToEdit ? editText.trim() : id)));
      setModel(newModelId);
      return true;
    }
    return false;
  };

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
              {modelId === modelToEdit ? (
                <>
                  <input
                    className="model-text"
                    autoFocus
                    value={editText}
                    onChange={(e) => {
                      setEditText(e.target.value);
                    }}
                    onBlur={(e) => {
                      console.log(e);
                      if (
                        e.relatedTarget?.getAttribute('data-action') === 'undo' ||
                        !renameModel()
                      ) {
                        setModelToEdit(null);
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        renameModel();
                      } else if (e.key === 'Escape') {
                        setModelToEdit(null);
                      }
                    }}
                  />
                  <button data-action="undo">
                    <PiArrowArcLeft className="popups" />
                  </button>
                </>
              ) : (
                <>
                  <div className="model-text">{modelId}</div>
                  <PiPencilSimple
                    onClick={() => {
                      setModelToEdit(modelId);
                      setEditText(modelId);
                    }}
                    className="popups"
                  />
                </>
              )}
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
