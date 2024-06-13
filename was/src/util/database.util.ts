export const extractIdxName = (err: Error) => {
  const matches = err.message.match(/for key '.*\.(.+)'/);

  return matches ? matches[1] : undefined;
};
