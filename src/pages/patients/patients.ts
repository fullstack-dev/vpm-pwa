import { Component } from '@angular/core';
import { ModalController, NavController } from 'ionic-angular';
import { HomePage } from '../home/home';
import { SendAlertPage } from '../sendalert/sendalert';
import { AppointmentsPage } from '../appointments/appointments';
import { RightMenuPage } from '../rightmenu/rightmenu';
import { ManagePatientsPage } from '../managepatients/managepatients';
import { PatientListItemPage } from '../patientlistitem/patientlistitem';
import { EditListPage } from '../editlist/editlist';
import { LoginPage } from '../login/login';
import { PatientsService } from '../../_services/patientsProvider';
import { Helper } from '../../_services/helperService';
import { AuthenticationService } from '../../_services/authentication';
import { Template, Indicator, Group, GroupToggle, ChallengePatientList } from '../../models/models';
import { MapperService } from '../../_services/mapper';
import { DataService } from '../../_services/data-service';
import { EditGroupPage } from '../edit-group/edit-group';
import { HttpService } from '../../_services/http-service';
@Component({
  selector: 'page-patients',
  templateUrl: 'patients.html'
})
export class PatientsPage {
  public userName = localStorage.getItem('userName');
  public isEnableEditList: boolean = false;
  challenges: any;
  patients: any = [];
  currentId = 0;
  cpList: ChallengePatientList;
  sortType: any;
  //new
  templates: Array<Template>;
  indicators: Array<Indicator>;
  selected_template: string;
  selected_group: string;
  group: Group;
  // currentChallenge: any;
  template: Template;
  challenge: any;
  public group_toggle: Array<GroupToggle>;
  public filterArgs: any;
  constructor(
    public navCtrl: NavController,
    public modalCtrl: ModalController,
    public pateintService: PatientsService,
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
      this.navCtrl.setRoot(LoginPage);
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
    this.group = this.dataService.getGroup();
    this.challenge = this.dataService.getChallenge();
    this.indicators = this.template.indicatorLst;
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
    this.patients = [];
    this.pateintService.getChallengePatientsList('R-H', this.challenge)
      .then((_cplist: ChallengePatientList) => {
        this.cpList = _cplist;
        this.removeInvited(this.cpList.patients);
        this.helper.hideLoading();
      });
    return;
  }

  removeInvited(patients) {
    this.patients = [];
    patients.forEach(patient => {
      if (patient.profile.invitationState == 'accept') {
        this.patients.push(patient);
      }
    });
  }

  sortPatients(BY) {
    this.pateintService.sortChallengePatients(BY, this.cpList)
      .then((_cplist: ChallengePatientList) => {
        this.cpList = _cplist;
        this.removeInvited(this.cpList.patients);
      });
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