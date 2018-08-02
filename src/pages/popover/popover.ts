import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

import { CHFHistoryPage } from '../chfhistory/chfhistory';

@Component({
  selector: 'page-popover',
  templateUrl: 'popover.html'
})

export class PopoverPage {
  constructor(public navCtrl: NavController) {}

  notificationItemClick() {
    this.navCtrl.push(CHFHistoryPage);
  }
}