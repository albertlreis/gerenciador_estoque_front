import React from 'react';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Tooltip } from 'primereact/tooltip';
import '../InputWithIcon.css';

const InputWithIcon = ({
                         icon: Icon,
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
                         ...rest
                       }) => {
  const inputId = name;

  return (
    <div className={`input-icon-wrapper ${error ? 'has-error' : ''}`}>
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
      <div className="input-icon">
        {Icon && <Icon className="icon" />}
        {textarea ? (
          <InputTextarea
            id={inputId}
            name={name}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            placeholder={placeholder}
            rows={rows}
            autoResize={autoResize}
            autoComplete={autoComplete}
            className="with-icon"
            {...(register ? register(name) : {})}
            {...rest}
          />
        ) : (
          <InputText
            id={inputId}
            name={name}
            type={type}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            placeholder={placeholder}
            autoComplete={autoComplete}
            className="with-icon"
            {...(register ? register(name) : {})}
            {...rest}
          />
        )}
      </div>
      {error && <small className="input-error">{error}</small>}
    </div>
  );
};

export default InputWithIcon;
