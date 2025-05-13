import React from 'react';
import { InputMask } from 'primereact/inputmask';
import { Tooltip } from 'primereact/tooltip';
import '../InputWithIcon.css';

const MaskedInputWithIcon = ({
                               icon: Icon,
                               label,
                               name,
                               mask,
                               placeholder,
                               required = false,
                               helpText,
                               error,
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
                data-pr-tooltip={helpText}
                id={`tooltip-${name}`}
                data-pr-position="top"
              />
              <Tooltip target={`#tooltip-${name}`} />
            </>
          )}
        </label>
      )}

      <div className="input-icon">
        {Icon && <Icon className="icon" />}
        <InputMask
          id={inputId}
          name={name}
          mask={mask}
          placeholder={placeholder}
          className="with-icon"
          {...(register ? register(name) : {})}
          {...rest}
        />
      </div>

      {error && <small className="input-error">{error}</small>}
    </div>
  );
};

export default MaskedInputWithIcon;
