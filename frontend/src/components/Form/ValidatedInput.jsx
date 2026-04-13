import React from 'react';
import {
  FormGroup,
  Label,
  Input,
  ErrorMessage
} from '../../styles/components/ItemFormModalStyles';

const ValidatedInput = ({
  label,
  name,
  value,
  onChange,
  onBlur,
  error,
  touched,
  theme,
  required = false,
  type = 'text',
  placeholder,
  maxLength,
  min,
  max,
  step,
  disabled = false,
  ...props
}) => {

  const getPlaceholder = () => {
    if (name === 'preco') {
      return '0,00';
    }
    return placeholder;
  };

  return (
    <FormGroup>
      <Label theme={theme}>
        {label} {required && <span style={{ color: theme.error }}>*</span>}
      </Label>
      <Input
        type={type}
        name={name}
        value={value || ''}
        onChange={onChange}
        onBlur={onBlur}
        theme={theme}
        className={error && touched ? 'error' : ''}
        placeholder={getPlaceholder()}
        maxLength={name === 'preco' ? 12 : maxLength}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        inputMode={name === 'preco' ? 'numeric' : 'text'}
        {...props}
      />
      {error && touched && (
        <ErrorMessage theme={theme}>{error}</ErrorMessage>
      )}
      
      {name === 'preco' && !error && (
        <small style={{ 
          color: theme.textLight, 
          fontSize: '0.75rem', 
          marginTop: '0.25rem',
          display: 'block'
        }}>
        </small>
      )}
    </FormGroup>
  );
};

export default ValidatedInput;