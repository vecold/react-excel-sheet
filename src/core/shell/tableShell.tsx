import { useMemo } from 'react';

import type { SheetTableType, SheetType } from '@zhenliang/sheet/type';
import { classNames } from '../util';
import { CheckViewer } from '../viewer/checkViewer';
import { GroupViewer } from '../viewer/groupViewer';
import './draggableShell/index.less';
import { useSheetEvent } from '@zhenliang/sheet/hooks';

export const TableShell = ({
  columns,
  className,
  showGroup,
  showSelect,
  controlProps,
  controlWidth = 30,
}: SheetType.SheetShell) => {
  const eventBus = useSheetEvent()
  const TableShell: React.FC<{
    children: React.ReactElement;
  }> = ({ children }) => {
    const thItems = useMemo(() => {
      const ths = [];
      if (showGroup || showSelect) {
        ths.push(
          <th className="cell cell-title read-only sheet-control" key="-1">
            {showGroup && (
              <GroupViewer
                row={-1}
                col={-1}
                value={true}
                record={{ open: controlProps?.group?.open, isHeader: true }}
              />
            )}
            {showSelect && (
              <CheckViewer
                row={-1}
                col={-1}
                value={controlProps?.check?.checked}
                record={{
                  open: controlProps?.check?.checked,
                  isHeader: true,
                  indeterminate: controlProps?.check?.indeterminate,
                }}
              />
            )}
          </th>,
        );
      }

      columns.forEach((item: SheetTableType.ColumnProps, index: number) => {
        item.titleConfig?.colSpan !== 0 &&
          ths.push(
            <th
              className={classNames(
                'cell',
                'cell-title',
                'read-only',
                item.fixed && 'fixed',
                item.fixed && `fixed-${item.fixed}`,
              )}
              key={item.dataIndex || index}
              colSpan={item.titleConfig?.colSpan}
              onClick={() => {
                eventBus.emit('col-select', { col: index })
              }}
              style={{
                textAlign: (item.align as any) ?? 'unset',
                cursor: 'e-resizer',
                left: item.fixed === 'left' ? 0 : 'unset',
                right: item.fixed === 'right' ? 0 : 'unset',
              }}
            >
              <span className="value-viewer">{item.title}</span>
            </th>,
          );
      });
      return ths;
    }, [columns, showGroup || showSelect, controlProps]);

    const colItems = useMemo(() => {
      const cols = [];
      if (showGroup || showSelect) {
        cols.push(
          <col
            className={classNames('sheet-control')}
            key="sheet-control"
            style={{
              width: controlWidth,
            }}
          />,
        );
      }
      columns.forEach((item: SheetTableType.ColumnProps, index: number) => {
        cols.push(
          <col
            className={classNames('cell')}
            key={item.dataIndex || index}
            style={{
              width: item.width || 'unset',
            }}
          />,
        );
      });
      return cols;
    }, [columns, showGroup || showSelect, controlWidth]);

    return (
      <>
        <table
          key="header"
          className={classNames('header', 'harvest-sheet', className)}
          style={{ position: 'sticky', top: 0, zIndex: 3 }}
        >
          <colgroup>{colItems}</colgroup>
          <thead>
            <tr>{thItems}</tr>
          </thead>
        </table>
        <table key="body" className={classNames('body', 'harvest-sheet')}>
          <colgroup>{colItems}</colgroup>
          <tbody key="tbody">{children}</tbody>
        </table>
      </>
    );
  };
  return TableShell;
};
