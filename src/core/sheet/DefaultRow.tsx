import type { SheetType } from '@zhenliang/sheet/type';
import { useMemo } from 'react';
import { groupConfigToGroupMap } from '../util';

const DefaultRow: React.FC<{
  children: React.ReactElement;
  rowClassName?: string;

  row: number;
  groupConfig?: {
    groups: SheetType.RowGroup[];
    groupOpen: boolean[];
  };
}> = ({ rowClassName, children, row, groupConfig }) => {
  const groupMap = useMemo(() => {
    // 分组逻辑
    return groupConfigToGroupMap(groupConfig);
  }, [groupConfig]);

  if (
    groupMap.get(row) &&
    !groupMap.get(row)?.isStart &&
    !groupMap.get(row)?.isOpen
  ) {
    return null;
  }

  return <tr className={rowClassName}>{children}</tr>;
};
export default DefaultRow;
