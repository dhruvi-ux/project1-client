export interface Destination {
  _id?: string;
  name: string;
  location: string;   
  image: string;
  description?: string;
  gallery?: string[];
  averageRating?: number;
}
