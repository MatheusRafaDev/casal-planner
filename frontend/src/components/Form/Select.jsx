import React from 'react';
import {
  FormGroup,
  Label,
  Select as StyledSelect
} from '../../styles/components/ItemFormModalStyles';

const Select = ({
  label,
  value,
  onChange,
  theme,
  children,
  disabled = false,
  ...props
}) => {
  return (
    <FormGroup>
      <Label theme={theme}>{label}</Label>
      <StyledSelect
        value={value}
        onChange={onChange}
        theme={theme}
        disabled={disabled}
        {...props}
      >
        {children}
      </StyledSelect>
    </FormGroup>
  );
};

export default Select;