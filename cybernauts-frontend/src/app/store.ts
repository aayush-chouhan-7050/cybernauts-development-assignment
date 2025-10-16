// src/app/store.ts
import { configureStore } from '@reduxjs/toolkit';
import graphReducer from '../features/graph/graphSlice';

export const store = configureStore({
  reducer: {
    graph: graphReducer,
  },
});

// Define RootState and AppDispatch types for TypeScript
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;