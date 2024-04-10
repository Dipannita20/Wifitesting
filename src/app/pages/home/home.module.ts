import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { HomePage } from './home.page';

import { HomePageRoutingModule } from './home-routing.module';
import { ConnectionPage } from './connection/connection.page';
import { ResultPage } from './result/result.page';
import { ProgramPage } from './program/program.page';
import { ProcessingPage } from './processing/processing.page';
import { DealerLocatorPage } from './dealer-locator/dealer-locator.page';
import { ModalPage } from './modal/modal.page';
import { NewDealerModalComponent } from './dealer-locator/new-dealer-modal/new-dealer-modal.component';

@NgModule({
  declarations: [
    HomePage,
    ConnectionPage,
    ProgramPage,
    ProcessingPage,
    ResultPage,
    DealerLocatorPage,
    ModalPage,
    NewDealerModalComponent,
  ],
  imports: [CommonModule, FormsModule, IonicModule, HomePageRoutingModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class HomePageModule {}
