import './Deploy.css';

import { AppContext } from '@renderer/AppContext';
import { PredictionBar } from '@renderer/components/PredictionBar';
import { Webcam } from '@renderer/components/Webcam';
import { CSSProperties, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { PiArrowLineUp, PiArrowsOutCardinal, PiEye, PiStack, PiStop } from 'react-icons/pi';
import { useSearchParams } from 'react-router';

export const Deploy = (): React.JSX.Element => {
  const [searchParams] = useSearchParams();
  const { setModel } = useContext(AppContext);
  const [heat, setHeat] = useState(0);
  const [floating, setFloatingState] = useState(true);
  const [hovering, setHovering] = useState(false);

  const dragRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const modelId = searchParams.get('modelId');
    console.log(modelId);
    if (modelId && setModel) {
      setModel(modelId);
    }
  }, [searchParams, setModel]);

  const heatCallback = useCallback((diff: number): void => {
    if (diff < 1000) setHeat(0);
    else if (diff < 8000) setHeat((diff - 1000) / 8000);
    else setHeat(1);
  }, []);

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
      style={{ '--heat': heat } as CSSProperties}
      className={'deploy-page' + (hovering ? ' deploy-page-hover' : '')}
    >
      <div className="deploy-bar">
        <Webcam display={false} />
        <PredictionBar predCallback={heatCallback} labels={['P', 'N']} size={0} />
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
