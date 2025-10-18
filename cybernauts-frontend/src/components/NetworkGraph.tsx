// src/components/NetworkGraph.tsx
import { useEffect, useCallback } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  applyNodeChanges,
} from 'reactflow'; // Import applyNodeChanges
import type { Connection, Node, Edge, NodeChange } from 'reactflow';
import 'reactflow/dist/style.css';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../app/store';
import {
  fetchGraphData,
  linkUsers,
  updateUserHobbies,
  deleteUser,
  unlinkUsers,
  nodesChanged,
  setSelectedNodeId,
  updateUserPosition,
} from '../features/graph/graphSlice';
import HighScoreNode from './nodes/HighScoreNode';
import LowScoreNode from './nodes/LowScoreNode';

const nodeTypes = {
  highScoreNode: HighScoreNode,
  lowScoreNode: LowScoreNode,
};

const NetworkGraph = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { nodes, edges, status } = useSelector(
    (state: RootState) => state.graph.present
  );

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchGraphData());
    }
  }, [status, dispatch]);

  // Handler for connecting nodes by dragging
  const handleConnect = useCallback(
    (params: Connection) => {
      if (params.source && params.target) {
        dispatch(linkUsers({ source: params.source, target: params.target }));
      }
    },
    [dispatch]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const droppedHobby = event.dataTransfer.getData('application/reactflow');
      // reactFlowInstance is not available here, so we find the node manually.
      // This logic finds the node element under the cursor.
      const targetNodeElement = (event.target as Element).closest(
        '.react-flow__node'
      );

      if (!droppedHobby || !targetNodeElement) {
        return;
      }

      const targetNodeId = targetNodeElement.getAttribute('data-id');
      if (!targetNodeId) return;

      const targetNode = nodes.find((n) => n.id === targetNodeId);
      if (targetNode && !targetNode.data.hobbies.includes(droppedHobby)) {
        const updatedHobbies = [...targetNode.data.hobbies, droppedHobby];
        dispatch(
          updateUserHobbies({ userId: targetNodeId, hobbies: updatedHobbies })
        );
      }
    },
    [dispatch, nodes]
  );

  const onNodesDelete = useCallback(
    (deletedNodes: Node[]) => {
      // Show a confirmation dialog
      const isConfirmed = window.confirm(
        `Are you sure you want to delete ${deletedNodes.length} user(s)? This cannot be undone.`
      );

      if (isConfirmed) {
        deletedNodes.forEach((node) => {
          dispatch(deleteUser(node.id));
        });
      }
    },
    [dispatch]
  );

  const onEdgesDelete = useCallback(
    (deletedEdges: Edge[]) => {
      deletedEdges.forEach((edge) => {
        dispatch(unlinkUsers({ source: edge.source, target: edge.target }));
      });
    },
    [dispatch]
  );

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      const newNodes = applyNodeChanges(changes, nodes);
      dispatch(nodesChanged(newNodes));

      changes.forEach((change) => {
        if (change.type === 'position' && change.dragging === false) {
          const node = newNodes.find((n) => n.id === change.id);
          if (node?.position) {
            dispatch(
              updateUserPosition({ id: change.id, position: node.position })
            );
          }
        }
      });
    },
    [dispatch, nodes]
  );

  const onNodeClick = useCallback(
    (_: any, node: Node) => {
      dispatch(setSelectedNodeId(node.id));
    },
    [dispatch]
  );

  if (status === 'loading' && nodes.length === 0) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{ height: '100vh', width: '100vw' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onConnect={handleConnect}
        onNodesDelete={onNodesDelete}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onEdgesDelete={onEdgesDelete}
        onNodeClick={onNodeClick}
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