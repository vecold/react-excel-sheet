import { useSheetEvent } from '@zhenliang/sheet';
import type { SheetType } from '@zhenliang/sheet/type';
import { Button, Divider } from 'antd';
import { useCallback } from 'react';

export const BtnViewer: SheetType.CellViewer = (props) => {
  const { value, row, record } = props;
  const eventBus = useSheetEvent();
  const handleClick = useCallback(
    (event: { row?: number; type: 'copy' | 'delete' }) => {
      eventBus && eventBus.emit('btn-click', event);
    },
    [eventBus, row, record, value],
  );
  return (
    <div>
      <Button
        type="link"
        key="copy"
        onClick={() => handleClick({ row, type: 'copy' })}
      >
        复制
      </Button>
      <Divider type="vertical" />
      <Button
        type="link"
        key="delete"
        onClick={() => handleClick({ row, type: 'delete' })}
      >
        删除
      </Button>
    </div>
  );
};
