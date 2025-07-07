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
  const [cool, setCool] = useState(0);
  const [floating, setFloatingState] = useState(true);
  const [hovering, setHovering] = useState(false);

  const [expanded, setExpanded] = useState(false);
  const [unexpandable, setUnexpandable] = useState(false);

  const dragRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const modelId = searchParams.get('modelId');
    console.log(modelId);
    if (modelId && setModel) {
      setModel(modelId);
    }
  }, [searchParams, setModel]);

  const setExpandedState = useCallback(
    (value: boolean): void => {
      console.log(value, expanded);
      if (value === expanded) return;
      window.electron.ipcRenderer.invoke('setExpanded', value);
      setExpanded(value);
    },
    [expanded],
  );

  const heatCallback = useCallback(
    ({ heatDiff }): void => {
      if (heatDiff < 1000) setHeat(0);
      else if (heatDiff < 8000) setHeat((heatDiff - 1000) / 8000);
      else {
        setUnexpandable(false);
        setExpandedState(true);
        setHeat(1);
      }
    },
    [setExpandedState],
  );

  const coolCallback = useCallback(({ coolDiff }): void => {
    console.log(coolDiff);
    if (coolDiff < 5000) setCool(coolDiff / 5000);
    else {
      setUnexpandable(true);
      setCool(1);
    }
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

  if (expanded)
    return (
      <div className="expanded-page" style={{ '--cool': cool } as CSSProperties}>
        <div className="title">Take a breath...</div>
        <div className="expanded-container">
          <Webcam display={true} />
          <PredictionBar predCallback={coolCallback} />
        </div>
        <button
          className={'unexpand' + (unexpandable ? '' : ' un-unexpandable')}
          onClick={() => unexpandable && setExpandedState(false)}
        >
          Continue
        </button>
      </div>
    );
  else
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
