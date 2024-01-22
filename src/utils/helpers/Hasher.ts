import { hash, compare } from 'bcrypt';

export const getHashedPassword = async (password: string): Promise<string> => {
  const hashedPassword = await hash(password, 10);
  return hashedPassword;
};

export const comparePassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  const isPasswordMatching = await compare(password, hashedPassword);
  return isPasswordMatching;
};
