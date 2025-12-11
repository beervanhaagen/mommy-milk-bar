// state/drinksReducer.ts - Drink session management
import { DrinkState, DrinkSession, DrinkEntry } from '../types/drinks';
import uuid from 'react-native-uuid';

export type Action =
  | { type: 'START_SESSION' }
  | { type: 'END_SESSION' }
  | { type: 'ADD_ENTRY'; payload: Omit<DrinkEntry, 'id'|'ts'> & { ts?: number } }
  | { type: 'UNDO_LAST' }
  | { type: 'DELETE_ENTRY'; payload: { id: string } };

export const initialState: DrinkState = { sessions: {} };

export function drinksReducer(state: DrinkState, action: Action): DrinkState {
  switch (action.type) {
    case 'START_SESSION': {
      const id = uuid.v4() as string;
      return {
        ...state,
        activeSessionId: id,
        sessions: { ...state.sessions, [id]: { id, startedAt: Date.now(), entries: [] } },
      };
    }
    case 'END_SESSION': {
      const id = state.activeSessionId;
      if (!id) return state;
      return {
        ...state,
        activeSessionId: undefined,
        sessions: { ...state.sessions, [id]: { ...state.sessions[id], endedAt: Date.now() } },
      };
    }
    case 'ADD_ENTRY': {
      const id = state.activeSessionId ?? uuid.v4() as string;
      const session: DrinkSession =
        state.sessions[id] ?? { id, startedAt: Date.now(), entries: [] };
      const entry: DrinkEntry = { id: uuid.v4() as string, ts: action.payload.ts ?? Date.now(), ...action.payload };
      return {
        ...state,
        activeSessionId: id,
        sessions: { ...state.sessions, [id]: { ...session, entries: [entry, ...session.entries] } },
      };
    }
    case 'UNDO_LAST': {
      const id = state.activeSessionId;
      if (!id) return state;
      const [, ...rest] = state.sessions[id].entries; // entries are desc sorted
      return { ...state, sessions: { ...state.sessions, [id]: { ...state.sessions[id], entries: rest } } };
    }
    case 'DELETE_ENTRY': {
      const id = state.activeSessionId;
      if (!id) return state;
      const rest = state.sessions[id].entries.filter(e => e.id !== action.payload.id);
      return { ...state, sessions: { ...state.sessions, [id]: { ...state.sessions[id], entries: rest } } };
    }
    default:
      return state;
  }
}
