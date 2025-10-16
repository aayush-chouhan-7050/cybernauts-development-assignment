// src/components/nodes/HighScoreNode.tsx
import { Handle, Position } from 'reactflow';
import './NodeStyles.css';

const HighScoreNode = ({ data }: { data: any }) => {
  const nodeStyle = {
  transform: `scale(${1 + data.popularityScore / 50})`, // Scale up slightly with score
  borderWidth: `${2 + Math.floor(data.popularityScore / 5)}px` // Thicker border for higher score
  };
  return (
    <div className="react-flow-node high-score" style={nodeStyle}>
      <Handle type="target" position={Position.Top} />
      <div>
        <strong>{data.label}</strong> ({data.age})<br />
        <small>Score: {data.popularityScore.toFixed(1)}</small>
      </div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};

export default HighScoreNode;