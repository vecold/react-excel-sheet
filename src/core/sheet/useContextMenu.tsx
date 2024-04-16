import { Dispatch, useSetState } from '@zhenliang/sheet';
import type { SheetType } from '@zhenliang/sheet/type';
import { useEffect } from 'react';
import { calcMenuPosition, extractDataRowAndCol, findParentTd } from '../util';

export type MenuEvent = {
  showMenu: boolean;
  position: { top: number; left: number };
  cellPosition: SheetType.CellPosition;
};

export const useContextMenu = (
  dispatch: Dispatch,
  elementRef: React.RefObject<SheetType.refAssertion>,
  enableContextMenu: boolean = false,
  contextMenuRef: React.RefObject<HTMLDivElement>,
) => {
  const [menuEvent, setMenuEvent] = useSetState({
    showMenu: false,
    position: { top: 0, left: 0 },
    cellPosition: { row: 0, col: 0 },
  });

  const handleContextMenu = (e: MouseEvent) => {
    e.preventDefault();
    const currentCell = findParentTd(e.target as HTMLElement) as HTMLElement;
    if (!currentCell) return;
    const currentPos = extractDataRowAndCol(currentCell);
    dispatch({
      type: 'mouseDown',
      payload: { pos: currentPos, shiftKey: e.shiftKey },
    });
    const { top, left } = calcMenuPosition({
      tableElement: elementRef.current,
      menuElement: contextMenuRef.current?.firstElementChild,
      x: e.clientX,
      y: e.clientY,
    });
    setMenuEvent({
      showMenu: true,
      position: { top, left },
      cellPosition: currentPos,
    });
  };

  useEffect(() => {
    if (!elementRef.current || !enableContextMenu) return;
    // 添加统一规范
    contextMenuRef.current?.firstElementChild?.setAttribute(
      'style',
      'z-index: 5;word-break: keep-all;',
    );
    const handleClose = () => {
      setMenuEvent({ showMenu: false });
    };
    elementRef.current.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('click', handleClose);
    document.addEventListener(
      'scroll',
      () => {
        setMenuEvent({ showMenu: false });
      },
      true,
    );
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('click', handleClose);
    };
  }, [elementRef.current, enableContextMenu]);

  return {
    ...menuEvent,
  };
};
