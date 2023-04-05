import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'nameSearchById'
})
export class NameSearchByIdPipe implements PipeTransform {

  transform(values: any[], id: number) {
    let data = values.filter(value => {
      return value.id === id;
    });
    return (data[0]?.name || data[0]?.attributes?.name);
  }

}
