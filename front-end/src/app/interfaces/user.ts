import { Exam } from './exam';

export interface User {
  attributes: any;
  id: number,
  username: string,
  email: string,
  profileUrl: string,
  ansRecord: JSON,
  profile: File,
  exams: Exam[]
}
