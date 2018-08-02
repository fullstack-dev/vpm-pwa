import { Component } from '@angular/core';
import { NavController, NavParams, ViewController } from 'ionic-angular';
import { AuthenticationService } from '../../_services/authentication';
import { Helper } from '../../_services/helperService';
import { HttpService } from '../../_services/http-service';

// import { CHFHistoryPage } from '../chfhistory/chfhistory';

@Component({
  selector: 'page-alert-hover',
  templateUrl: 'alert-hover.html'
})

export class AlertHoverPage {
  hoverData: any;
  message: any;
  alertInfo = new Info(null, null, []);
  receiverInfoList = [];
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public viewCtrl: ViewController,
    // private authenticationService: AuthenticationService,
    private helper: Helper,
    private httpService: HttpService
  ) {
    this.hoverData = this.navParams.data;
    console.log(this.hoverData);
  }

  close() {
    this.viewCtrl.dismiss();
  }

  sendAlert() {
    if (!this.message) {
      this.helper.showAlert("Please fill message.", "Empty");
      return;
    }
    this.helper.showLoading();
    const member = this.hoverData.patient;
    const userId = localStorage.getItem('userId');
    this.alertInfo.message = this.message;
    this.alertInfo.subject = this.hoverData.indicator.code + ' alert';
    this.receiverInfoList.push(new ReceiverInfo(member.profile.memberId, member.bio.email, member.bio.cell, false));
    this.alertInfo.receiverInfo = this.receiverInfoList;
    this.httpService.post('notification', this.alertInfo)
      .subscribe(response => {
        // const response = result.json();
        // console.log(response);
        this.helper.hideLoading();
        if (response.receiverInfo[0].isEmailSuccess == true || response.receiverInfo[0].isNotificationSuccess == true) {
          this.viewCtrl.dismiss();
          this.helper.showAlert('Alert sent to ' + member.profile.firstName, 'Success');
        }
        if (response.receiverInfo[0].isEmailSuccess == false && response.receiverInfo[0].isNotificationSuccess == false) {
          this.viewCtrl.dismiss();
          this.helper.showAlert('Alert not sent to ' + member.profile.firstName, 'Failed');
        }
      }, error => {
        this.helper.hideLoading();
        console.log(error);
      });
  }
}

class Info {
  constructor(
    public message: string,
    public subject: string,
    public receiverInfo: Array<ReceiverInfo>
  ) { }
}
class ReceiverInfo {
  constructor(
    public memberId: any,
    public email: string,
    public phone: string,
    public isSuccess: boolean
  ) { }
}