import { EditFilled } from '@ant-design/icons';
import { useSheetEvent } from '@zhenliang/sheet';
import type { SheetType } from '@zhenliang/sheet/type';
import { useCallback } from 'react';

export const EditViewer: SheetType.CellViewer = (props) => {
  const { value, row, record } = props;
  const eventBus = useSheetEvent();
  const handleClick = useCallback(() => {
    if (!eventBus) return;
    eventBus.emit('cell-edit', { row, record, value });
  }, [eventBus, row, record, value]);
  return (
    <span
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        color: 'green',
      }}
    >
      <span>{value as string}</span>
      <EditFilled onClick={handleClick} rev={undefined} />
    </span>
  );
};
