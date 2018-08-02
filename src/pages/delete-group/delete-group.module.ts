import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { DeleteGroupPage } from './delete-group';

@NgModule({
  declarations: [
    DeleteGroupPage,
  ],
  imports: [
    IonicPageModule.forChild(DeleteGroupPage),
  ],
})
export class DeleteGroupPageModule {}
