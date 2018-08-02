import { Component, ViewChild } from '@angular/core';
import { NavController, ModalController } from 'ionic-angular';
import { HomePage } from '../home/home';
import { PatientsPage } from '../patients/patients';
import { SendAlertPage } from '../sendalert/sendalert';
import { AppointmentsPage } from '../appointments/appointments';
import { RightMenuPage } from '../rightmenu/rightmenu';
import { EditListPage } from '../editlist/editlist';
import { LoginPage } from '../login/login';
import { PatientsService } from '../../_services/patientsProvider';
import { Helper } from '../../_services/helperService';
import { AuthenticationService } from '../../_services/authentication';
import { CernerService } from '../../_services/cernerProvider';
import { DataService } from '../../_services/data-service';
import { Template, Indicator, Group, ChallengePatientList, Patient, PIList, GroupToggle, CernerProfile, Profile, Bio } from '../../models/models';
import { MapperService } from '../../_services/mapper';
import { EditGroupPage } from '../edit-group/edit-group';
import { HttpService } from '../../_services/http-service';
import { PatientSearchService } from '../../_services/patient-search-service';
import { AutoCompleteComponent } from 'ionic2-auto-complete';
import { InviteResultModalPage } from '../invite-result-modal/invite-result-modal';
@Component({
  selector: 'page-managepatients',
  templateUrl: 'managepatients.html'
})
export class ManagePatientsPage {
  @ViewChild('searchbar')
  searchbar: AutoCompleteComponent;
  public userName: string;
  // private userId = localStorage.getItem('userId');
  challenges = [];
  email: any;
  phone: any;
  countryCode: string = "+1";
  challenge: any;
  // challenge_id = 0;
  // circle_id = 0;
  sortType: string = 'R-H';
  inviteBy: string = 'email';
  // cernerPatients: Array<any> = [];
  // all_challenges: Array<any> = [];
  email_pattern = new RegExp(/^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"\d]{2,})$/);
  // new
  templates: Array<Template>;
  indicators: Array<Indicator>;
  selected_template: string;
  selected_group: string;
  group: Group;
  patients: Array<any>;
  // cplist: ChallengePatientList;
  currentChallenge: any;
  public group_toggle: Array<GroupToggle>;
  public searchQuery: Array<any> = [];  //query for search the patient
  public preparedQueries = [
    'yaduvanshimayank042@gmail.com', 'Alan P', '1234343634', 'mayank@sollogics.com', 'mayank@gmail.com', 'saugat@gmail.com', 'hemant@sollogics.com', 'vikash@gmail.com', 'Baby cerner', 'Charles'
  ];
  public array = [];
  filterArgs: string = '';
  template: Template;
  public pendingInvites: Array<CernerProfile>;
  tags = [];
  public searchResult: Array<CernerProfile>;
  query: any;
  checks: Array<boolean> = [];
  toggle_all_value: boolean = false;
  constructor(
    public navCtrl: NavController,
    public modalCtrl: ModalController,
    public patientService: PatientsService,
    private authenticationService: AuthenticationService,
    public cernerService: CernerService,
    private helper: Helper,
    public dataService: DataService,
    private httpService: HttpService,
    public mapper: MapperService,
    public patientSearchService: PatientSearchService
  ) {
    this.patients = [];
    let profile = this.dataService.getUserProfile();
    this.userName = profile.firstName + ' ' + profile.lastName;
  }

  ngOnInit() {
    try {
      this.helper.showLoading();
      if (localStorage.getItem('EHRprovider') === 'Cerner') {
        this.authenticationService.checkEHRLoginState()
          .then(_ => {
            this.getInitialData();
          }).catch(e => {
            this.helper.showAlert("User unauthorized.", '');
            this.navCtrl.setRoot(LoginPage);
          });
      } else {
        this.getInitialData();
      }
    } catch (e) {
      this.helper.hideLoading();
      this.navCtrl.setRoot(LoginPage);
      console.log(e);
    }
  }

  temp() {
    console.log(this.checks);
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
    this.selectChallenge(false);
  }

  selectChallenge(startLoading: boolean) {
    if (startLoading == true) {
      this.helper.showLoading();
    }
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
    let temp = [];
    this.getMembers().then((result: Array<any>) => {
      console.log(result);

      result[0].patients.forEach(patient => {
        temp.push(patient);
      });
      if (result[1] !== null) {
        result[1].forEach(patient => {
          temp.push(patient);
        });
      }
      this.patients = temp;
      console.log(this.patients);
      this.helper.hideLoading();
    });
  }

  getMembers() {
    let promises = [];
    promises.push(this.patientService.getChallengePatientsList('R-H', this.challenge));
    promises.push(this.getPendingInvitations(this.challenge.id));
    return Promise.all(promises);
  }

  getPendingInvitations(challengeId) {
    return new Promise(resolve => {
      this.pendingInvites = [];
      this.httpService.get('challenges/' + challengeId + '/pendingInvitation')
        .subscribe(res => {
          console.log(res);
          if (res.length != 0) {
            let members = [];
            res.forEach((item, i, a) => {
              this.mapper.getCernerProfile(item.email, item.phone)
                .then((patient => {
                  if (patient != null) {
                    members.push(this.mapper.makeProfile(patient));
                  } else {
                    const profile = new Profile(null, null, null, null);
                    const bio = new Bio(null, null, item.phone, item.email, null, null);
                    let c_profile = new CernerProfile(profile, bio, "assets/img/avatar_male.png");
                    members.push(c_profile);
                  }
                  if (i === a.length - 1) {
                    resolve(members);
                  }
                }));
            });
          } else {
            resolve(null);
          }
        }, err => {
          resolve(null);
        });
    });
  }

  startSorting() {
    this.sortPatients().then((sortedList: Array<any>) => {
      setTimeout(() => {
        this.patients = sortedList;
      }, 1000);
    });
  }

  sortPatients() {
    return new Promise((resolve) => {
      let sorted = [];
      let temp = this.patients;
      switch (this.sortType) {
        case 'R-H':
          sorted = temp.sort(this.patientService.sortPatientsRH);
          resolve(sorted);
          break;
        case 'H-R':
          sorted = temp.sort(this.patientService.sortPatientsHR);
          resolve(sorted);
          break;
        case 'A-Z':
          sorted = temp.sort(this.patientService.sortByNameAscending);
          resolve(sorted);
          break;
        case 'Z-A':
          sorted = temp.sort(this.patientService.sortByNameDescending);
          resolve(sorted);
          break;
        default:
          break;
      }
    });
  }

  previewFile(event) {
    if (this.checkFileExt(event) !== true) {
      return;
    }

    let idxDot = event.target.files[0].name.lastIndexOf('.') + 1;
    let fileExt = event.target.files[0].name.substr(idxDot, event.target.files[0].name.length).toLowerCase();
    if (fileExt === 'csv') {
      // parsing csv data
      let reader = new FileReader();
      reader.onload = (e: any) => {
        console.log(e.target.result);
        let content = (e.target.result).split(/\r\n|\n/);
        let headers = content[0].split(',');
        let lines = [];
        lines.push({ headers: headers });
        content.forEach((line, i, a) => {
          if (i > 0) {
            let data = line.split(',');
            lines.push({ data: data });
          }
        });
        console.log(lines);
      };
      reader.readAsText(event.target.files[0]);
    }
  }

  checkFileExt(event) {
    let validExts = new Array("txt", "csv");
    let idxDot = event.target.files[0].name.lastIndexOf('.') + 1;
    let fileExt = event.target.files[0].name.substr(idxDot, event.target.files[0].name.length).toLowerCase();
    // fileExt = fileExt.substring(fileExt.lastIndexOf('.'));
    if (validExts.indexOf(fileExt) < 0) {
      alert("Invalid file selected, valid files are of " +
        validExts.toString() + " types.");
      return false;
    } else {
      return true;
    }
  }

  searchForPatient() {
    this.helper.showLoading();
    this.searchResult = [];
    this.checks = [];
    let queries = this.getQueries();
    let tempResults = [];
    queries.forEach((query, i, a) => {
      this.getQueryResult(query)
        .then((results: any) => {
          if (results != null) {
            results.forEach(patient => {
              tempResults.push(patient);
            });
          }
          if (i == a.length - 1) {
            this.searchResult = tempResults; //final search result
            this.searchResult.forEach(element => {
              this.checks.push(false);
            });
            this.helper.hideLoading();
          }
        });
    });
  }

  getQueryResult(query: string) {
    return new Promise((resolve => {
      this.patientSearchService.getResults(query)
        .then((patients: Array<any>) => {
          console.log(patients);
          let results = [];
          if (patients.length == 0) {
            let email = null;
            let cell = null;
            let flag = false;
            if (this.patientSearchService.isEmail(query) == true) {
              email = query;
              flag = true;
            } else if (this.patientSearchService.isNumber(query) == true) {
              cell = query;
              flag = true;
            }
            if (flag == true) {
              const profile = new Profile('New', 'User', null, null);
              const bio = new Bio('New', 'User', cell, email, null, null);
              let c_profile = new CernerProfile(profile, bio, "assets/img/avatar_male.png");
              results.push(c_profile);
            }
          }
          patients.forEach(patient => {
            results.push(this.mapper.makeProfile(patient));
          });
          // this.helper.hideLoading();
          resolve(results);
        }).catch(err => {
          resolve(null);
        });
    }))
  }

  getQueries() {
    return this.query.split(",");
  }

  clearSearch() {
    this.query = '';
    this.searchResult = [];
  }

  toggleSelects() {
    let temp = [];
    this.checks.forEach(check => {
      temp.push(this.toggle_all_value);
    });
    this.checks = temp;
  }

  sendInvites() {
    let empty = [];
    let successes = [];
    let fails = [];
    let invites_Indexes = [];
    this.checks.forEach((check, check_i, check_a) => {
      if (check == true) {
        let patient = this.searchResult[check_i];
        let name = patient.profile.firstName + " " + patient.profile.lastName;
        if (patient.bio.cell == null && patient.bio.email == null) {
          empty.push(name);
        } else {
          invites_Indexes.push(check_i);
        }
      }
    });
    if (invites_Indexes.length === 0 && empty.length != 0) {
      this.helper.showAlert('Selected patients do not have any email or phone', 'Missing information!');
      return;
    }

    if (invites_Indexes.length != 0 && empty.length != 0) {
      this.helper.showAlert('One or more selected patient do not have any email or phone', 'Missing information!');
      return;
    }

    if (invites_Indexes.length === 0) {
      // no patients selected
      return;
    }

    invites_Indexes.forEach((index, i, a) => {
      let patient = this.searchResult[index];
      let name = patient.profile.firstName + " " + patient.profile.lastName;
      let cell;
      if (patient.bio.cell !== null && (patient.bio.cell).indexOf("+") === -1) {
        cell = "+1" + patient.bio.cell;
      }
      cell = patient.bio.cell;
      const data = new InviteBo(patient.bio.email, cell, patient.profile.id, localStorage.getItem('EHRprovider'));
      this.httpService.post('challenges/' + this.challenge.id + '/members', data)
        .subscribe(result => {

          let temp = this.patients;
          temp.push(patient);
          this.patients = temp;
          // this.searchResult.splice(index, 1);
          // this.checks.splice(index, 1);

          successes.push({ name: name, index: index });

          if (i == a.length - 1) {
            this.showInviteResult(successes, fails);
          }
          this.httpService.post('challenges/' + this.challenge.id + '/saveExternalProviders', data)
            .subscribe(_result => {
              console.log(_result);
            });
        }, err => {
          fails.push({ name: name, index: index });
          if (i == a.length - 1) {
            this.showInviteResult(successes, fails);
          }
        });
    });
  }

  showInviteResult(successes: Array<any>, fails: Array<any>) {
    console.log(successes);
    console.log(fails);
    let temp = [];
    this.searchResult.forEach((patient, i1, a1) => {
      let flag = false;
      successes.forEach((item, i2, a2) => {
        if (i1 == item.index) {
          flag = true;
        } else if (flag == false && i2 == a2.length - 1) {
          temp.push(patient);
        }
        // this.searchResult.splice(item.index, 1);
        // this.checks.splice(item.index, 1);
      });
    });
    this.searchResult = temp;
    this.checks = [];
    this.searchResult.forEach(element => {
      this.checks.push(false);
    });

    let modal = this.modalCtrl.create(InviteResultModalPage, {
      success: successes,
      fails: fails
    }, {
        cssClass: 'invite-result-modal'
      });
    modal.present();
  }

  invitePatient(patient, itemIndex, fromSearch) {
    let msg: string = 'patient';
    if (patient.bio.cell) { //1
      msg = patient.bio.cell
    }
    if (patient.bio.email) { //2
      msg = patient.bio.email
    }
    if (patient.bio.firstName) {//3
      msg = patient.bio.firstName + ' ' + (patient.bio.lastName ? patient.bio.lastName : '');
    }
    if (patient.bio.cell == null && patient.bio.email == null) {
      this.helper.showAlert('No email or phone is present for this patient.', 'Missing information!');
      return;
    }
    this.helper.showConfirm('', 'Send Invitation to ' + msg + '.', 'YES', 'CANCEL').then(r => {
      this.helper.showLoading();
      let cell;
      if (patient.bio.cell !== null && (patient.bio.cell).indexOf("+") === -1) {
        cell = "+1" + patient.bio.cell;
      }
      cell = patient.bio.cell;
      //NOTE: patient.profile.id --> is EHR ID or null.
      const data = new InviteBo(patient.bio.email, cell, patient.profile.id, localStorage.getItem('EHRprovider'));
      // const data = { email: patient.bio.email, phone: cell }
      console.log(data);
      this.httpService.post('challenges/' + this.challenge.id + '/members', data)
        .subscribe(result => {
          this.helper.hideLoading();
          this.helper.showAlert('Invitation sent.', 'Success');
          if (fromSearch == true) {
            let temp = this.patients;
            temp.push(patient);
            this.patients = temp;
            // this.patients.push(patient);
            this.searchResult.splice(itemIndex, 1);
          } else {
            this.patients[itemIndex].invitationState = 'invite';
          }

        }, error => {
          console.error(error);
          let code = (error.json()).code;
          this.helper.hideLoading();
          if (code == 409) {
            this.helper.showAlert('Patient already exists in this group.', '');
          } else {
            this.helper.showAlert('Invitation sent failed.', 'Error');
          }
        });
    }).catch(e => {
      console.log(e);
    });
  }

  deleteInvitation(patient, itemIndex) {
    let msg: string;
    if (patient.bio.firstName) {//1
      msg = patient.bio.firstName + ' ' + (patient.bio.lastName ? patient.bio.lastName : '');
    }
    if (!msg && patient.bio.email) { //2
      msg = patient.bio.email
    }
    if (!msg && patient.bio.cell) { //3
      msg = patient.bio.cell
    }

    this.helper.showConfirm('Remove member', 'Remove ' + msg + ' from ' + this.challenge.name, 'YES', 'NO').then(r => {
      let data = { email: patient.bio.email, phone: patient.bio.cell };
      this.httpService.post('challenges/' + this.challenge.id + '/pendingInvitation', data)
        .subscribe(result => {
          this.patients.splice(itemIndex, 1);
        }, err => {
          this.helper.showAlert("Some error in removing the member", 'Failed!');
        });
    }).catch(e => {

    });
  }

  removePatient(patient, itemIndex) {
    this.helper.showConfirm('Remove member', 'Remove ' + patient.bio.firstName + ' from ' + this.challenge.name, 'YES', 'NO').then(r => {
      console.log(patient);
      this.helper.showLoading();
      this.httpService.delete("circles/" + this.challenge.campaignInfo.circleInfo.id + "/members/" + patient.profile.memberId)
        .subscribe(result => {
          this.helper.hideLoading();
          // this.changeInviteState(patient, false, null);
          this.patients.splice(itemIndex, 1);
        }, error => {
          console.log(error);
          this.helper.hideLoading();
        });
    }).catch(e => {
      console.log(e);
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
}

class Data {
  constructor(
    public email: string,
    public phone: string
  ) { }
}
class ManagePatient {
  constructor(
    public patient: any,
    public challenge_id: string,
    public select: boolean,
    public isMapped: boolean
  ) { }
}

class InviteBo {
  constructor(
    public email: string,
    public phone: string,
    public externalId: string,
    public externalSystemName: string
  ) { }
}