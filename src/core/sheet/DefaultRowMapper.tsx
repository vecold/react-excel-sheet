import type { SheetType } from '@zhenliang/sheet/type';
import { memo } from 'react';
import Cell from './Cell';

interface DefaultRowMapperProps {
  rowData: SheetType.Cell[];
  row: number;
}

export const DefaultRowMapper: React.FC<DefaultRowMapperProps> = memo(
  ({ rowData, row }) => {
    const cls = rowData.map((cell, col) => {
      return <Cell key={col} row={row} col={col} cell={cell} />;
    });

    return <>{cls}</>;
  },
);
