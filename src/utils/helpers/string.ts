import crypto from 'crypto';
export function splitStringFromLastDot(
  inputString: string
): [string, string | undefined] {
  const lastDotIndex = inputString.lastIndexOf('.');

  if (lastDotIndex === -1) {
    return [inputString, undefined];
  } else {
    const firstPart = inputString.slice(0, lastDotIndex);
    const secondPart = inputString.slice(lastDotIndex + 1);
    return [firstPart, secondPart];
  }
}

export const isUuid = (uuid: string): boolean => {
  const uuidRegex =
    /^[a-z0-9]{4,}-[a-z0-9]{4,}-[a-z0-9]{4,}-[a-z0-9]{4,}-[a-z0-9]{4,}/;
  return uuidRegex.test(uuid);
};

export const isPureBoolean = (value: any): boolean => {
  return value === 'true' || value === 'false' || typeof value === 'boolean';
};

export const generateRandomString = (length: number): string => {
  return crypto.randomBytes(length).toString('hex');
};
