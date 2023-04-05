import { Question } from './question';
import { User } from './user';

export interface Exam {
  id: number,
  attributes: {
    name: string,
    duration: number,
    startDte: Date,
    endDte: Date,
    users: {
      data: User[]
    },
    questions: {
      data: Question[]
    },
    passMark: number,
  }
}
