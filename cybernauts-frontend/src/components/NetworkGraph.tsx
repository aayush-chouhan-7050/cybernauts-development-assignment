// src/components/NetworkGraph.tsx
import { useEffect, useCallback, useState, useRef } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  applyNodeChanges,
  Panel,
} from 'reactflow';
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
  loadMoreGraphData,
  toggleLazyLoad,
} from '../features/graph/graphSlice';
import HighScoreNode from './nodes/HighScoreNode';
import LowScoreNode from './nodes/LowScoreNode';
import './NetworkGraph.css';

const nodeTypes = {
  highScoreNode: HighScoreNode,
  lowScoreNode: LowScoreNode,
};

const NetworkGraph = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { nodes, edges, status, pagination, isLazyLoadEnabled } = useSelector(
    (state: RootState) => state.graph.present
  );
  
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const viewportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchGraphData({ page: 1, limit: 100 }));
    }
  }, [status, dispatch]);

  // Infinite scroll handler
  useEffect(() => {
    if (!isLazyLoadEnabled) return;

    const handleScroll = async () => {
      const viewport = viewportRef.current;
      if (!viewport || isLoadingMore || !pagination.hasMore) return;

      const { scrollTop, scrollHeight, clientHeight } = viewport;
      const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;

      // Load more when scrolled 80% down
      if (scrollPercentage > 0.8) {
        setIsLoadingMore(true);
        await dispatch(loadMoreGraphData());
        setIsLoadingMore(false);
      }
    };

    const viewport = viewportRef.current;
    if (viewport) {
      viewport.addEventListener('scroll', handleScroll);
      return () => viewport.removeEventListener('scroll', handleScroll);
    }
  }, [isLazyLoadEnabled, isLoadingMore, pagination.hasMore, dispatch]);

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

  const handleToggleLazyLoad = useCallback(() => {
    dispatch(toggleLazyLoad(!isLazyLoadEnabled));
  }, [dispatch, isLazyLoadEnabled]);

  const handleLoadMore = useCallback(async () => {
    if (!pagination.hasMore || isLoadingMore) return;
    setIsLoadingMore(true);
    await dispatch(loadMoreGraphData());
    setIsLoadingMore(false);
  }, [dispatch, pagination.hasMore, isLoadingMore]);

  if (status === 'loading' && nodes.length === 0) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading network graph...</p>
      </div>
    );
  }

  return (
    <div style={{ height: '100vh', width: '100vw' }} ref={viewportRef}>
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
        
        <Panel position="top-right" className="graph-controls-panel">
          <div className="graph-info">
            <strong>Users:</strong> {nodes.length} / {pagination.total}
            {pagination.hasMore && (
              <span className="more-indicator"> (+{pagination.total - nodes.length} more)</span>
            )}
          </div>
          
          <div className="lazy-load-toggle">
            <label>
              <input
                type="checkbox"
                checked={isLazyLoadEnabled}
                onChange={handleToggleLazyLoad}
              />
              <span>Lazy Loading</span>
            </label>
          </div>
          
          {isLazyLoadEnabled && pagination.hasMore && (
            <button 
              className="load-more-btn"
              onClick={handleLoadMore}
              disabled={isLoadingMore}
            >
              {isLoadingMore ? 'Loading...' : `Load More (${pagination.totalPages - pagination.page} pages)`}
            </button>
          )}
        </Panel>
        
        {isLoadingMore && (
          <Panel position="bottom-center">
            <div className="loading-indicator">
              <div className="small-spinner"></div>
              <span>Loading more users...</span>
            </div>
          </Panel>
        )}
      </ReactFlow>
    </div>
  );
};

export default NetworkGraph;