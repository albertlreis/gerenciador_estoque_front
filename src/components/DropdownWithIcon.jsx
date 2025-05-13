import React from 'react';
import { Dropdown } from 'primereact/dropdown';
import { Tooltip } from 'primereact/tooltip';
import '../InputWithIcon.css';

const DropdownWithIcon = ({
                            icon: Icon,
                            label,
                            name,
                            value,
                            onChange,
                            options,
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
        <Dropdown
          id={inputId}
          name={name}
          value={value}
          onChange={onChange}
          options={options}
          optionLabel="label"
          placeholder={placeholder}
          className="with-icon"
          {...rest}
        />
      </div>
      {error && <small className="input-error">{error}</small>}
    </div>
  );
};

export default DropdownWithIcon;
