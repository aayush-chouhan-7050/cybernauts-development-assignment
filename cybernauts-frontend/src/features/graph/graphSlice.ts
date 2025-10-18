// src/features/graph/graphSlice.ts - Add lazy loading support
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Node, Edge } from 'reactflow';
import apiClient from '../../services/api';
import { toast } from 'react-toastify';

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
}

interface GraphState {
  nodes: Node[];
  edges: Edge[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  selectedNodeId: string | null;
  pagination: Pagination;
  isLazyLoadEnabled: boolean;
  loadedPages: number[]; // Changed from Set to Array for Redux serialization
}

const initialState: GraphState = {
  nodes: [],
  edges: [],
  status: 'idle',
  error: null,
  selectedNodeId: null,
  pagination: {
    page: 1,
    limit: 100,
    total: 0,
    totalPages: 0,
    hasMore: false
  },
  isLazyLoadEnabled: false,
  loadedPages: [1] // Changed from Set to Array
};

// Fetch graph data with pagination support
export const fetchGraphData = createAsyncThunk(
  'graph/fetchData',
  async (params?: { page?: number; limit?: number; append?: boolean }) => {
    const page = params?.page || 1;
    const limit = params?.limit || 100;
    
    const response = await apiClient.get('/graph', {
      params: { page, limit, includeConnections: true }
    });
    
    return {
      ...response.data,
      append: params?.append || false,
      page
    };
  }
);

// NEW: Load more graph data (pagination)
export const loadMoreGraphData = createAsyncThunk(
  'graph/loadMore',
  async (_, { getState }) => {
    const state = getState() as { graph: { present: GraphState } };
    const { pagination, loadedPages } = state.graph.present;
    
    const nextPage = pagination.page + 1;
    
    // Check if page already loaded using Array.includes instead of Set.has
    if (loadedPages.includes(nextPage) || !pagination.hasMore) {
      return null;
    }
    
    const response = await apiClient.get('/graph', {
      params: { 
        page: nextPage, 
        limit: pagination.limit,
        includeConnections: true 
      }
    });
    
    return {
      ...response.data,
      page: nextPage
    };
  }
);

// NEW: Toggle lazy loading mode
export const toggleLazyLoad = createAsyncThunk(
  'graph/toggleLazyLoad',
  async (enable: boolean, { dispatch }) => {
    if (enable) {
      // Load first page with smaller batch
      await dispatch(fetchGraphData({ page: 1, limit: 50 }));
    } else {
      // Load all data
      await dispatch(fetchGraphData({ page: 1, limit: 1000 }));
    }
    return enable;
  }
);

export const createUser = createAsyncThunk(
  'graph/createUser',
  async (
    userData: { username: string; age: number; hobbies: string[] },
    { dispatch, getState }
  ) => {
    await apiClient.post('/users', userData);
    const state = getState() as { graph: { present: GraphState } };
    
    // Reload current page after creation
    dispatch(fetchGraphData({ 
      page: state.graph.present.pagination.page,
      limit: state.graph.present.pagination.limit 
    }));
  }
);

export const updateUser = createAsyncThunk(
  'graph/updateUser',
  async (
    {
      id,
      ...userData
    }: { id: string; username?: string; age?: number; hobbies?: string[] },
    { dispatch, getState }
  ) => {
    await apiClient.put(`/users/${id}`, userData);
    const state = getState() as { graph: { present: GraphState } };
    
    dispatch(fetchGraphData({ 
      page: state.graph.present.pagination.page,
      limit: state.graph.present.pagination.limit 
    }));
  }
);

export const linkUsers = createAsyncThunk(
  'graph/linkUsers',
  async (
    { source, target }: { source: string; target: string },
    { dispatch, getState }
  ) => {
    await apiClient.post(`/users/${source}/link`, { friendId: target });
    const state = getState() as { graph: { present: GraphState } };
    
    dispatch(fetchGraphData({ 
      page: state.graph.present.pagination.page,
      limit: state.graph.present.pagination.limit 
    }));
  }
);

export const unlinkUsers = createAsyncThunk(
  'graph/unlinkUsers',
  async (
    { source, target }: { source: string; target: string },
    { dispatch, getState }
  ) => {
    try {
      await apiClient.delete(`/users/${source}/unlink`, {
        data: { friendId: target },
      });
      
      const state = getState() as { graph: { present: GraphState } };
      dispatch(fetchGraphData({ 
        page: state.graph.present.pagination.page,
        limit: state.graph.present.pagination.limit 
      }));
      
      toast.warn('Users unlinked!');
    } catch (error) {
      toast.error('Failed to unlink users.');
      throw error;
    }
  }
);

export const updateUserHobbies = createAsyncThunk(
  'graph/updateHobbies',
  async (
    { userId, hobbies }: { userId: string; hobbies: string[] },
    { dispatch, getState }
  ) => {
    await apiClient.put(`/users/${userId}`, { hobbies });
    const state = getState() as { graph: { present: GraphState } };
    
    dispatch(fetchGraphData({ 
      page: state.graph.present.pagination.page,
      limit: state.graph.present.pagination.limit 
    }));
  }
);

export const updateUserPosition = createAsyncThunk(
  'graph/updateUserPosition',
  async ({ id, position }: { id: string; position: { x: number; y: number } }) => {
    await apiClient.put(`/users/${id}`, { position });
  }
);

export const deleteUser = createAsyncThunk(
  'graph/deleteUser',
  async (userId: string, { dispatch, getState }) => {
    try {
      await apiClient.delete(`/users/${userId}`);
      
      const state = getState() as { graph: { present: GraphState } };
      dispatch(fetchGraphData({ 
        page: state.graph.present.pagination.page,
        limit: state.graph.present.pagination.limit 
      }));
      
      toast.success('User deleted successfully!');
    } catch (error: any) {
      if (error.response && error.response.status === 409) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Failed to delete user.');
      }
      throw error;
    }
  }
);

