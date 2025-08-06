import { create } from 'zustand';

type LogType = 'info' | 'success' | 'error';

interface Log {
  timestamp: string;
  message: string;
  type: LogType;
}

interface LogState {
  logs: Log[];
  addLog: (message: string, type: LogType) => void;
}

export const useLogStore = create<LogState>((set) => ({
  logs: [],
  addLog: (message, type) => {
    const newLog: Log = {
      timestamp: new Date().toLocaleTimeString(),
      message,
      type,
    };
    set((state) => ({ logs: [...state.logs, newLog] }));
  },
})); 