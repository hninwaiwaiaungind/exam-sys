import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  isAdmin = false;
  constructor() { }

  setData(keyName: string, value: any) {
    localStorage.setItem(keyName, JSON.stringify(value));
  }

  getData(keyName: string) {
    return JSON.parse(localStorage.getItem(keyName) || '{}');
  }

  remove(keyName: string) {
    if (this.checkKeyExist(keyName)) {
      localStorage.removeItem(keyName);
    }
  }

  checkKeyExist(keyName: string) {
    return localStorage.getItem(keyName) !== null;
  }
}
