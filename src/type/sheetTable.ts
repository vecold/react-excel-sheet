import { CSSProperties, ReactNode } from 'react';
import { SheetType } from '.';

export type refAssertion = {
  contains?: (target: EventTarget | null) => boolean;
  focus?: () => boolean;
} & HTMLTableSectionElement;

export type CellFixed = SheetType.CellAlign;
export type RecordRowMap<T> = (
  value: unknown,
  record: Record<string, unknown>,
  index: number,
  colIndex?: number,
) => T;

export type ColumnProps = {
  /**
   * @description 对齐
   * @default "left"
   */
  align?: SheetType.CellAlign;
  /**
   * @description 固定
   * @default "undefined"
   */
  fixed?: Omit<CellFixed, 'center'>;
  /**
   * @description 列宽
   * @default "undefined"
   */
  width?: string | number;
  dataIndex?: string;
  title: string | ReactNode | ReactNode[] | React.FC;
  titleConfig?: {
    colSpan?: number;
    className?: string;
  };
  cellConfig?: {
    className?: string | RecordRowMap<string>;
  };
  key?: string;
  editable?: boolean | RecordRowMap<boolean>;
  readonly?: boolean | RecordRowMap<boolean>;
  render?: SheetType.CellViewer;
  editor?: SheetType.CellEditor;
  searchKey?: (value: unknown, record: Record<string, unknown>) => string
};
export type TableChange = {
  col?: number;
  row: number;
  id: string;
  key: string;
  value: unknown;
};
export type TableRowSelection = {
  rowSelected?: string[];
  onChange?: (
    selectedRowKeys: string[],
    selectedRows: Record<string, unknown>[],
  ) => void;
};
export type TableGroupConfig = {
  defaultOpen?: boolean;
  rowGroup?: SheetType.RowGroupConfig;
  onChange?: (value: SheetType.RowGroupConfig) => void;
};
export type EventHandler = (value: any) => void;
export type TableProps = {
  /**
   * @description 表格类名
   * @default "undefined"
   */
  className?: string;
  /**
   * @description sheet的一些定义方法可执行
   * @default "object"
   */
  sheetInstance?: React.MutableRefObject<SheetType.SheetInstance | null>;
  columns: ColumnProps[];
  virtualized?: boolean;
  dataSource: Record<string, unknown>[];
  emptyRenderer?: any;
  rowClassName?:
  | string
  | ((record: Record<string, unknown>, index: number) => string);
  rowKey?:
  | string
  | ((record: Record<string, unknown>, index: number) => string);
  scroll?: { x?: number | string; y?: number | string };
  sticky?: boolean;
  draggable?: boolean;
  freePaste?: boolean;
  showBackEdit?: boolean;
  backEditStyle?: Partial<CSSProperties>;
  searchStyle?: Partial<CSSProperties>;
  rowSelection?: TableRowSelection;
  groupConfig?: TableGroupConfig;

  menuRenderer?: React.FC<SheetType.MenuRenderProps>;
  onContextMenu?: (event: any) => void;

  onChange: (changes: TableChange[], extChanges?: TableChange[]) => void;
  handleAdd?: () => void;
  handleBatchAdd?: (value: number) => void;
  eventHandler?: Record<
    'reverse' | 'btn-click' | 'cell-edit' | 'cell-switch' | string,
    undefined | EventHandler
  >;
  boldScroll?: boolean;
};
