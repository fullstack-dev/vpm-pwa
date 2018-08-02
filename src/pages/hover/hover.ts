import { Component } from '@angular/core';
import { NavController, NavParams, PopoverController, ViewController } from 'ionic-angular';
import { AlertHoverPage } from './alert.hover';
import { EditHoverPage } from './edithover';
import { AppointmentsPage } from '../appointments/appointments';

// import { CHFHistoryPage } from '../chfhistory/chfhistory';

@Component({
  selector: 'page-hover',
  templateUrl: 'hover.html'
})

export class HoverPage {
  hoverData: any;
  sendAlert: boolean;
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public popoverCtrl: PopoverController,
    public viewCtrl: ViewController
  ) {
    this.hoverData = this.navParams.data;
    console.log(this.hoverData);
    this.sendAlert = this.hoverData.sendAlert;
  }

  presentAlertPopover(patient, indicator, myEvent) {
    this.viewCtrl.dismiss();
    const data = {
      'patient': patient,
      'indicator': indicator
    }
    let popover = this.popoverCtrl.create(AlertHoverPage, data, { cssClass: 'contact-popover' });
    popover.present({
      ev: this.hoverData.event
    });
  }

  presentEditPopover(patient, indicator, myEvent) {
    // this.viewCtrl.dismiss();
    const data = {
      'patient': patient,
      'indicator': indicator
    }
    let popover = this.popoverCtrl.create(EditHoverPage, data, { cssClass: 'contact-popover' });
    popover.onDidDismiss(data => {
      this.viewCtrl.dismiss(data);
      console.log(data);
    })
    popover.present({
      ev: this.hoverData.event
    });
  }

  goToAppointment(patient){
    this.navCtrl.push(AppointmentsPage, {
      patient: patient
    });
  }
}