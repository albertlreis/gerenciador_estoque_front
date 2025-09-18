import React from 'react';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Tooltip } from 'primereact/tooltip';
import '../InputWithIcon.css';

const InputWithIcon = ({
                         icon: Icon,
                         iconClass,
                         clearable = false,
                         onClear,
                         label,
                         name,
                         type = 'text',
                         textarea = false,
                         value,
                         onChange,
                         onBlur,
                         placeholder,
                         required = false,
                         helpText,
                         error,
                         rows = 3,
                         autoResize = true,
                         autoComplete,
                         register,
                         inputClassName = '',
                         disabled = false,
                         ...rest
                       }) => {
  const inputId = name;

  const LeftIcon = () =>
    Icon ? <Icon className="icon" /> : iconClass ? <i className={`${iconClass} icon`} /> : null;

  const RightIcons = () => {
    if (clearable && value && String(value).length > 0) {
      return (
        <button
          type="button"
          className="icon-btn"
          onClick={onClear}
          aria-label="Limpar"
          disabled={disabled}
          title="Limpar"
        >
          <i className="pi pi-times" />
        </button>
      );
    }
    return null;
  };

  const inputProps = {
    id: inputId,
    name,
    value,
    onChange,
    onBlur,
    placeholder,
    autoComplete,
    disabled,
    className: `with-icon ${inputClassName}`,
    ...(register ? register(name) : {}),
    ...rest,
  };

  return (
    <div className={`input-icon-wrapper ${error ? 'has-error' : ''} ${disabled ? 'is-disabled' : ''}`}>
      {label && (
        <label htmlFor={inputId} className="input-label">
          {label} {required && <span className="text-danger">*</span>}
          {helpText && (
            <>
              {' '}
              <i
                className="pi pi-info-circle ml-1"
                id={`tooltip-${inputId}`}
                data-pr-tooltip={helpText}
                data-pr-position="top"
              />
              <Tooltip target={`#tooltip-${inputId}`} />
            </>
          )}
        </label>
      )}

      <div className={`input-icon ${disabled ? 'pointer-none' : ''}`}>
        <LeftIcon />
        {textarea ? (
          <InputTextarea rows={rows} autoResize={autoResize} {...inputProps} />
        ) : (
          <InputText type={type} {...inputProps} />
        )}
        <RightIcons />
      </div>

      {error && <small className="input-error">{error}</small>}
    </div>
  );
};

export default InputWithIcon;
