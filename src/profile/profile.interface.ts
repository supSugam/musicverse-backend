export interface ICreateProfile {
  name: string;
  bio?: string;
  userId: string;
  avatar?: string;
  cover?: string;
}

export interface IUpdateProfile
  extends Partial<Omit<ICreateProfile, 'userId'>> {}
