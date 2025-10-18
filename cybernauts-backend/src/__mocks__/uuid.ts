// src/__mocks__/uuid.ts
let count = 0;
export const v4 = () => {
  count += 1;
  return `mock-uuid-${count}`;
};