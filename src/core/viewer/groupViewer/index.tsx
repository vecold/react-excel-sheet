import { MinusSquareOutlined, PlusSquareOutlined } from '@ant-design/icons';
import { useSheetEvent } from '@zhenliang/sheet';
import { useGroup } from '@zhenliang/sheet/hooks/useGroupConfig';
import type { SheetType } from '@zhenliang/sheet/type';

import { useCallback } from 'react';

export const GroupViewer: SheetType.CellViewer = (props) => {
  const { row = 0, record } = props;
  const { isHeader } = record || {};
  const { config } = useGroup();
  const eventBus = useSheetEvent();

  const isStart = config?.configMap?.get(row)?.isStart;
  const isOpen = config?.configMap?.get(row)?.isOpen;
  const allOpen = !config?.groupOpen?.some((value) => !value);
  const handleChange = useCallback(() => {
    if (!eventBus) return;

    if (isHeader) {
      eventBus.emit('group-open-title', !allOpen);
    } else {
      eventBus.emit('group-open', { row, open: !isOpen });
    }
  }, [eventBus, row, isOpen, allOpen]);

  if (isStart || isHeader) {
    let currentOpen = record?.isHeader ? allOpen : isOpen;

    return (
      <span
        style={{ cursor: 'pointer', pointerEvents: 'all' }}
        onMouseDown={(e) => e.stopPropagation()}
        onClick={handleChange}
      >
        {!currentOpen ? (
          <PlusSquareOutlined rev={undefined} />
        ) : (
          <MinusSquareOutlined rev={undefined} />
        )}
      </span>
    );
  }
  return <span></span>;
};
