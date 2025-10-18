// src/app/store.ts
import { configureStore } from '@reduxjs/toolkit';
import graphReducer from '../features/graph/graphSlice';
import undoable from 'redux-undo';

export const store = configureStore({
  reducer: {
    graph: undoable(graphReducer),
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;