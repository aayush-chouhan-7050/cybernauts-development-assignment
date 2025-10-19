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
import { toast } from 'react-toastify';
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
  const [selectedEdgeIds, setSelectedEdgeIds] = useState<string[]>([]);
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

  // Custom keyboard handler for node and edge deletion
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Backspace' || event.key === 'Delete') {
        const selectedNodes = nodes.filter(node => node.selected);
        
        console.log('Selected nodes:', selectedNodes.length);
        console.log('Selected edge IDs:', selectedEdgeIds.length);
        
        // Handle edge deletion first (using our tracked selected edges)
        if (selectedEdgeIds.length > 0) {
          event.preventDefault();
          event.stopPropagation();
          
          const isConfirmed = window.confirm(
            `Are you sure you want to unlink ${selectedEdgeIds.length} friendship(s)?`
          );

          if (isConfirmed) {
            selectedEdgeIds.forEach((edgeId) => {
              const edge = edges.find(e => e.id === edgeId);
              if (edge) {
                dispatch(unlinkUsers({ source: edge.source, target: edge.target }));
              }
            });
            // Clear selected edges after deletion
            setSelectedEdgeIds([]);
          }
          return; // Don't process nodes if edges were selected
        }
        
        // Handle node deletion (if nodes are selected)
        if (selectedNodes.length > 0) {
          event.preventDefault();
          event.stopPropagation();
          
          // Check if any selected node has friends (connected edges)
          const nodesWithFriends = selectedNodes.filter(node => {
            const connectedEdges = edges.filter(
              edge => edge.source === node.id || edge.target === node.id
            );
            return connectedEdges.length > 0;
          });

          // If any node has friends, show error and block deletion
          if (nodesWithFriends.length > 0) {
            const nodeNames = nodesWithFriends.map(n => n.data.label).join(', ');
            toast.error(
              `Cannot delete ${nodeNames}. User has active friendships. Unlink them first!`,
              { autoClose: 4000 }
            );
            return;
          }

          // Only show confirmation if user has NO friends
          const isConfirmed = window.confirm(
            `Are you sure you want to delete ${selectedNodes.length} user(s)? This cannot be undone.`
          );

          if (isConfirmed) {
            selectedNodes.forEach((node) => {
              dispatch(deleteUser(node.id));
            });
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown, true);
    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [nodes, edges, selectedEdgeIds, dispatch]);

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
    () => {
      // Disabled - handled by custom keyboard listener
    },
    []
  );

  const onEdgesDelete = useCallback(
    (deletedEdges: Edge[]) => {
      const isConfirmed = window.confirm(
        `Are you sure you want to unlink ${deletedEdges.length} friendship(s)?`
      );

      if (isConfirmed) {
        deletedEdges.forEach((edge) => {
          dispatch(unlinkUsers({ source: edge.source, target: edge.target }));
        });
      }
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

  const onEdgesChange = useCallback(
    (changes: any[]) => {
      // Track edge selection changes
      changes.forEach((change) => {
        if (change.type === 'select') {
          if (change.selected) {
            // Edge is being selected
            setSelectedEdgeIds(prev => {
              if (!prev.includes(change.id)) {
                return [...prev, change.id];
              }
              return prev;
            });
          } else {
            // Edge is being deselected
            setSelectedEdgeIds(prev => prev.filter(id => id !== change.id));
          }
        }
      });
    },
    []
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
        onEdgesChange={onEdgesChange}
        onConnect={handleConnect}
        onNodesDelete={onNodesDelete}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onEdgesDelete={onEdgesDelete}
        onNodeClick={onNodeClick}
        deleteKeyCode={null}
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