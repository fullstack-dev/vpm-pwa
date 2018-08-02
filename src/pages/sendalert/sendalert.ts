import { Component } from '@angular/core';
import { NavController, ModalController, ViewController } from 'ionic-angular';

import { HomePage } from '../home/home';
import { PatientsPage } from '../patients/patients';
import { AppointmentsPage } from '../appointments/appointments';
import { RightMenuPage } from '../rightmenu/rightmenu';
import { ManagePatientsPage } from '../managepatients/managepatients';
import { PatientListItemPage } from '../patientlistitem/patientlistitem';
import { EditListPage } from '../editlist/editlist';
import { LoginPage } from '../login/login';
import { Helper } from '../../_services/helperService';
import { PatientsService } from '../../_services/patientsProvider';
import { AuthenticationService } from '../../_services/authentication';
import { Template, Indicator, Group, GroupToggle, ChallengePatientList } from '../../models/models';
import { MapperService } from '../../_services/mapper';
import { DataService } from '../../_services/data-service';
import { EditGroupPage } from '../edit-group/edit-group';
import { HttpService } from '../../_services/http-service';

@Component({
  selector: 'page-sendalert',
  templateUrl: 'sendalert.html'
})
export class SendAlertPage {
  public userName = localStorage.getItem('userName');
  challenges: any;
  challenge: any;
  patients: Array<any> = [];
  alertInfo = new Info(null, null, []);
  receiverInfoList = [];
  message: string;
  subject: string;
  currentId = 0;
  sortType: any;
  select_all: boolean = false;
  templates: Array<Template>;
  indicators: Array<Indicator>;
  selected_template: string;
  selected_group: string;
  group: Group;
  cpList: ChallengePatientList;
  template: Template;
  public filterArgs: any;
  constructor(
    public navCtrl: NavController,
    public modalCtrl: ModalController,
    public pateintService: PatientsService,
    public viewCtrl: ViewController,
    private helper: Helper,
    private authenticationService: AuthenticationService,
    public dataService: DataService,
    public mapper: MapperService,
    private httpService: HttpService
  ) {
    let profile = this.dataService.getUserProfile();
    this.userName = profile.firstName + ' ' + profile.lastName;
  }

  ngOnInit() {
    try {
      this.helper.showLoading();
      this.authenticationService.checkEHRLoginState()
        .then(_ => {
          this.getInitialData();
        }).catch(e => {
          this.helper.showAlert("User unauthorized.", '');
          this.navCtrl.setRoot(LoginPage);
        });
    } catch (e) {
      this.helper.hideLoading();
      this.navCtrl.push(LoginPage);
      console.log(e);
    }
  }

  setInitialData(template: Template) {
    this.dataService.setTemplate(template);
    this.makeGroup().then(_ => {
      this.group = this.dataService.getGroup();
      this.dataService.setChallenge(this.group.challenges[0]);
      this.getInitialData();
    });
  }

  getInitialData() {
    this.templates = this.dataService.getTemplates();
    this.challenges = this.dataService.getChallenges();
    this.template = this.dataService.getTemplate();
    this.indicators = this.template.indicatorLst;
    this.group = this.dataService.getGroup();
    this.challenge = this.dataService.getChallenge();
    this.addNextAppointment();
    this.selectChallenge();
  }

  selectChallenge() {
    this.dataService.setChallenge(this.challenge);
    this.fetchGroupData();
  }

  makeGroup() {
    return this.dataService.makeGroup(this.template, this.challenges);
  }

  addNextAppointment() {
    let flag = true;
    this.indicators.forEach(_indicator => {
      if (_indicator.code == 'Next Appointment') {
        flag = false;
      }
    });
    if (flag == true) {
      this.indicators.push({ code: 'Next Appointment', isCalculable: false });
    }
  }


  fetchGroupData() {
    this.pateintService.getChallengePatientsList('R-H', this.challenge)
      .then((_cplist: ChallengePatientList) => {
        this.cpList = _cplist;
        this.patients = [];
        console.log(this.patients);
        this.removeInvited(_cplist.patients);
        this.helper.hideLoading();
      });
    return;
  }

  removeInvited(patients) {
    patients.forEach(patient => {
      if (patient.profile.invitationState == 'accept') {
        this.patients.push(new Patient(patient, false));
      }
    });
  }

  sortPatients(BY) {
    this.pateintService.sortChallengePatients(BY, this.cpList)
      .then((_cplist: ChallengePatientList) => {
        this.patients = [];
        _cplist.patients.forEach(_patient => {
          this.patients.push(new Patient(_patient, false))
        });
      });
  }

  toggleAllPatients() {
    if (this.select_all === true) {
      this.patients.forEach(patient => {
        patient.select = true;
      });
    } else {
      this.patients.forEach(patient => {
        patient.select = false;
      });
    }
  }

  sendAlert() {
    if (this.message === undefined || this.message === undefined) {
      this.helper.showAlert('Please provide subject and message for alert.', 'Invalid information');
      return;
    }
    this.receiverInfoList = [];
    this.patients.forEach(patient => {
      if (patient.select === true) {
        this.receiverInfoList.push(new ReceiverInfo(patient.patient.profile.memberId, patient.patient.bio.email, patient.patient.bio.cell, false))
      }
    });
    if (this.receiverInfoList.length === 0) {
      this.helper.showAlert('Please select one or more patients.', 'No patient selected');
      return;
    }
    this.helper.showLoading();
    this.alertInfo.message = this.message;
    this.alertInfo.subject = this.subject;
    const userId = localStorage.getItem('userId');
    this.alertInfo.receiverInfo = this.receiverInfoList;
    this.httpService.post('notification', this.alertInfo)
      .subscribe(response => {
        this.helper.hideLoading();
        this.checkAlertStatus(response);
      });
  }

  checkAlertStatus(response) {
    const emailFailCount = 0;
    const notificationFailCount = 0;
    const failedReceivers = [];
    const failedReceiversName = '';
    response.receiverInfo.forEach(receiver => {
      if (receiver.isEmailSuccess == true || receiver.isNotificationSuccess == true) {
      } else if (receiver.isEmailSuccess == false && receiver.isNotificationSuccess == false) {
        failedReceivers.push(receiver.memberId);
      }
    });

    if (failedReceivers.length !== 0) {
      failedReceivers.forEach((receiver, index, array) => {
        this.patients.forEach(patient => {
          if (patient.patient.profile.memberId === receiver.memberId) {
            failedReceiversName.concat(patient.patient.profile.firstName).concat(" ").concat(patient.patient.profile.lastName);
            if (index !== array.length - 1) {
              failedReceiversName.concat(", ");
            }
          }
        });
      });
      this.helper.showAlert(failedReceiversName + ' failed to get alert.', 'Alert sent failed');
    } else {
      this.message = "";
      this.subject = "";
      this.helper.showAlert('Alert to selected patients sent successfully', 'Success');
    }

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
  }

  goToEditListPage() {
    let modal = this.modalCtrl.create(EditGroupPage, {
      templates: this.templates,
      challenges: this.challenges
    });
    modal.present();
  }

  goToManagePatientsPage() {
    this.navCtrl.push(ManagePatientsPage);
  }

  goToPatientListItemPage(patient) {
    this.navCtrl.push(PatientListItemPage, {
      patient: patient,
      challenge: this.cpList.challenge
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

class Patient {
  constructor(
    public patient: any,
    public select: boolean
  ) { }
}