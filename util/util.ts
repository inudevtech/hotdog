// eslint-disable-next-line import/prefer-default-export
export const getStringBytes = (string: string): number => (encodeURIComponent(string).replace(/%../g, 'x').length);
