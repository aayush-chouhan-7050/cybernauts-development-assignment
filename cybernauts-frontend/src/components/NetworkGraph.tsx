// src/components/NetworkGraph.tsx
import { useEffect, useMemo, useCallback } from 'react';
import ReactFlow, { MiniMap, Controls, Background } from 'reactflow'; // Add Connection
import type { Connection, Node, Edge } from 'reactflow';
import 'reactflow/dist/style.css';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../app/store';
import { fetchGraphData, linkUsers, updateUserHobbies, deleteUser, unlinkUsers } from '../features/graph/graphSlice'; // Import linkUsers
import HighScoreNode from './nodes/HighScoreNode'; // Import custom nodes
import LowScoreNode from './nodes/LowScoreNode';

const NetworkGraph = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { nodes, edges, status } = useSelector((state: RootState) => state.graph);

  // Define node types for React Flow [cite: 94-95]
  const nodeTypes = useMemo(() => ({
      highScoreNode: HighScoreNode,
      lowScoreNode: LowScoreNode,
  }), []);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchGraphData());
    }
  }, [status, dispatch]);

  // Handler for connecting nodes by dragging [cite: 75]
  const handleConnect = useCallback((params: Connection) => {
    if (params.source && params.target) {
      dispatch(linkUsers({ source: params.source, target: params.target }));
    }
  }, [dispatch]);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();

    const droppedHobby = event.dataTransfer.getData('application/reactflow');
    // reactFlowInstance is not available here, so we find the node manually.
    // This logic finds the node element under the cursor.
    const targetNodeElement = (event.target as Element).closest('.react-flow__node');

    if (!droppedHobby || !targetNodeElement) {
      return;
    }

    const targetNodeId = targetNodeElement.getAttribute('data-id');
    if (!targetNodeId) return;

    const targetNode = nodes.find(n => n.id === targetNodeId);
    if (targetNode && !targetNode.data.hobbies.includes(droppedHobby)) {
      const updatedHobbies = [...targetNode.data.hobbies, droppedHobby];
      dispatch(updateUserHobbies({ userId: targetNodeId, hobbies: updatedHobbies }));
    }
  }, [dispatch, nodes]);

  const onNodesDelete = useCallback((deletedNodes: Node[]) => {
  // Show a confirmation dialog
  const isConfirmed = window.confirm(
    `Are you sure you want to delete ${deletedNodes.length} user(s)? This cannot be undone.`
  );
  
  if (isConfirmed) {
    deletedNodes.forEach(node => {
      dispatch(deleteUser(node.id));
    });
  }
  }, [dispatch]);

  const onEdgesDelete = useCallback((deletedEdges: Edge[]) => {
  deletedEdges.forEach(edge => {
    dispatch(unlinkUsers({ source: edge.source, target: edge.target }));
  });
  }, [dispatch]);

  if (status === 'loading' && nodes.length === 0) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{ height: '100vh', width: '100vw' }} >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onConnect={handleConnect}
        onNodesDelete={onNodesDelete} // Handle node deletion
        onDrop={onDrop}               // Handle drop event
        onDragOver={onDragOver} 
        onEdgesDelete={onEdgesDelete}     
        fitView
      >
        <MiniMap />
        <Controls />
        <Background />
      </ReactFlow>
    </div>
  );
};

export default NetworkGraph;