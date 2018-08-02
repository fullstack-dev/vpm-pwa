import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

/**
 * Generated class for the InviteResultModalPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-invite-result-modal',
  templateUrl: 'invite-result-modal.html',
})
export class InviteResultModalPage {
  success: Array<any>;
  fails: Array<any>;
  constructor(public navCtrl: NavController, public navParams: NavParams) {
    this.success = navParams.data.success;
    this.fails = navParams.data.fails;
    console.log(this.success, this.fails);
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad InviteResultModalPage');
  }

}
