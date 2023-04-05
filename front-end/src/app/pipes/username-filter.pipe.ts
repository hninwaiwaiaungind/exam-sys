import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'usernameFilter'
})
export class UsernameFilterPipe implements PipeTransform {

  transform(items: any[], searchText: string): any[] {
    if (!items) {
      return [];
    }
    if (!searchText) {
      return items;
    }
    searchText = searchText.trim().toLowerCase();
    const result = items.filter(item => {
      return item.username.toLowerCase().includes(searchText);
    });
    return result;
  }
}
