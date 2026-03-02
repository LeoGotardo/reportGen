import React from "react";

export function Bi({ name, size = 16, style: s = {} }) {
  return <i className={`bi bi-${name}`} style={{ fontSize: size, lineHeight: 1, ...s }} />;
}
