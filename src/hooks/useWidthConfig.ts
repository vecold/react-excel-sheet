import { createContext, useContext } from 'react';
import { WidthConfigContext } from '../type/sheet';

export const WidthContext = createContext<WidthConfigContext>({});

export function useWidth() {
  return useContext(WidthContext)!;
}
