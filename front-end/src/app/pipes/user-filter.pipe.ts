import { Pipe, PipeTransform } from '@angular/core';

//interfaces
import { User } from '../interfaces/model';

@Pipe({
  name: 'userFilter'
})
export class UserFilterPipe implements PipeTransform {

  transform(users: User[], searchText: string, selectedRole: string, searchType: 'username' | 'role' | 'both'): User[] {
    if (!users) {
      return [];
    }
    if (!searchText && !selectedRole) {
      return users;
    }
    return users.filter(user => {
      const matchUsername = searchType === 'username' || searchType === 'both' ?
        user.username.toLowerCase().includes(searchText.trim().toLowerCase()) :
        true;
      const matchRole = searchType === 'role' || searchType === 'both' ?
        (selectedRole.toLowerCase() === 'all' ? true : user.role.type.toLowerCase() === selectedRole.toLowerCase()) :
        true;
      return matchUsername && matchRole;
    });
  }
}
