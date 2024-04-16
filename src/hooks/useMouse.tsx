import { debounce } from 'lodash';
import { useCallback, useEffect, useRef } from 'react';

type MouseHandler = {
  mouseUp: (value: MouseEvent) => void;
  mouseDown: (value: MouseEvent) => void;
  mouseOver: (value: MouseEvent) => void;
  mouseLeave: (value: MouseEvent) => void;
  mouseEnter: (value: MouseEvent) => void;
  doubleClick: (value: MouseEvent) => void;
  loseFocus: (value: MouseEvent) => void;
};

export const useMouse = (
  handler: MouseHandler,
  listenElement: HTMLSpanElement | null,
) => {
  const {
    mouseUp,
    mouseDown,
    mouseOver,
    mouseLeave,
    mouseEnter,
    doubleClick,
    loseFocus,
  } = handler;
  const handlerRef = useRef<MouseHandler | null>();

  // todo
  const wrapper = useCallback(
    (handle: (e: MouseEvent) => void) => {
      return (e: MouseEvent) => {
        if (!(listenElement as any).contains(e.target as HTMLElement)) {
          return;
        }
        handle(e);
      };
    },
    [listenElement],
  );

  useEffect(
    () => () => {
      if (!handlerRef.current) return;
      const {
        mouseUp: listenerMouseUp,
        mouseDown: listenerMouseDown,
        mouseOver: listenerMouseOver,
        mouseLeave: listenerMouseLeave,
        mouseEnter: listenerMouseEnter,
        doubleClick: listenerDoubleClick,
      } = handlerRef.current;
      document.removeEventListener('mouseup', listenerMouseUp);
      document.removeEventListener('mousedown', listenerMouseDown);
      document.removeEventListener('dblclick', listenerDoubleClick);
      listenElement?.removeEventListener('mouseover', listenerMouseOver);
      listenElement?.removeEventListener('mouseleave', listenerMouseLeave);
      listenElement?.removeEventListener('mouseenter', listenerMouseEnter);
    },
    [],
  );
  useEffect(() => {
    if (!listenElement) return;
    const debounceOver = debounce(mouseOver, 10);
    const wrappedMouseUp = mouseUp;
    const wrappedMouseDown = (e: MouseEvent) => {
      if (!listenElement?.contains(e.target as HTMLElement)) {
        loseFocus(e);
        return;
      }
      mouseDown(e);
    };
    const wrappedMouseDoubleClick = wrapper(doubleClick);
    handlerRef.current = {
      mouseUp: wrappedMouseUp,
      mouseDown: wrappedMouseDown,
      doubleClick: wrappedMouseDoubleClick,
      mouseOver: debounceOver,
      mouseLeave: mouseLeave,
      mouseEnter: mouseEnter,
      loseFocus,
    };

    document.addEventListener('mouseup', wrappedMouseUp);
    document.addEventListener('mousedown', wrappedMouseDown);
    document.addEventListener('dblclick', wrappedMouseDoubleClick);
    listenElement?.addEventListener('mouseover', debounceOver);
    listenElement?.addEventListener('mouseleave', mouseLeave);
    listenElement?.addEventListener('mouseenter', mouseEnter);
  }, [listenElement]);
};
