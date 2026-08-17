import React from 'react';
import { formatDisplayNumber, parseFormattedNumber } from '../utils/helpers';

export const NumericInput = ({
  value,
  onChange,
  className = '',
  placeholder = '',
  required = false,
  disabled = false,
  name,
  id
}) => {
  const displayValue = formatDisplayNumber(value);

  const handleChange = (e) => {
    const inputValue = e.target.value;
    const rawValue = parseFormattedNumber(inputValue);

    if (onChange) {
      const syntheticEvent = {
        ...e,
        target: {
          ...e.target,
          name: name || e.target.name,
          value: rawValue
        }
      };
      onChange(syntheticEvent);
    }
  };

  return (
    <input
      type="text"
      inputMode="decimal"
      value={displayValue}
      onChange={handleChange}
      className={className}
      placeholder={placeholder}
      required={required}
      disabled={disabled}
      name={name}
      id={id}
    />
  );
};

export default NumericInput;
