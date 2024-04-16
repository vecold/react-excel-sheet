import { useSheetEvent } from '@zhenliang/sheet';
import type { SheetType } from '@zhenliang/sheet/type';
import { Switch } from 'antd';
import { useCallback } from 'react';

export const SwitchViewer: SheetType.CellViewer = (props) => {
  const { value, row, record, cell } = props;
  const { key, readonly } = cell ?? {};
  const eventBus = useSheetEvent();
  const handleChange = useCallback(() => {
    if (!eventBus) return;
    eventBus.emit('cell-switch', { row, record, value: !value, key });
  }, [eventBus, row, record, value]);
  return (
    <Switch
      disabled={readonly}
      checked={value as boolean}
      onChange={handleChange}
    />
  );
};