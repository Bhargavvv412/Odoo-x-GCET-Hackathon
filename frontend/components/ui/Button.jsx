import React from 'react';

export default function Button({ children, variant = 'primary', size = 'md', className = '', type = 'button', ...props }) {
  const variantClass = variant === 'secondary' ? 'btn--secondary' : variant === 'ghost' ? 'btn--ghost' : '';
  const classes = `btn ${variantClass} ${className}`.trim();
  return (
    <button type={type} className={classes} aria-pressed={props['aria-pressed']} {...props}>
      {children}
    </button>
  );
}
