import React from 'react';

export default function Badge({ children, variant = '', className = '', ...props }) {
  const v = variant ? `badge--${variant}` : '';
  return (
    <span className={`badge ${v} ${className}`.trim()} {...props}>
      {children}
    </span>
  );
}
