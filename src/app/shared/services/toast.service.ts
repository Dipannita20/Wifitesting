import { Injectable } from '@angular/core';
import { Toast } from '@capacitor/toast';

@Injectable({
  providedIn: 'root'
})
export class ToastService {

  constructor() { }
  showToast = async (message:string) => {
    await Toast.show({
      text: message,
      duration:'long'
    });
  };
  
}
