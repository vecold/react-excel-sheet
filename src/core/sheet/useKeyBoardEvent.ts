import { useKeyBoard } from '@zhenliang/sheet';
import { Dispatch } from '@zhenliang/sheet/hooks/useMiddlewareReducer';
import type { SheetType } from '@zhenliang/sheet/type';
import { sideEffectReducer } from '../reducers/sideEffectReducer';
import { getRowHeight } from '../util';

export const useKeyBoardEvent = (
  dispatch: Dispatch,
  elementRef: React.RefObject<SheetType.refAssertion>,
) => {
  useKeyBoard(
    {
      move: (e, value: any) => {
        e.preventDefault();
        dispatch({ type: 'move', payload: value });
        // todo 横向滚动的处理
        const { row } = value as SheetType.CellPosition;
        if (Math.abs(row) !== 0) {
          const rowHeight = getRowHeight(elementRef.current as HTMLSpanElement);
          const itemHeight = rowHeight || 30;
          elementRef?.current?.scrollBy({ top: itemHeight * row });
        }
      },
      selectAll: (e) => {
        e.preventDefault();
        dispatch({ type: 'selectAll' })

      },
      escape: () => {
        dispatch({ type: 'escape' });
      },
      reverse: () => {
        dispatch(sideEffectReducer.reverse);
      },
      delete: () => {
        dispatch(sideEffectReducer.delete);
      },
      enter: () => {
        dispatch({ type: 'enter' });
      },
      otherInput: (e, value: string) => {
        dispatch((d: any, getState: () => SheetType.UpdateStateType) => {
          const { editing } = getState();
          if (editing) {
            return;
          } else {
            e.preventDefault();
            dispatch({ type: 'otherInput', payload: value });
          }
        });
      },
      copy: () => {
        dispatch(sideEffectReducer.copy);
      },
      paste: () => {
        dispatch(sideEffectReducer.paste);
      },
      cut: () => {
        dispatch(sideEffectReducer.copy);
        dispatch(sideEffectReducer.delete);
      },
      search: (e) => {
        e.preventDefault()
        dispatch({ type: 'openSearch' })
      }
    },
    elementRef.current,
  );
};
