import {User} from './user';
import {Destination} from './destination';
import {ListReview} from './list-review';

export interface List {
  id: string,
  name: string,
  description: string,
  is_private: boolean,
  user: User,
  destinations: Destination[],
  average_rating: string,
  reviews: ListReview[]
}
