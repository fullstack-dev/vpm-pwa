import { Component } from '@angular/core';
import { NavController, ModalController, NavParams, ViewController } from 'ionic-angular';
import { PopoverController } from 'ionic-angular';

import { HomePage } from '../home/home';
import { PatientsPage } from '../patients/patients';
import { SendAlertPage } from '../sendalert/sendalert';
import { AppointmentsPage } from '../appointments/appointments';
import { RightMenuPage } from '../rightmenu/rightmenu';
// import { ManagePatientsPage } from '../managepatients/managepatients';
import { AlertHistoryPage } from '../alerthistory/alerthistory';
import { CHFHistoryPage } from '../chfhistory/chfhistory';
import { EditListPage } from '../editlist/editlist';
import { LoginPage } from '../login/login';

import { PopoverPage } from '../popover/popover';
import { Helper } from '../../_services/helperService';
import { AuthenticationService } from '../../_services/authentication';
import { HoverPage } from '../hover/hover';
import { EditHoverPage } from '../hover/edithover';
import { CernerService } from '../../_services/cernerProvider';
import { Patient, Template } from '../../models/models';
import { DataService } from '../../_services/data-service';
import { EditGroupPage } from '../edit-group/edit-group';
import { HttpService } from '../../_services/http-service';

@Component({
  selector: 'page-patientlistitem',
  templateUrl: 'patientlistitem.html'
})
export class PatientListItemPage {
  public userName = localStorage.getItem('userName');
  public isenabled: boolean = false;
  patient: Patient;
  message: any;
  challengeName: any;
  subject: any;
  indicators = [];
  // challenges: any;
  alertInfo = new Info(null, null, []);
  receiverInfoList = [];
  medRecords = [];
  templates: Array<Template>;
  challenges: Array<any>;
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public popoverCtrl: PopoverController,
    public modalCtrl: ModalController,
    public viewCtrl: ViewController,
    private authenticationService: AuthenticationService,
    private helper: Helper,
    public cernerService: CernerService,
    public dataService: DataService,
    private httpService: HttpService
  ) {
    this.patient = this.navParams.data.patient;
    this.challengeName = this.navParams.data.challenge.name;
    this.indicators = this.navParams.data.challenge.challengeTemplateInfo.indicatorLst;
    console.log(this.patient);
    this.loadData();

    //FIXME: get patient's document and med records when EHR id will available
    // this.getAppointments().then(_ => {
    //   this.getMedRecords().then(_ => {
    //     console.log(this.medRecords);
    //   });
    // });
  }

  loadData() {
    let promises: Array<Promise<any>> = [];
    promises.push(
      new Promise((resolve) => {
        const url = 'template';
        this.httpService.get(url)
          .subscribe(templates => {
            this.templates = templates.info;
            resolve();
          });
      }));
    promises.push(
      new Promise(resolve => {
        const url = 'challenges';
        this.httpService.get(url)
          .subscribe(challenges => {
            this.challenges = challenges.info;
            resolve();
          });
      }));
    return Promise.all(promises);
  }

  goToHealthWizzPage() {
    this.navCtrl.push(HomePage);
  }

  goToPatientsPage() {
    this.navCtrl.push(PatientsPage);
  }

  goToSendAlertPage() {
    this.navCtrl.push(SendAlertPage);
  }

  goToAppointmentsPage() {
    this.navCtrl.push(AppointmentsPage);
  }

  goToRightMenuPage() {
    this.navCtrl.push(RightMenuPage);
    // this.navCtrl.push(LoginPage);
  }

  goToEditListPage() {
    let modal = this.modalCtrl.create(EditGroupPage, {
      templates: this.templates,
      challenges: this.challenges
    });
    modal.present();
  }

  goToPatients() {
    this.navCtrl.pop();
  }

  goToAlertHistoryPage() {
    this.navCtrl.push(AlertHistoryPage);
  }

  goToCHFHistoryPage() {
    this.navCtrl.push(CHFHistoryPage, {
      patient: this.patient
    });
  }

  // presentPopover(myEvent) {
  //     let popover = this.popoverCtrl.create(PopoverPage, {}, { cssClass: 'contact-popover' });
  //     popover.present({
  //         ev: myEvent
  //     });
  // }

  presentPopover(patient, indicator, myEvent) {
    // this.viewCtrl.dismiss();

    if (indicator.indicatorCode === 'Next Appointment') {
      const data = {
        'patient': patient,
        'indicator': indicator,
        'event': myEvent,
        'sendAlert': false
      }
      console.log(indicator);
      let popover = this.popoverCtrl.create(HoverPage, data, { cssClass: 'contact-popover' });
      popover.present({
        ev: myEvent
      });
    } else {
      const data = {
        'patient': patient,
        'indicator': indicator
      }
      let popover = this.popoverCtrl.create(EditHoverPage, data, { cssClass: 'contact-popover' });
      popover.onDidDismiss(data => {
        console.log(data);
        if (data) {
          this.getMHIStatus(this.patient.profile).then(i => {
            const array = [];
            array.push(i);
            array[0].forEach(indicator1 => {
              if (indicator1.indicatorCode !== 'Next Appointment') {
                this.patient.mhiStatusList.forEach(_indicator => {
                  if (_indicator.indicatorCode === indicator1.indicatorCode) {
                    _indicator.questions[0].value = indicator1.questions[0].value;
                    _indicator.status = indicator1.status;
                    _indicator.lastUpdatedDate = indicator1.lastUpdatedDate;
                  }
                });
              }

            });
          });
        }
      });
      popover.present({
        ev: myEvent
      });
    }

  }



  sendAlert() {
    if (!this.message && !this.subject) {
      this.helper.showAlert("Please fill subject and message", "Empty");
      return;
    }
    this.helper.showLoading();
    const userId = localStorage.getItem('userId');
    this.alertInfo.message = this.message;
    this.alertInfo.subject = this.subject;
    this.receiverInfoList.push(new ReceiverInfo(this.patient.profile.memberId, this.patient.bio.email, this.patient.bio.cell, false));
    this.alertInfo.receiverInfo = this.receiverInfoList;
    this.httpService.post('notification', this.alertInfo)
      .subscribe(response => {
        // const response = result.json();
        console.log(response);
        this.helper.hideLoading();
        if (response.receiverInfo[0].isEmailSuccess == true || response.receiverInfo[0].isNotificationSuccess == true) {

          this.message = "";
          this.subject = "";
          this.helper.showAlert('Alert sent to ' + this.patient.profile.firstName, 'Success');
        }
        if (response.receiverInfo[0].isEmailSuccess == false && response.receiverInfo[0].isNotificationSuccess == false) {

          this.helper.showAlert('Alert not sent to ' + this.patient.profile.firstName, 'Failed');
        }
      }, error => {
        console.log(error);
        this.helper.hideLoading();
      });
  }

  getMHIStatus(member) {
    const promise = new Promise((resolve, reject) => {
      // const link = 'getMHIStatus/' + member.memberId;
      this.httpService.getMemberMhiStatus(member.memberId)
        .subscribe(response => {
          // const response = result.json();
          let rIndicators = [];
          response.data.forEach(pIndicator => {
            this.indicators.forEach(indicator => {
              if (pIndicator.indicatorCode === indicator.code) {
                pIndicator.lastUpdatedDate = this.getTimeDifference(pIndicator);
                rIndicators.push(pIndicator);
              }
            });
          });

          const templist = [];
          this.indicators.forEach(ci => {
            rIndicators.forEach(pi => {
              if (ci.code === pi.indicatorCode) {
                templist.push(pi);
              }
            });
          });

          rIndicators = templist;
          rIndicators.push({
            indicatorCode: 'Next Appointment',
            questions: [
              { value: null }
            ],
            lastUpdatedDate: 'Not Scheduled',
            status: 'NONE'
          });
          resolve(rIndicators);
        });
    })

    return promise;
  }

  getTimeDifference(bmiData) {
    var d = new Date();
    var n = d.getTime();
    let lastUpdated = "";
    var updatedDate = n - parseInt(bmiData.lastUpdatedDate);
    var daysDifference = Math.floor(updatedDate / 1000 / 60 / 60 / 24);
    var hoursDifference = Math.floor(updatedDate / 1000 / 60 / 60);
    var minutesDifference = Math.floor(updatedDate / 1000 / 60);
    var secondsDifference = Math.floor(updatedDate / 1000);

    if (daysDifference > 0 && daysDifference < 31) {
      if (daysDifference == 1)
        lastUpdated = daysDifference + ' day ago';
      else
        lastUpdated = daysDifference + ' days ago';
    } else if (daysDifference >= 31) {
      daysDifference = daysDifference % 30;
      if (daysDifference > 1)
        lastUpdated = daysDifference + ' months ago';
      else
        lastUpdated = daysDifference + ' month ago';
    } else {
      if (hoursDifference > 0) {
        if (hoursDifference == 1)
          lastUpdated = hoursDifference + ' hour ago';
        else
          lastUpdated = hoursDifference + ' hours ago';
      } else {
        if (minutesDifference > 0) {
          if (minutesDifference == 1)
            lastUpdated = minutesDifference + ' minute ago';
          else
            lastUpdated = minutesDifference + ' minutes ago';
        } else {
          if (secondsDifference > 0) {
            if (secondsDifference == 1)
              lastUpdated = secondsDifference + ' second ago';
            else
              lastUpdated = secondsDifference + ' seconds ago';
          }
        }
      }
    }
    return lastUpdated;
  }

  getAppointments() {
    return new Promise((resolve, reject) => {
      //FIXME: use patient's EHR id to get appointments
      this.cernerService.getPatientAppointment(this.patient.profile.id)
        .subscribe(result => {
          const appointments = (result.json()).entry;
          console.log(appointments);
          this.patient.mhiStatusList.forEach(indicator => {
            if (indicator.indicatorCode === 'Next Appointment') {
              if (appointments) {
                appointments.sort(this.sortAppointment);
                indicator.lastUpdatedDate = new Date(appointments[0].resource.start);
              } else {
                indicator.lastUpdatedDate = 'Not Scheduled';
              }
            }
          });
          resolve();
        });
    });
  }

  sortAppointment(a, b) {
    const a_start = new Date(a.resource.meta.lastUpdated);
    const b_start = new Date(b.resource.meta.lastUpdated);
    if (a_start > b_start) {
      return -1;
    }
    if (a_start < b_start) {
      return 1;
    }
    return 0;
  }

  getMedRecords() {
    return new Promise((resolve, reject) => {
      this.medRecords = [];
      //FIXME: use patient's EHR id to get documents
      this.cernerService.getDocument(this.patient.profile.id).subscribe(result => {
        const documents = (result.json()).entry;
        console.log(documents);
        documents.forEach((document1, i, a) => {
          this.cernerService.getBinary(document1.resource.content[0].attachment.url).subscribe(result => {
            const binary = result.json();
            const data = this.decodeBinary(binary.content);
            const datajson = this.helper.transformToJson(data);
            console.log(datajson);
            const data1 = {
              "lastUpdated": binary.meta.lastUpdated,
              "data": data
            }
            this.medRecords.push(data1);
            if (i === a.length - 1) {
              resolve('OK');
            }
          }, error => {
            console.log(error);
          });
        });
      }, error => {
        console.log(error);
      });
    });
  }

  decodeBinary(binary) {
    return window.atob(binary);
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
    public cell: string,
    public isSuccess: boolean
  ) { }
}