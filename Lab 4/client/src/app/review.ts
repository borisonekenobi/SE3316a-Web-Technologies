import {User} from './user';

export interface Review {
  user: User;
  rating: string;
  comment: string;
  is_hidden: boolean;
}
