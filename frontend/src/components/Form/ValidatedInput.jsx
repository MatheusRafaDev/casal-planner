import React from 'react';
import {
  FormGroup,
  Label,
  Input,
  ErrorMessage,
} from '../../styles/components/ItemFormModalStyles';

// Mapa de inputMode e autocomplete por nome de campo
const FIELD_CONFIG = {
  nome:         { inputMode: 'text',    autoComplete: 'off',          enterKeyHint: 'next' },
  marca:        { inputMode: 'text',    autoComplete: 'off',          enterKeyHint: 'next' },
  preco:        { inputMode: 'decimal', autoComplete: 'off',          enterKeyHint: 'next', pattern: '[0-9.,]*' },
  quantidade:   { inputMode: 'numeric', autoComplete: 'off',          enterKeyHint: 'next', pattern: '[0-9]*' },
  loja:         { inputMode: 'text',    autoComplete: 'organization', enterKeyHint: 'next' },
  linkProduto:  { inputMode: 'url',     autoComplete: 'url',          enterKeyHint: 'go'   },
  fotoUrl:      { inputMode: 'url',     autoComplete: 'url',          enterKeyHint: 'go'   },
  email:        { inputMode: 'email',   autoComplete: 'email',        enterKeyHint: 'next' },
  senha:        { inputMode: 'text',    autoComplete: 'current-password', enterKeyHint: 'done' },
  cpf:          { inputMode: 'numeric', autoComplete: 'off',          enterKeyHint: 'next', pattern: '[0-9.-]*' },
};

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
  autoFocus = false,
  ...props
}) => {
  const fieldCfg = FIELD_CONFIG[name] || {};

  const getPlaceholder = () => {
    if (name === 'preco') return 'R$ 0,00';
    return placeholder;
  };

  return (
    <FormGroup>
      <Label theme={theme}>
        {label}
        {required && <span style={{ color: theme?.error || '#ef4444' }} aria-hidden="true"> *</span>}
      </Label>
      <Input
        id={`field-${name}`}
        type={type}
        name={name}
        value={value || ''}
        onChange={onChange}
        onBlur={onBlur}
        theme={theme}
        className={error && touched ? 'error' : ''}
        placeholder={getPlaceholder()}
        maxLength={name === 'preco' ? 14 : maxLength}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        // Atributos mobile — teclado numérico correto, autocomplete, hint da tecla Enter
        inputMode={fieldCfg.inputMode || 'text'}
        autoComplete={fieldCfg.autoComplete || 'off'}
        enterKeyHint={fieldCfg.enterKeyHint || 'done'}
        pattern={fieldCfg.pattern}
        // autoFocus apenas em desktop (no mobile pode causar scroll inesperado)
        autoFocus={autoFocus && typeof window !== 'undefined' && window.innerWidth > 768}
        aria-required={required}
        aria-invalid={!!(error && touched)}
        aria-describedby={error && touched ? `error-${name}` : undefined}
        {...props}
      />
      {error && touched && (
        <ErrorMessage id={`error-${name}`} role="alert" theme={theme}>
          {error}
        </ErrorMessage>
      )}
    </FormGroup>
  );
};

export default ValidatedInput;
