export interface User {
  id?: number;
  username: string;
  email: any;
  password: string;
  profile?: string;
  profileUrl?: string;
  createdAt?: string;
  updatedAt?: string;
  role: any;
  userId?: string;
  editId?: string;
  exams?: Exams[];
}

export interface Role {
  id: number;
  name:string;
  type: string;
}

export interface CSV {
  username: string;
  email: string;
  role: number;
}

export interface LoggedUser {
  userId: number;
  userRole: string;
  apiKey?: string;
}
export interface Question {
  id: number,
  attributes: {
    question: string,
    answerChoice: string,
    allowMultiAns: boolean,
    questionType: string,
    correctAns: string
    exams: {
      data: Exams[]
    }
  }
}

export interface Exams {
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
    }
  }
}

export type Exam = {
  id: number;
  name: string;
  startDte: Date;
  endDte: Date;
  attributes: any
}
