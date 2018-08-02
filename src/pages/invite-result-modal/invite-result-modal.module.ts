import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { InviteResultModalPage } from './invite-result-modal';

@NgModule({
  declarations: [
    InviteResultModalPage,
  ],
  imports: [
    IonicPageModule.forChild(InviteResultModalPage),
  ],
})
export class InviteResultModalPageModule {}
