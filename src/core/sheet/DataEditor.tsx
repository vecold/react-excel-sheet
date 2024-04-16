import type { SheetType } from '@zhenliang/sheet/type';
import { ChangeEvent, useEffect, useRef } from 'react';

const DataEditor: SheetType.CellEditor = ({ value, onChange }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <input
      ref={inputRef}
      onMouseDown={(e) => e.stopPropagation()}
      className="data-editor"
      value={value as string}
      onChange={handleChange}
    />
  );
};

export default DataEditor;
