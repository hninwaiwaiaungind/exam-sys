import { Component } from '@angular/core';

//services
import { StorageService } from 'src/app/services/storage.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent {
  userProfile: string;

  constructor(private storageSvc: StorageService) {
    this.userProfile = this.storageSvc.getData('user').userId;
  }
}
