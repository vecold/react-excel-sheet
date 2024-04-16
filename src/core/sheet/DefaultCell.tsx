import type { SheetType } from '@zhenliang/sheet/type';
import { classNames } from '../util';

const DefaultCell = (props: {
  cell: SheetType.Cell;
  row: number;
  col: number;
  attributesRenderer?: SheetType.AttributesRenderer;
  className: string;
  style: Record<string, string>;
  children: React.ReactElement;
}) => {
  const { cell, row, col, attributesRenderer, className, style, children } =
    props;

  const { colSpan, rowSpan } = cell;
  const attributes = attributesRenderer
    ? attributesRenderer(cell, row, col)
    : {};

  return (
    <td
      data-row={row}
      data-col={col}
      className={classNames(
        className,
        cell.fixed && 'fixed',
        cell.fixed && `fixed-${cell.fixed}`,
        cell.dataIndex === 'index' ? "index" : null,
      )}
      colSpan={colSpan}
      rowSpan={rowSpan}
      style={style}
      {...attributes}
    >
      {children}
    </td>
  );
};

export default DefaultCell;
