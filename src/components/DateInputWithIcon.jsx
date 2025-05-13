import React from 'react';
import { Calendar } from 'primereact/calendar';
import { Tooltip } from 'primereact/tooltip';
import '../InputWithIcon.css';

const DateInputWithIcon = ({
                             icon: Icon,
                             label,
                             name,
                             value,
                             onChange,
                             placeholder,
                             required = false,
                             helpText,
                             error,
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
        <Calendar
          id={inputId}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          showIcon
          className="with-icon"
          {...rest}
        />
      </div>
      {error && <small className="input-error">{error}</small>}
    </div>
  );
};

export default DateInputWithIcon;
