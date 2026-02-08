const createId = (prefix) =>
  `${prefix}_${Math.random().toString(36).slice(2, 9)}`;

export { createId };
