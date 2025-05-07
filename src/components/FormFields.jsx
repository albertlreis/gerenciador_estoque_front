import React from 'react';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Dropdown } from 'primereact/dropdown';

export const FormInput = ({ id, value, onChange, ...props }) => (
  <InputText
    id={id}
    value={value}
    onChange={onChange}
    className="form-field"
    {...props}
  />
);

export const FormTextarea = ({ id, value, onChange, rows = 5, ...props }) => (
  <InputTextarea
    id={id}
    value={value}
    onChange={onChange}
    rows={rows}
    className="field"
    {...props}
  />
);

export const FormDropdown = ({ id, value, options, onChange, ...props }) => (
  <Dropdown
    id={id}
    value={value}
    options={options}
    onChange={onChange}
    className="form-field"
    {...props}
  />
);
