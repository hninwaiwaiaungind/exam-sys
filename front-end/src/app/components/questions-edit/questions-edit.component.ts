import { Question } from '../../interfaces/question';
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatCheckboxChange } from '@angular/material/checkbox';

@Component({
  selector: 'app-questions-edit',
  templateUrl: './questions-edit.component.html',
  styleUrls: ['./questions-edit.component.scss']
})
export class QuestionsEditComponent {

  questions!: Question[];
  selectedQuestions: Question[] = [];
  filteredQuestions: Question[] = [];
  isIndeterminate = false;
  searchQuestion!: string;
  selectAll = false;

  constructor(
    public dialogRef: MatDialogRef<QuestionsEditComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
    this.questions = data.questionsList;
    this.selectedQuestions = data.selectedQuestions ?? [];
    this.selectAll = this.selectedQuestions.length === this.questions.length;
  }

  addOrRemoveQuestions(event: any, question: Question) {
    if (event.checked) {
      this.selectedQuestions.push(question);
      this.selectAll = true;
    } else {
      const index = this.selectedQuestions.findIndex(q => q.id === question.id);
      if (index !== -1) {
        this.selectedQuestions.splice(index, 1);
        this.selectAll = this.selectedQuestions.length !== 0;
      }
    }
  }

  filterQuestions() {
    this.filteredQuestions = this.questions.filter(question => {
      return question.attributes.question.toLowerCase().includes(this.searchQuestion.toLowerCase());
    });
  }

  isInclude(question: Question) {
    const result = this.selectedQuestions.filter(questionData => {
      return questionData.id === question.id;
    });
    return result.length > 0;
  }

  selectAllQuestions(event: MatCheckboxChange) {
    if (event.checked) {
      this.selectedQuestions = [...this.questions];
    } else {
      this.selectedQuestions = [];
    }
  }

  isChecked(): boolean {
    return this.selectedQuestions.length > 0 && this.selectedQuestions.length === this.questions.length;
  }

  someChecked() {
    return this.selectedQuestions.length > 0 && this.selectedQuestions.length < this.questions.length;
  }

  close() {
    this.dialogRef.close({ data: this.selectedQuestions });
  }
}
