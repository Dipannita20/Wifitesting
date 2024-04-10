import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ConnectionPage } from './connection/connection.page';
import { ProgramPage } from './program/program.page';
import { ResultPage } from './result/result.page';
import { ProcessingPage } from './processing/processing.page';
import { DealerLocatorPage } from './dealer-locator/dealer-locator.page';

const routes: Routes = [
  { path: 'connection', component: ConnectionPage },
  { path: 'program', component: ProgramPage },
  { path: 'processing', component: ProcessingPage },
  { path: 'result', component: ResultPage },
  { path: 'dealer-locator', component: DealerLocatorPage },
  { path: '', redirectTo: 'connection', pathMatch: 'full' }, // Default route
  { path: '**', redirectTo: 'connection' },
// Redirect to home if route not found
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HomePageRoutingModule {}
