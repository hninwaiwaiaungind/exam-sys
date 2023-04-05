import { User } from './user';
export interface Mark {
  id: number,
  attributes: {
    user: {
      data: User
    },
    records: [
      {
        id: number,
        mark: number,
        ansStartDte: Date,
        ansEndDte: Date
      }
    ]
  }
}
