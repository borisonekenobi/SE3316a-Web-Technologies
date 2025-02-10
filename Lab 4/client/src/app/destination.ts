import {DestinationReview} from './destination-review';

export interface Destination {
  id: string,
  destination: string,
  region: string,
  country: string,
  category: string,
  longitude: string,
  latitude: string,
  annual_tourists: string,
  currency: string,
  religion: string,
  foods: string,
  language: string,
  best_time_visit: string,
  cost_of_living: string,
  safety: string,
  cultural_significance: string,
  description: string,
  tourist_sort: string,
  average_rating: string,
  reviews: DestinationReview[]
}
