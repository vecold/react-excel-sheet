import Events from 'events';
import { createContext, useContext } from 'react';

export const SheetEventContext = createContext<Events | undefined>(undefined);

export function useSheetEvent() {
  return useContext(SheetEventContext)!;
}
