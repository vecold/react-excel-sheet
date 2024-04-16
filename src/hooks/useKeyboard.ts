import { useCallback, useEffect } from 'react';
import {
  A_KEY,
  BACKSPACE_KEY,
  C_KEY,
  DELETE_KEY,
  DOWN_KEY,
  ENTER_KEY,
  ESCAPE_KEY,
  F_KEY,
  LEFT_KEY,
  RIGHT_KEY,
  TAB_KEY,
  UP_KEY,
  V_KEY,
  X_KEY,
  Z_KEY,
} from '../core/config';
import { isInputKey } from '../core/util';

type KeyOrClipBoardEvent = (
  event: KeyboardEvent | ClipboardEvent,
  value?: any,
) => void;
type KeyboardHandler = {
  move: KeyOrClipBoardEvent;
  escape: KeyOrClipBoardEvent;
  selectAll: KeyOrClipBoardEvent;
  delete: KeyOrClipBoardEvent;
  enter: KeyOrClipBoardEvent;
  otherInput: KeyOrClipBoardEvent;
  copy: KeyOrClipBoardEvent;
  paste: KeyOrClipBoardEvent;
  reverse: KeyOrClipBoardEvent;
  cut: KeyOrClipBoardEvent;
  search: KeyOrClipBoardEvent;
};

const ua = window.navigator.userAgent;
const isIE = /MSIE|Trident/.test(ua);

export function move(keyCode: number, isShiftKey: boolean) {
  if (keyCode === TAB_KEY) {
    return { row: 0, col: isShiftKey ? -1 : 1 };
  } else if (keyCode === RIGHT_KEY) {
    return { row: 0, col: 1 };
  } else if (keyCode === LEFT_KEY) {
    return { row: 0, col: -1 };
  } else if (keyCode === UP_KEY) {
    return { row: -1, col: 0 };
  } else if (keyCode === DOWN_KEY) {
    return { row: 1, col: 0 };
  } else if (keyCode === ENTER_KEY) {
    return { row: isShiftKey ? -1 : 1, col: 0 };
  }
}

export const useKeyBoard = (
  handler: KeyboardHandler,
  listenElement: HTMLSpanElement | null,
) => {
  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.defaultPrevented) {
        return;
      }
      const { ctrlKey, metaKey, keyCode, shiftKey } = e;

      const ctrlKeyPressed = ctrlKey || metaKey;

      const isEscape = keyCode === ESCAPE_KEY;

      if (isEscape) {
        handler.escape(e);
        return;
      }

      const isSearch = ctrlKeyPressed && keyCode === F_KEY;
      if (isSearch) {
        handler.search(e);
        return;
      }

      const isReverse = ctrlKeyPressed && keyCode === Z_KEY;
      if (isReverse) {
        handler.reverse(e);
        return;
      }
      const isSelectAll = ctrlKeyPressed && keyCode === A_KEY;
      if (isSelectAll) {
        handler.selectAll(e);
        return;
      }
      const isCopy = ctrlKeyPressed && keyCode === C_KEY;
      if (isCopy && isIE) {
        handler.copy(e);
        return;
      }

      const isCut = ctrlKeyPressed && keyCode === X_KEY;
      if (isCut && isIE) {
        handler.copy(e);
        return;
      }

      const isPaste = ctrlKeyPressed && keyCode === V_KEY;
      if (isPaste && isIE) {
        handler.paste(e);
        return;
      }

      const isDelete = keyCode === DELETE_KEY || keyCode === BACKSPACE_KEY;
      if (isDelete) {
        handler.delete(e);
        return;
      }

      const isEnter = keyCode === ENTER_KEY;
      if (isEnter && !shiftKey) {
        handler.enter(e);
        return;
      }
      if (ctrlKeyPressed) {
        return;
      }

      const isValueInput = isInputKey(keyCode);
      if (isValueInput) {
        handler.otherInput(e, e.key);
        return false;
      }
      const moveInfo = move(keyCode, shiftKey);
      moveInfo && handler.move(e, moveInfo);
    },
    [handler],
  );

  useEffect(() => {
    if (!listenElement) return;

    listenElement.addEventListener('keydown', handleKey);

    document.addEventListener('copy', handler.copy as any);
    document.addEventListener('paste', handler.paste as any);
    document.addEventListener('cut', handler.cut as any);
    return () => {
      listenElement.removeEventListener('keydown', handleKey);
      document.removeEventListener('copy', handler.copy as any);
      document.removeEventListener('paste', handler.paste as any);
      document.removeEventListener('cut', handler.cut as any);
    };
  }, [listenElement]);
};
