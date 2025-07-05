import './Deploy.css';

import { AppContext } from '@renderer/AppContext';
import { PredictionBar } from '@renderer/components/PredictionBar';
import { Webcam } from '@renderer/components/Webcam';
import { useContext, useEffect, useRef, useState } from 'react';
import { PiArrowLineUp, PiArrowsOutCardinal, PiEye, PiStack, PiStop } from 'react-icons/pi';
import { useSearchParams } from 'react-router';

export const Deploy = (): React.JSX.Element => {
  const { setModel } = useContext(AppContext);
  const [floating, setFloatingState] = useState(true);
  const [hovering, setHovering] = useState(false);
  const [searchParams] = useSearchParams();

  const dragRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const modelId = searchParams.get('modelId');
    console.log(modelId);
    if (modelId && setModel) {
      setModel(modelId);
    }
  }, [searchParams, setModel]);

  const setFloating = (value: boolean): void => {
    window.electron.ipcRenderer.invoke('setFloating', value);
    setFloatingState(value);
  };

  const inBounds = (x: number, y: number): boolean => {
    const bounds = dragRef.current?.getBoundingClientRect();
    if (!bounds) return false;
    return x >= bounds.left && x <= bounds.right && y >= bounds.top && y <= bounds.bottom;
  };

  return (
    <div
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={(e) => !inBounds(e.clientX, e.clientY) && setHovering(false)}
      className={'deploy-page' + (hovering ? ' deploy-page-hover' : '')}
    >
      <div className="deploy-bar">
        <Webcam display={false} />
        <PredictionBar labels={['P', 'N']} size={0} />
      </div>
      {hovering && (
        <>
          <div className="deploy-menu">
            <div className="row-1">
              <button
                className={'deploy-btn' + (floating ? ' active' : '')}
                onClick={() => setFloating(true)}
              >
                <PiArrowLineUp />
              </button>
              <button
                className={'deploy-btn' + (!floating ? ' active' : '')}
                onClick={() => setFloating(false)}
              >
                <PiStack />
              </button>
            </div>
            <div className="row-2">
              <button className="deploy-btn">
                <PiEye />
              </button>
              <button
                onClick={() => window.electron.ipcRenderer.invoke('closeDeploy')}
                className="deploy-btn stop-button"
              >
                <PiStop />
              </button>
            </div>
          </div>
          <div ref={dragRef} className="drag-button">
            <PiArrowsOutCardinal />
          </div>
        </>
      )}
    </div>
  );
};
