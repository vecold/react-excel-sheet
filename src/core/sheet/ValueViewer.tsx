import type { SheetType } from '@zhenliang/sheet/type';

const ValueViewer: SheetType.CellViewer = ({ value }) => (
  <span className="value-viewer">{value as string}</span>
);
export default ValueViewer;
