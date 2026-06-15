// Zajednicka UI komponenta: AuthField.

import type { InputHTMLAttributes, ReactNode } from 'react';

type AuthFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> & {
  id: string;
  icon: ReactNode;
  label: string;
  helperText?: string;
};

export default function AuthField({
  id,
  icon,
  label,
  helperText,
  ...inputProps
}: AuthFieldProps) {
  const helperId = helperText ? `${id}-helper` : undefined;

  return (
    <div className="auth-layout-field">
      <label htmlFor={id}>{label}</label>
      <div className="auth-layout-input-shell">
        <span className="auth-layout-input-icon" aria-hidden="true">
          {icon}
        </span>
        <input
          {...inputProps}
          aria-describedby={helperId}
          id={id}
          type={inputProps.type ?? 'text'}
        />
      </div>
      {helperText ? (
        <span className="auth-layout-field-helper" id={helperId}>
          {helperText}
        </span>
      ) : null}
    </div>
  );
}
