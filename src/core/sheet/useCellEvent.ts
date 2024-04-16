import { Dispatch } from '@zhenliang/sheet/hooks/useMiddlewareReducer';
import type { SheetType } from '@zhenliang/sheet/type';
import { useEffect } from 'react';
import { sideEffectReducer } from '../reducers';

export const useCellEvent = (
  dispatch: Dispatch,
  listenerVar?: Partial<SheetType.UpdateStateType>,
) => {
  const { start, end, lastSelected, editing, lastEditing } = listenerVar || {};

  useEffect(() => {
    dispatch(sideEffectReducer.init);
    return () => {
      dispatch(sideEffectReducer.destroy);
    };
  }, []);
  useEffect(() => {
    dispatch(sideEffectReducer.emitSelectChange);
  }, [start, end, lastSelected]);

  useEffect(() => {
    dispatch(sideEffectReducer.emitEditChange);
  }, [editing, lastEditing]);
};
