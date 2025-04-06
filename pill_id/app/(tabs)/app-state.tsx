import React, { createContext, useContext, useState } from 'react';

const AppStateContext = createContext<any>(null);

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [hasStarted, setHasStarted] = useState(false);

  return (
    <AppStateContext.Provider value={{ hasStarted, setHasStarted }}>
      {children}
    </AppStateContext.Provider>
  );
}

export const useAppState = () => useContext(AppStateContext);
