import { SheetType } from '@zhenliang/sheet/type';
import { throttle } from 'lodash';
import { useEffect, useState } from 'react';

export const useSelectVisible = (
  sheetWrapper: React.RefObject<SheetType.refAssertion>,
  start?: SheetType.CellPosition,
): [boolean, 'up' | 'down'] => {
  const [startVisible, setStartVisible] = useState(true);
  const [backDirection, setBackDirection] = useState<'up' | 'down'>('up');

  useEffect(() => {
    const handleScroll = throttle(() => {
      if (!start) {
        setStartVisible(true);
        return;
      }
      const startCell = sheetWrapper.current?.querySelector(
        `td.cell[data-row='${start.row}']`,
      ) as HTMLElement;

      if (!startCell) {
        // 找不到说明已经不在可视区域了
        setStartVisible(false);
        return;
      }
      const { top = 0, bottom = 0 } =
        sheetWrapper.current?.getBoundingClientRect() || {};
      const { top: cellTop, bottom: cellBottom } =
        startCell?.getBoundingClientRect() || {};

      if (top < cellTop && bottom > cellBottom) {
        setStartVisible(true);
      } else {
        setStartVisible(false);
        setBackDirection(top < cellTop ? 'down' : 'up');
      }
    }, 100);
    handleScroll();
    sheetWrapper.current?.addEventListener('scroll', handleScroll);

    return () => {
      sheetWrapper.current?.removeEventListener('scroll', handleScroll);
    };
  }, [sheetWrapper.current, start]);

  if (!start) {
    return [true, 'up'];
  }
  return [startVisible, backDirection];
};
