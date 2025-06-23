import './Graphs.css';

import * as tf from '@tensorflow/tfjs';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

export const Graphs = ({ logs }: { logs: tf.Logs[] }): React.JSX.Element => {
  return (
    <div className="loss-graph">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={logs}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="epoch"
            label={{ value: 'Epoch', position: 'insideBottomRight', offset: -5 }}
          />
          <YAxis label={{ value: 'Loss', angle: -90, position: 'insideLeft' }} />
          <Tooltip />
          <Legend verticalAlign="top" />
          <Line type="monotone" dataKey="loss" stroke="#8884d8" name="Training Loss" />
          <Line type="monotone" dataKey="val_loss" stroke="#82ca9d" name="Validation Loss" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
