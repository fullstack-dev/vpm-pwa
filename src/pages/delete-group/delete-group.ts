import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { ViewController } from 'ionic-angular/navigation/view-controller';
import { Helper } from '../../_services/helperService';
import { HttpService } from '../../_services/http-service';

@IonicPage()
@Component({
  selector: 'page-delete-group',
  templateUrl: 'delete-group.html',
})
export class DeleteGroupPage {
  private userId = localStorage.getItem('userId');
  challenge: any;
  challenge_name: string;
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public viewCtrl: ViewController,
    public http: HttpService,
    public helper: Helper
  ) {
    this.challenge = navParams.data.challenge;
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad DeleteGroupPage');
  }

  cancel() {
    this.viewCtrl.dismiss(false);
  }

  delete() {
    if (!this.challenge_name) {
      this.helper.showAlert('Please provide the name of the group you want to delete.', 'Alert!');
      return;
    }
    if ((this.challenge_name).toLowerCase() != (this.challenge.name).toLowerCase()) {
      this.helper.showAlert('Name do not matches.', 'Alert!');
      return;
    }
    this.helper.showLoading();
    this.http.delete('/challenges/' + this.challenge.id)
      .subscribe(res => {
        console.log(res);
        if (res) {
          this.helper.hideLoading();
          this.viewCtrl.dismiss(true);
        }
      });
  }
}
