import { Exam } from './exam';

export interface Question {
  id: number,
  attributes: {
    question: string,
    answerChoice: string,
    allowMultiAns: boolean,
    questionType: string,
    correctAns: string
    exams: {
      data: Exam[]
    }
  }
}

export interface CSV {
  question: string,
  answerChoice: string,
  questionType: string,
  allowMultiAns: boolean,
  correctAns: string
}