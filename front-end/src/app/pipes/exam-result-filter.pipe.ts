import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'examResultFilter'
})
export class ExamResultFilterPipe implements PipeTransform {

  transform(items: any[], result: string): any[] {
    if (result === 'all') {
      return items;
    } else if (result === 'pass') {
      return items.filter(item => item.mark >= item.passMark);
    } else if (result === 'fail') {
      return items.filter(item => item.mark < item.passMark);
    }
    else {
      return [];
    }
  }
}
