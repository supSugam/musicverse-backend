export const cleanObject = <T>(
  obj: T,
  { includeNull = false, includeUndefined = false } = {
    includeNull: false,
    includeUndefined: false,
  }
): T => {
  const cleanedObj = {} as T;

  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const value = obj[key];
      if (value !== null && value !== undefined) {
        cleanedObj[key] = value;
      } else if (includeNull && value === null) {
        cleanedObj[key] = value;
      } else if (includeUndefined && value === undefined) {
        cleanedObj[key] = value;
      }
    }
  }
  return cleanedObj;
};
