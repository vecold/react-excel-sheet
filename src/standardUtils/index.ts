type ValueParams = string | number | null | undefined;

export const formatPrecision = (value: ValueParams, precision = 2) => {
  if (Number.isNaN(Number(value)) || value === null || value === 0) {
    return '0';
  }

  const b = 10 ** precision;
  const res = Math.round(Number(value) * b) / b;

  return res.toFixed(precision);
};

/**
 * 千位分隔符
 * @param value 需要千分符格式化的数据
 * @returns 含千分符的字符串
 */
export const thousandsSeparator = (value: string | number) => {
  const [integer, decimal] = String(value).split('.');
  let formattedData = integer?.replace(/(\d{1,3})(?=(\d{3})+$)/g, '$1,');
  if (decimal && decimal.length) {
    formattedData += `.${decimal}`;
  }
  return formattedData;
};
