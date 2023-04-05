import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';
//constants
import { MESSAGES } from '../constants/messages';

@Injectable({
  providedIn: 'root'
})
export class MessagesService {
  message!: string;

  handleErrorStatus(type: string, message: string, statusCode?: number) {
    if (statusCode !== undefined && message === undefined) {
      switch (statusCode) {
        case 403:
          message = MESSAGES.MESSAGE_403;
          break;
        case 404:
          message = MESSAGES.MESSAGE_404;
          break;
        case 500:
          message = MESSAGES.MESSAGE_500;
          break;
        default:
          message = MESSAGES.DEFAULT;
      }
    }

    return Swal.fire({
      text: message,
      icon: type === 'success' ? 'success' : (type === 'error' ? 'error' : (type === 'info' ? 'info' : 'warning')),
      confirmButtonText: 'OK',
      width: '320px',
      confirmButtonColor: '#3596B5'
    });
  }

  commonMessage(type: string, errorOrMessage: any) {
    const statusCode = errorOrMessage.status;
    const message = errorOrMessage.error ? errorOrMessage.error.message : errorOrMessage;
    return this.handleErrorStatus(type, message, statusCode);
  }

  comfirmMessage(type: string, message: string): Promise<any> {
    return new Promise(resolve => {
      Swal.fire({
        icon: type === 'success' ? 'success' : 'question',
        title: message,
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'Cancel'
      }).then(result => {
        resolve(result);
      });
    });
  }

  submitAnswered(type: string, message: string) {
    return new Promise(resolve => {
      const swalWithBootstrapButtons = Swal.mixin({
        customClass: {
          confirmButton: 'btn btn-success',
          cancelButton: 'btn btn-danger'
        },
        buttonsStyling: false
      })

      Swal.fire({
        title: '<strong>' + message + '</strong>',
        html: 'You cannot edit your answer once it has been submitted!',
        icon: type === 'question' ? 'question' : 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, submit it!',
        customClass: {
          htmlContainer: 'sweet_textImportant',
        }
      }).then((result) => {
        resolve(result);
      });
    });
  }
}
