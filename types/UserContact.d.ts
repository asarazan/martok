export interface UserContact {
  id: string; ///Make a version of phone number
  phoneNumber: string;
  gamefaceUserId?: string; /// If nil, UserContact has not signed up
  test: number;
}
