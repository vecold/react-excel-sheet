/* eslint-disable @typescript-eslint/no-unused-vars */
import { useGroup } from '@zhenliang/sheet/hooks/useGroupConfig';
import type { SheetType } from '@zhenliang/sheet/type';
import { throttle } from 'lodash';
import { useEffect, useState } from 'react';
import { getRowHeight } from '../util';

const extra = 20;

type VirtualConfig = {
  virtualStart: number;
  virtualEnd: number;
  paddingTop: number;
  paddingBottom: number;
};

// 虚拟列表
export const useVirtualList = (
  elementRef: React.RefObject<SheetType.refAssertion>,
  data: SheetType.Cell[][] = [],
  // groupConfig?: SheetType.RowGroupConfig,
  virtualized?: boolean,
) => {
  const [state, setState] = useState({
    virtualStart: 0,
    virtualEnd: virtualized
      ? Math.min(data.length - 1, 2 * extra)
      : data.length - 1,
    paddingTop: 0,
    paddingBottom: 0,
  });

  const { config: groupConfig } = useGroup();
  const { virtualStart, virtualEnd, paddingTop, paddingBottom } = state;
  // const virtualRef = useRef<VirtualConfig | null>();
  useEffect(() => {
    elementRef.current?.scrollBy({ top: 0 });
  }, [groupConfig]);

  useEffect(() => {
    if (!elementRef.current) return;

    //  当前位定高的表格，所以可以直接获取第一行的高度
    const rowHeight = getRowHeight(elementRef.current as HTMLSpanElement);
    const itemHeight = rowHeight || 30;

    const handleScroll = throttle(() => {
      const { scrollTop, clientHeight } = elementRef.current as HTMLSpanElement;
      const start = Math.floor(scrollTop / itemHeight) - extra;
      const end = Math.ceil((scrollTop + clientHeight) / itemHeight) + extra;

      const newConfig = {
        virtualStart: start,
        virtualEnd: end,
        paddingTop: start * itemHeight,
        paddingBottom: (data.length - end) * itemHeight,
      };
      // virtualRef.current = newConfig;
      setState(newConfig);
      return;
    }, 50);
    // data.length change 的时候用 handleScroll 重设 virtual params
    handleScroll();

    elementRef.current.addEventListener('scroll', handleScroll);
    return () => {
      elementRef.current?.removeEventListener('scroll', handleScroll);
    };
  }, [elementRef.current, data.length]);

  if (!virtualized) {
    return {
      virtualStart: 0,
      virtualEnd: data.length,
      paddingTop: 0,
      paddingBottom: 0,
    };
  }

  return {
    virtualStart: Math.max(0, virtualStart),
    virtualEnd: Math.min(data.length, virtualEnd),
    paddingTop: Math.max(0, paddingTop),
    paddingBottom: data.length - 1 <= virtualEnd ? 0 : paddingBottom,
  };
};

export const VirtualizeStart: React.FC<{
  virtualized: boolean;
  paddingTop: number;
}> = ({ virtualized, paddingTop }) =>
  virtualized && paddingTop > 0 ? (
    <tr
      style={{
        height: 0,
        paddingBottom: paddingTop,
        display: 'block',
      }}
    />
  ) : null;

export const VirtualizeEnd: React.FC<{
  virtualized: boolean;
  paddingBottom: number;
}> = ({ virtualized, paddingBottom }) => (
  <VirtualizeStart virtualized={virtualized} paddingTop={paddingBottom} />
);
