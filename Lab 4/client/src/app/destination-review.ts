import {Review} from './review';

export interface DestinationReview extends Review {
  destination_id: string;
}
