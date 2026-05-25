import React from 'react';

export function formatAmpersand(text: string): React.ReactNode {
  if (!text) return '';
  if (typeof text !== 'string') return text;
  const parts = text.split('&');
  if (parts.length === 1) return text;
  return (
    <>
      {parts.map((part, index) => (
        <React.Fragment key={index}>
          {part}
          {index < parts.length - 1 && (
            <span className="mx-1 font-inherit">&amp;</span>
          )}
        </React.Fragment>
      ))}
    </>
  );
}
