import './Deploy.css';

import { AppContext } from "@renderer/AppContext";
import { PredictionBar } from "@renderer/components/PredictionBar";
import { Webcam } from "@renderer/components/Webcam";
import { useContext, useEffect } from "react";
import { useSearchParams } from "react-router";

export const Deploy = (): React.JSX.Element => {
  const { currentModel, setModel } = useContext(AppContext);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const modelId = searchParams.get('modelId');
    if (modelId) {
      setModel(modelId);
    }
  }, []);

  return (
    <div className="deploy-page">
      <div>{currentModel}</div>
      <Webcam display={false} />
      <PredictionBar />
    </div>
  )
};
