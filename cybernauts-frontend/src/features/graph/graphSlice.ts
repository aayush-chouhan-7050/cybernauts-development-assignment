// src/features/graph/graphSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import apiClient from '../../services/api';
import { toast } from 'react-toastify';

// Define types for nodes and edges
interface NodeData {
  label: string;
  age: number;
  hobbies: string[];
  popularityScore: number;
}
interface Node {
  id: string;
  data: NodeData;
  position: { x: number; y: number };
}
interface Edge {
  id: string;
  source: string;
  target: string;
}
interface GraphState {
  nodes: Node[];
  edges: Edge[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}
const initialState: GraphState = {
  nodes: [],
  edges: [],
  status: 'idle',
  error: null,
};

// Async thunk to fetch graph data from the backend
export const fetchGraphData = createAsyncThunk('graph/fetchData', async () => {
  const response = await apiClient.get('/graph'); // Calls GET /api/graph
  return response.data;
});

export const createUser = createAsyncThunk(
  'graph/createUser',
  async (userData: { username: string; age: number; hobbies: string[] }, { dispatch }) => {
    await apiClient.post('/users', userData);
    dispatch(fetchGraphData()); // Refetch data after creation
  }
);

export const linkUsers = createAsyncThunk(
  'graph/linkUsers',
  async ({ source, target }: { source: string; target: string }, { dispatch }) => {
    await apiClient.post(`/users/${source}/link`, { friendId: target });
    dispatch(fetchGraphData()); // Refetch data after linking
  }
);

export const unlinkUsers = createAsyncThunk(
  'graph/unlinkUsers',
  async ({ source, target }: { source: string; target: string }, { dispatch }) => {
    try {
      // Call the unlink endpoint for the source user
      await apiClient.delete(`/users/${source}/unlink`, { data: { friendId: target } });
      dispatch(fetchGraphData()); // Refetch to update graph
      toast.warn("Users unlinked!");
    } catch (error) {
      toast.error("Failed to unlink users.");
      throw error;
    }
  }
);

export const updateUserHobbies = createAsyncThunk(
  'graph/updateHobbies',
  async ({ userId, hobbies }: { userId: string; hobbies: string[] }, { dispatch }) => {
    // We use a PUT request to update the user's data
    await apiClient.put(`/users/${userId}`, { hobbies });
    dispatch(fetchGraphData()); // Refetch all data to get updated scores
  }
);

export const deleteUser = createAsyncThunk(
  'graph/deleteUser',
  async (userId: string, { dispatch }) => {
    try {
      await apiClient.delete(`/users/${userId}`);
      dispatch(fetchGraphData()); // Refetch to remove the node
      toast.success("User deleted successfully!");
    } catch (error: any) {
      // The backend sends a 409 error with a specific message
      if (error.response && error.response.status === 409) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Failed to delete user.");
      }
      // We throw the error to prevent the promise from being fulfilled
      throw error;
    }
  }
);

const graphSlice = createSlice({
  name: 'graph',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchGraphData.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchGraphData.fulfilled, (state, action: PayloadAction<{ nodes: Node[], edges: Edge[] }>) => {
        state.status = 'succeeded';
        state.nodes = action.payload.nodes;
        state.edges = action.payload.edges;
      })
      .addCase(fetchGraphData.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch data';
      })
      .addCase(createUser.fulfilled, () => {
        toast.success("User created successfully!");
      })
      .addCase(createUser.rejected, () => {
        toast.error("Failed to create user.");
      })
      .addCase(linkUsers.fulfilled, () => {
        toast.success("Users linked!");
      })
      .addCase(linkUsers.rejected, () => {
        toast.error("Failed to link users.");
      })
      .addCase(updateUserHobbies.fulfilled, () => {
      toast.info("Hobbies updated, scores recalculated!");
      })
      .addCase(updateUserHobbies.rejected, () => {
        toast.error("Failed to update hobbies.");
      });
  },
});

export default graphSlice.reducer;