const graphSlice = createSlice({
  name: 'graph',
  initialState,
  reducers: {
    nodesChanged(state, action: PayloadAction<Node[]>) {
      state.nodes = action.payload;
    },
    setSelectedNodeId(state, action: PayloadAction<string | null>) {
      state.selectedNodeId = action.payload;
    },
    setLazyLoadEnabled(state, action: PayloadAction<boolean>) {
      state.isLazyLoadEnabled = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchGraphData.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(
        fetchGraphData.fulfilled,
        (state, action) => {
          state.status = 'succeeded';
          
          if (action.payload.append) {
            // Append nodes and edges for pagination
            const existingNodeIds = new Set(state.nodes.map(n => n.id));
            const newNodes = action.payload.nodes.filter(
              (n: Node) => !existingNodeIds.has(n.id)
            );
            
            state.nodes = [...state.nodes, ...newNodes];
            
            const existingEdgeIds = new Set(state.edges.map(e => e.id));
            const newEdges = action.payload.edges.filter(
              (e: Edge) => !existingEdgeIds.has(e.id)
            );
            
            state.edges = [...state.edges, ...newEdges];
          } else {
            // Replace all data
            state.nodes = action.payload.nodes;
            state.edges = action.payload.edges;
          }
          
          if (action.payload.pagination) {
            state.pagination = action.payload.pagination;
          }
          
          // Add page to loaded pages array if not already present
          if (!state.loadedPages.includes(action.payload.page)) {
            state.loadedPages = [...state.loadedPages, action.payload.page];
          }
        }
      )
      .addCase(fetchGraphData.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch data';
      })
      .addCase(loadMoreGraphData.fulfilled, (state, action) => {
        if (action.payload) {
          const existingNodeIds = new Set(state.nodes.map(n => n.id));
          const newNodes = action.payload.nodes.filter(
            (n: Node) => !existingNodeIds.has(n.id)
          );
          
          state.nodes = [...state.nodes, ...newNodes];
          
          const existingEdgeIds = new Set(state.edges.map(e => e.id));
          const newEdges = action.payload.edges.filter(
            (e: Edge) => !existingEdgeIds.has(e.id)
          );
          
          state.edges = [...state.edges, ...newEdges];
          state.pagination = action.payload.pagination;
          
          // Add page to loaded pages array if not already present
          if (!state.loadedPages.includes(action.payload.page)) {
            state.loadedPages = [...state.loadedPages, action.payload.page];
          }
          
          toast.info(`Loaded ${newNodes.length} more users`);
        }
      })
      .addCase(toggleLazyLoad.fulfilled, (state, action) => {
        state.isLazyLoadEnabled = action.payload;
        state.loadedPages = [1]; // Reset to array with just page 1
      })
      .addCase(createUser.fulfilled, () => {
        toast.success('User created successfully!');
      })
      .addCase(createUser.rejected, () => {
        toast.error('Failed to create user.');
      })
      .addCase(updateUser.fulfilled, () => {
        toast.success('User updated successfully!');
      })
      .addCase(updateUser.rejected, () => {
        toast.error('Failed to update user.');
      })
      .addCase(linkUsers.fulfilled, () => {
        toast.success('Users linked!');
      })
      .addCase(linkUsers.rejected, () => {
        toast.error('Failed to link users.');
      })
      .addCase(updateUserHobbies.fulfilled, () => {
        toast.info('Hobbies updated, scores recalculated!');
      })
      .addCase(updateUserHobbies.rejected, () => {
        toast.error('Failed to update hobbies.');
      });
  },
});

export const { nodesChanged, setSelectedNodeId, setLazyLoadEnabled } = graphSlice.actions;

export default graphSlice.reducer;