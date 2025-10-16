// src/components/nodes/LowScoreNode.tsx
import { Handle, Position } from 'reactflow';
import './NodeStyles.css';

const LowScoreNode = ({ data }: { data: any }) => {
  return (
    <div className="react-flow-node low-score">
      <Handle type="target" position={Position.Top} />
      <div>
        <strong>{data.label}</strong> ({data.age})<br />
        <small>Score: {data.popularityScore.toFixed(1)}</small>
      </div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};

export default LowScoreNode;