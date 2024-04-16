import { formatPrecision } from '@zhenliang/sheet/standardUtils';
import type { SheetType } from '@zhenliang/sheet/type';
import { InputNumber as AntInputNumber, InputNumberProps } from 'antd';
import 'antd/es/input-number/style/index.css';
import { isNil, isNumber } from 'lodash';
import { useCallback, useEffect, useRef } from 'react';
import './index.less';

type inputProps = Partial<
  Pick<
    InputNumberProps,
    'max' | 'min' | 'addonBefore' | 'addonAfter' | 'precision'
  >
>;

const isNumeric = (str: string) => {
  // 使用正则表达式匹配数字，包括整数和小数
  return /^-?\d+(\.\d+)?$/.test(str);
};

export const NumberEditor: SheetType.CellEditor = (props) => {
  const { value, onChange } = props;
  const inputNumberRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputNumberRef?.current?.focus();
  }, []);

  return (
    <AntInputNumber
      ref={inputNumberRef}
      controls={false}
      className="number-editor"
      onMouseDown={(e) => e.stopPropagation()}
      value={value as number}
      addonAfter="%"
      onChange={onChange}
    />
  );
};

export const getNumberEditor = (
  extraProps?: inputProps,
  getExtraProps?: (props: SheetType.CellEditorProps) => inputProps,
) => {
  const NumberEditor: SheetType.CellEditor = (props) => {
    const { value, onChange } = props;
    const inputNumberRef = useRef<HTMLInputElement>(null);
    const { precision, ...inputArgs } = getExtraProps
      ? getExtraProps(props)
      : extraProps ?? {};
    const { max, min } = inputArgs;
    const handleChange = useCallback(
      (value) => {
        onChange(!isNil(value) ? value : null);
      },
      [onChange],
    );

    useEffect(() => {
      inputNumberRef?.current?.focus();
    }, []);

    const baseFormatter = useCallback((value: string | number | undefined) => {
      if (!value) {
        return '';
      }
      if (!isNumeric(`${value}`)) {
        return value as string;
      }
      const hasDecimal = +value - Math.floor(+value) > 0;
      if (hasDecimal) {
        return formatPrecision(value, precision);
      }
      return String(value);
    }, []);
    // 去掉多余的0
    const valueFormatter = useCallback((value: string | number | undefined) => {
      const baseValue = baseFormatter(value);
      return baseValue ? `${parseFloat(baseValue)}` : '';
    }, []);
    /**
     * 重新声明，后面有需求可以改一下
     */
    const valueParser = baseFormatter;
    return (
      <AntInputNumber
        ref={inputNumberRef}
        {...inputArgs}
        formatter={valueFormatter}
        parser={valueParser}
        controls={false}
        className="number-editor"
        onMouseDown={(e) => e.stopPropagation()}
        value={value as number}
        onChange={handleChange}
        onInput={(value) => {
          // 将截断最大最小放到 input 事件中
          if (!isNumber(+value)) {
            return;
          }
          if (max && +value > (max as number)) {
            handleChange(max);
          } else if (min && +value < (min as number)) {
            handleChange(min);
          }
        }}
      />
    );
  };
  NumberEditor.formatter = (value: unknown) => {
    if (isNil(value) || isNaN(value as number)) {
      return null;
    }

    const result = parseFloat(String(value)?.replace(/,/g, ''));
    return result;
  };
  NumberEditor.parser = (value: unknown) => {
    const result = parseFloat(String(value as string)?.replace(/,/g, ''));
    if (isNil(result) || isNaN(result)) {
      return null;
    }
    return Number(
      formatPrecision(result as number, extraProps?.precision ?? 0),
    );
  };

  NumberEditor.checker = (value: unknown) => {
    if (isNil(value)) {
      return true;
    }
    // parse number with thousands separator
    const result = parseFloat(String(value as string)?.replace(/,/g, ''));

    if (isNaN(result)) {
      return false;
    }
    return true;
  };

  return NumberEditor;
};
