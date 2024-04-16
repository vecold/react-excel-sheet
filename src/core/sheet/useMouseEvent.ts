import { useMouse } from '@zhenliang/sheet';
import { Dispatch } from '@zhenliang/sheet/hooks/useMiddlewareReducer';
import type { SheetType } from '@zhenliang/sheet/type';
import { useCallback, useEffect, useRef } from 'react';
import { extractDataRowAndCol, findParentTd } from '../util';

const rowCount = 10; //每秒10行
const colCount = 5; //每秒5列

export const useMouseEvent = (
  dispatch: Dispatch,
  elementRef: React.RefObject<SheetType.refAssertion>,
) => {
  const animateRef = useRef<boolean>(false);
  // const animateScrollCalled = useRef<number>(0);
  const rowHeightRef = useRef<number>(40);
  const colWidthRef = useRef<number>(100);

  const resetInterval = useCallback(() => {
    if (animateRef.current) {
      animateRef.current = false;
      // animateScrollCalled.current -= 1;
    }
  }, []);

  const scrollTo = useCallback((type: 'bottom' | 'top' | 'left' | 'right') => {
    if (!elementRef.current) return;
    // 当前滚动高度
    const { scrollTop, scrollLeft, scrollHeight, scrollWidth } =
      elementRef.current || {};

    let destination = {
      y: scrollTop,
      x: scrollLeft,
    };

    let called = 0;
    let rowCalled = 0;
    let colCalled = 0;
    const step = () => {
      elementRef.current?.style.setProperty('scroll-behavior', 'auto');
      const position = {
        x: destination.x,
        y: destination.y,
      };
      if (type === 'bottom') {
        position.y = scrollHeight;
        if (Math.round((called / 60) * rowCount) - rowCalled > 1) {
          rowCalled++;
          dispatch({ type: 'rowMove', payload: 1 });
        }
      }
      if (type === 'right') {
        position.x = scrollWidth;

        if (Math.round((called / 60) * colCount) - colCalled > 1) {
          colCalled++;
          dispatch({ type: 'colMove', payload: 1 });
        }
      }
      if (type === 'left') {
        position.x = 0;

        if (Math.round((called / 60) * colCount) - colCalled > 1) {
          colCalled++;
          dispatch({ type: 'colMove', payload: -1 });
        }
      }
      if (type === 'top') {
        position.y = 0;

        if (Math.round((called / 60) * rowCount) - rowCalled > 1) {
          rowCalled++;
          dispatch({ type: 'rowMove', payload: -1 });
        }
      }

      // 距离目标滚动距离
      let distance = {
        x: position.x - destination.x,
        // x: 0,
        y: position.y - destination.y,
      };
      // 目标滚动位置
      destination = {
        x:
          destination.x +
          (distance.x !== 0
            ? (distance.x * colWidthRef.current * colCount) /
            60 /
            Math.abs(distance.x)
            : 0),
        // x: 0,
        y:
          destination.y +
          (distance.y !== 0
            ? (distance.y * rowHeightRef.current * rowCount) /
            60 /
            Math.abs(distance.y)
            : 0),
      };
      if (!animateRef.current) return;
      if (Math.abs(distance.x) + Math.abs(distance.y) < 2) {
        elementRef.current?.scrollTo(destination.x, destination.y);
        resetInterval();
      } else {
        elementRef.current?.scrollTo(destination.x, destination.y);
        requestAnimationFrame(step);
        called++;
      }
    };
    step();
  }, []);
  const mouseDown = useCallback((e: MouseEvent) => {
    if (e.button !== 0) return;
    e.preventDefault();
    if (!elementRef.current?.contains(e.target)) {
      dispatch({ type: 'loseFocus' });
    }
    const currentCell = findParentTd(e.target as HTMLElement) as HTMLElement;
    if (!currentCell) {
      return;
    }
    const currentPos = extractDataRowAndCol(currentCell);
    dispatch({
      type: 'mouseDown',
      payload: { pos: currentPos, shiftKey: e.shiftKey },
    });
  }, []);

  const mouseOver = useCallback((e: MouseEvent) => {
    e.preventDefault();

    if (!elementRef.current?.contains(e.target)) return;

    const currentCell = findParentTd(e.target as HTMLElement) as HTMLElement;
    if (!currentCell || currentCell.classList.contains('fixed')) return;

    elementRef.current?.style.setProperty('scroll-behavior', 'smooth');

    const currentPos = extractDataRowAndCol(currentCell);
    dispatch({ type: 'mouseOver', payload: currentPos });

    dispatch((d: any, getState: () => SheetType.UpdateStateType) => {
      const { mouseDown } = getState();
      if (!mouseDown || !elementRef.current) return;

      const cellBounding = currentCell.getBoundingClientRect();
      const parentBounding = elementRef.current?.getBoundingClientRect();

      const { left, top, bottom, right } = cellBounding;
      const {
        left: parentLeft,
        top: parentTop,
        bottom: parentBottom,
        right: parentRight,
      } = parentBounding;

      let dBottom = bottom - parentBottom;
      let dTop = top - parentTop;
      let dLeft = left - parentLeft;
      let dRight = right - parentRight;

      const cellHeight = currentCell.clientHeight;
      const cellWidth = currentCell.clientWidth;
      rowHeightRef.current = cellHeight;
      colWidthRef.current = cellWidth;
      const isElementEdge =
        dBottom > -40 || dTop < 40 || dLeft < 40 || dRight > -40;
      if (isElementEdge) {
        if (animateRef.current === true) return;
        animateRef.current = true;
        // animateScrollCalled.current += 1;
      } else {
        resetInterval();
      }

      if (dBottom > -40) {
        scrollTo('bottom');
        // elementRef.current.scrollTop += cellHeight;
      }
      if (dTop < 40) {
        scrollTo('top');
        // elementRef.current.scrollTop -= cellHeight;
      }
      if (dLeft < 40) {
        scrollTo('left');
        // elementRef.current.scrollLeft -= cellWidth;
      }
      if (dRight > -40) {
        scrollTo('right');
        // elementRef.current.scrollLeft += cellWidth;
      }
    });
  }, []);

  const mouseUp = useCallback((e: MouseEvent) => {
    e.preventDefault();

    resetInterval();
    const currentCell = findParentTd(e.target as HTMLElement) as HTMLElement;
    if (!currentCell || currentCell.classList.contains('fixed')) {
      dispatch({ type: 'changes', payload: { mouseDown: false } });
      return;
    }
    const currentPos = extractDataRowAndCol(currentCell);
    dispatch({ type: 'mouseUp', payload: currentPos });
  }, []);

  const mouseLeave = useCallback((e: MouseEvent) => {
    dispatch((d: any, getState: () => SheetType.UpdateStateType) => {
      const { mouseDown } = getState();
      if (mouseDown && elementRef.current) {
        const parentBounding = elementRef.current?.getBoundingClientRect();
        const { left, top, right, bottom } = parentBounding;
        const { x, y } = e;
        resetInterval();

        if (animateRef.current === true) return;
        animateRef.current = true;

        // animateScrollCalled.current += 1;
        if (y > bottom) {
          scrollTo('bottom');
        }
        if (y < top) {
          scrollTo('top');
        }
        if (x < left) {
          scrollTo('left');
        }
        if (x > right) {
          scrollTo('right');
        }
      } else {
        mouseDown &&
          dispatch({ type: 'changes', payload: { mouseDown: false } });
      }
    });
  }, []);

  const doubleClick = useCallback((e: MouseEvent) => {
    if (!elementRef.current?.contains(e.target)) {
      return;
    }
    e.preventDefault();
    const currentCell = findParentTd(e.target as HTMLElement) as HTMLElement;
    if (
      !currentCell?.classList ||
      currentCell.classList.contains('read-only')
    ) {
      // 只读
      return;
    }
    const currentPos = extractDataRowAndCol(currentCell);
    dispatch({ type: 'doubleClick', payload: currentPos });
  }, []);
  const loseFocus = useCallback((e: MouseEvent) => {
    const isSearch = elementRef.current?.parentElement?.nextSibling?.contains(e.target as HTMLElement)
    const isTableAControl = elementRef.current?.parentElement?.contains(e.target as HTMLElement)
    if (!(isTableAControl || isSearch)) {
      dispatch({ type: 'loseFocus' });
      return;
    }
    // e.preventDefault();
    const currentCell = findParentTd(e.target as HTMLElement) as HTMLElement;
    if (
      !currentCell?.classList ||
      currentCell.classList.contains('read-only')
    ) {
      // 只读
      return;
    }
    const currentPos = extractDataRowAndCol(currentCell);
    dispatch({ type: 'doubleClick', payload: currentPos });
  }, []);

  useEffect(() => {
    if (elementRef.current) {
      if (navigator.appVersion.indexOf("Mac") !== -1) {
        elementRef.current.style.setProperty('--arrow-down', 'var(--arrow-mac-down)')
        elementRef.current.style.setProperty('--arrow-right', 'var(--arrow-mac-right)')
      }
    }

  }, [])

  useMouse(
    {
      mouseDown,
      mouseOver,
      mouseUp,
      mouseLeave,
      mouseEnter: resetInterval,
      doubleClick,
      loseFocus,
    },
    elementRef.current,
  );
};
