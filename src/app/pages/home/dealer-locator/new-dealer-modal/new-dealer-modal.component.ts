import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-new-dealer-modal',
  templateUrl: './new-dealer-modal.component.html',
  styleUrls: ['./new-dealer-modal.component.scss'],
})
export class NewDealerModalComponent implements OnInit {
  name: string = '';

  constructor(private modalCtrl: ModalController) {}

  ngOnInit() {}

  cancel() {
    return this.modalCtrl.dismiss(null, 'cancel');
  }

  confirm() {
    return this.modalCtrl.dismiss(this.name, 'confirm');
  }
}
