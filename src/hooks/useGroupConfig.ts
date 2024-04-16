import { createContext, useContext } from 'react';
import { GroupConfigContext } from '../type/sheet';

export const GroupContext = createContext<GroupConfigContext>({});

export function useGroup() {
  return useContext(GroupContext)!;
}
