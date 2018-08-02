import { Component, HostListener, Inject } from '@angular/core';
import { NavController, ModalController, IonicPage } from 'ionic-angular';
import { PopoverController } from 'ionic-angular';
import { PatientsPage } from '../patients/patients';
import { SendAlertPage } from '../sendalert/sendalert';
import { AppointmentsPage } from '../appointments/appointments';
import { ManagePatientsPage } from '../managepatients/managepatients';
import { EditListPage } from '../editlist/editlist';
import { AuthenticationService } from '../../_services/authentication';
import { LoginPage } from '../login/login';
import { HoverPage } from '../hover/hover';
import { Helper } from '../../_services/helperService';
import { AlertHoverPage } from '../hover/alert.hover';
import { CernerService } from '../../_services/cernerProvider';
import { RightMenuPage } from '../rightmenu/rightmenu';
import { DomSanitizer, SafeResourceUrl, DOCUMENT } from '@angular/platform-browser';
import { HttpService } from '../../_services/http-service';
import { EditGroupPage } from '../edit-group/edit-group';
import { DataService } from '../../_services/data-service';
import { Template, Indicator, Group, PatientBo, PIList, StatusList, GroupToggle } from '../../models/models';
import { MapperService } from '../../_services/mapper';
import { Subscription } from 'rxjs/Subscription';
import { I_groups } from '../../_services/interfaces';

@IonicPage({
  name: 'home',
  segment: 'home'
})
@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  public sortType = "R-H";
  public userName: string;
  public isEnableEditList: boolean = false;
  public piList = [];
  public templates: Array<Template>;
  public template: Template;
  public indicators: Array<Indicator>;
  // public templateId: string;
  public challenges: any;
  public challenge: any;
  public group: Group;
  public filterArgs: any;
  // private challenges: Array<any>;
  private refreshGroups: Subscription;

  constructor(
    public navCtrl: NavController,
    public popoverCtrl: PopoverController,
    public modalCtrl: ModalController,
    public authenticationService: AuthenticationService,
    public helper: Helper,
    public cernerService: CernerService,
    public domSanitizer: DomSanitizer,
    public httpService: HttpService,
    public dataService: DataService,
    public mapper: MapperService
  ) {
    this.helper.hideLoading();


  }

  ngOnInit() {
    try {
      this.refreshGroups = this.dataService.$groups
        .subscribe((state: I_groups) => {
          if (state.load == true) {
            // FIXME: refresh group list here
            this.initialize();
          }
        });
      if (localStorage.getItem('EHRprovider') === 'Cerner') {
        this.authenticationService.checkEHRLoginState()
          .then(_ => {
            this.authenticationService.checkServerLoginState()
              .then(_ => {
                let profile = this.dataService.getUserProfile();
                this.userName = profile.firstName + ' ' + profile.lastName;
                if (this.dataService.getInitial() == true) {
                  this.initialize();
                } else {
                  this.getInitialData();
                }
              }).catch(e => {
                this.helper.showAlert("User unauthorized.", '');
                this.navCtrl.setRoot(LoginPage);
              });
          }).catch(e => {
            this.helper.showAlert("User unauthorized.", '');
            this.navCtrl.setRoot(LoginPage);
          });
      } else {
        this.temp();
      }

    } catch (e) {
      this.helper.hideLoading();
      this.navCtrl.push(LoginPage);
      console.log(e);
    }
  }

  temp() {
    this.authenticationService.checkServerLoginState()
      .then(_ => {
        let profile = this.dataService.getUserProfile();
        this.userName = profile.firstName + ' ' + profile.lastName;
        if (this.dataService.getInitial() == true) {
          this.initialize();
        } else {
          this.getInitialData();
        }
      }).catch(e => {
        this.helper.showAlert("User unauthorized.", '');
        this.navCtrl.setRoot(LoginPage);
      });
  }

  initialize() {
    this.helper.showLoading();
    this.loadData()
      .then(() => {
        this.setInitialData((this.dataService.getTemplates())[0]);
      });
  }

  loadData() {
    let promises: Array<Promise<any>> = [];
    promises.push(
      new Promise((resolve) => {
        this.httpService.get('template')
          .subscribe(templates => {
            this.dataService.setTemplates(templates.info);
            resolve();
          });
      }));
    promises.push(
      new Promise(resolve => {
        this.httpService.get('challenges')
          .subscribe(challenges => {
            this.dataService.setChallenges(challenges.info);
            resolve();
          });
      }));
    // promises.push(this.mapper.loadPatients());
    return Promise.all(promises);
  }

  setInitialData(template: Template) {
    this.dataService.setTemplate(template);
    // needed for make group
    this.challenges = this.dataService.getChallenges();
    this.template = this.dataService.getTemplate();
    // ----------
    this.makeGroup().then(_ => {
      this.dataService.setInitial(false);
      this.group = this.dataService.getGroup();
      this.dataService.setChallenge(this.group.challenges[0]);
      this.getInitialData();
    });
  }

  getInitialData() {
    this.templates = this.dataService.getTemplates();
    this.challenges = this.dataService.getChallenges();
    this.template = this.dataService.getTemplate();
    this.challenge = this.dataService.getChallenge();
    this.group = this.dataService.getGroup();
    this.indicators = this.template.indicatorLst;
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
    this.piList = [];
    this.getMembers(this.challenge.campaignInfo.circleInfo.id, this.challenge.creatorId)
      .then((patientsList: Array<any>) => {
        this.piList = this.getIndicatorPatients(patientsList);
        this.sortPatients(this.sortType)
          .then(_ => {
            console.log(this.piList);
            this.helper.hideLoading();
            //FIXME: get patient appointment when their EHR ID will available
            // this.getAppointments();
          });
      });
  }

  getAppointments() {
    return new Promise((resolve, reject) => {
      this.piList.forEach(item => {
        if (item.indicator.code === 'Next Appointment') {
          item.patients.forEach((patient, index, array) => {
            this.cernerService.getPatientAppointment(patient.cernerProfile.profile.id).subscribe(result => {
              const appointments = (result.json()).entry;
              if (appointments) {
                appointments.sort(this.sortAppointment);
                patient.mhiStatusList.lastUpdatedDate = new Date(appointments[0].resource.start);
              } else {
                patient.mhiStatusList.lastUpdatedDate = 'Not Scheduled';
              }
              if (index === array.length - 1) {
                resolve('ok')
              }
            });
          });
        }
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

  sortPatients(BY) {
    return new Promise((resolve) => {
      let statusList: Array<any>;
      switch (BY) {
        case 'R-H':
          statusList = this.makeSortedLists();
          statusList.forEach(item => {
            this.piList[item.index].patients = this.fillSortedList(item.red, item.yellow, item.green, item.none);
          });
          resolve();
          break;
        case 'H-R':
          statusList = this.makeSortedLists();
          statusList.forEach(item => {
            this.piList[item.index].patients = this.fillSortedList(item.green, item.yellow, item.red, item.none);
          });
          resolve();
          break;
        case 'A-Z':
          this.piList.forEach(item => {
            item.patients.sort(this.sortByNameAscending);
          });
          resolve();
          break;
        case 'Z-A':
          this.piList.forEach(item => {
            item.patients.sort(this.sortByNameDescending);
          });
          resolve();
          break;
        default:
          break;
      }
    });
  }

  getIndicatorPatients(patientsList: Array<any>): Array<any> {
    const tempList = [];
    this.indicators.forEach(indicator => {
      const tempPatients = [];
      patientsList.forEach(patient => {
        patient.mhiStatusList.forEach(mhi => {
          if (mhi.indicatorCode === indicator.code) {
            tempPatients.push(new PatientBo(patient.profile, patient.bio, mhi, patient.avatar, patient.cernerId));
          }
        });
      });
      tempList.push(new PIList(indicator, tempPatients));
    });
    return tempList;
  }

  makeSortedLists(): Array<any> {
    const statusList = [];
    this.piList.forEach((item, oIndex) => {
      const red = [];
      const yellow = [];
      const green = [];
      const NA = [];
      item.patients.forEach((patient, iIndex, array) => {
        if (patient.mhiStatusList.status === 'RED') {
          red.push(patient);
        } else if (patient.mhiStatusList.status === 'YELLOW') {
          yellow.push(patient);
        } else if (patient.mhiStatusList.status === 'GREEN') {
          green.push(patient);
        } else {
          NA.push(patient);
        }
        if (iIndex == array.length - 1) {
          statusList.push(new StatusList(oIndex, red, yellow, green, NA));
        }
      });

    });
    return statusList;
  }

  fillSortedList(top: Array<any>, middle: Array<any>, last: Array<any>, none: Array<any>): Array<any> {
    const patients = [];
    if (top.length > 0) {
      top.forEach(patient => {
        patients.push(patient);
      });
    }
    if (middle.length > 0) {
      middle.forEach(patient => {
        patients.push(patient);
      });
    }
    if (last.length > 0) {
      last.forEach(patient => {
        patients.push(patient);
      });
    }
    if (none.length > 0) {
      none.forEach(patient => {
        patients.push(patient);
      });
    }
    return patients;
  }

  sortByNameAscending(a, b) {
    const nameA = a.profile.firstName.toUpperCase();
    const nameB = b.profile.firstName.toUpperCase();
    if (nameA < nameB) {
      return -1;
    }
    if (nameA > nameB) {
      return 1;
    }
    return 0;
  }
  sortByNameDescending(a, b) {
    const nameA = a.profile.firstName.toUpperCase();
    const nameB = b.profile.firstName.toUpperCase();
    if (nameA > nameB) {
      return -1;
    }
    if (nameA < nameB) {
      return 1;
    }
    return 0;
  }

  getMembers(circleId, creatorId) {
    return new Promise((resolve, reject) => {
      const link = 'circles/' + circleId + '/members';
      let patientsList: Array<any> = [];
      let members: Array<any>;
      // let response: any;
      let accepted: Array<any> = [];
      this.httpService.get(link)
        .subscribe(_members => {
          // response = result;
          members = _members.info;
          members.forEach((member) => {
            if (member.invitationState === 'accept') {
              accepted.push(member);
            }
          });
          accepted.forEach((member) => {
            if (member.memberId !== creatorId) {
              this.getMHIStatus(member)
                .then(indicators => {
                  this.getBio(member.memberId).then((bio: any) => {
                    this.getProfilePic(member.memberId, bio).then(profilePic => {
                      this.mapper.getCernerId(bio.email, bio.cell)
                        .then((id: string) => {
                          patientsList.push(new PatientBo(member, bio, indicators, profilePic, id));
                          if (patientsList.length === accepted.length - 1) {
                            resolve(patientsList);
                          }
                        });
                      // let _patient = new PatientBo(member, bio, indicators, profilePic);
                      // _patient.cernerProfile = this.mapper.mapPatient(_patient);
                      // if (_patient.cernerProfile) {
                      //   _patient.profile.firstName = _patient.cernerProfile.profile.firstName;
                      //   _patient.profile.lastName = _patient.cernerProfile.profile.lastName;
                      // }                     
                      // patientsList.push(_patient);

                    });
                  });
                });
            } else if (patientsList.length === accepted.length - 1) {
              resolve(patientsList);
            }
          });
        }, error => {
          this.helper.hideLoading();
        });
    });
  }

  getBio(memberId) {
    return new Promise((resolve, reject) => {
      this.httpService.getMemberProfile(memberId)
        .subscribe(profile => {
          resolve(profile.data);
        });
    });
  }

  getProfilePic(memberId, bio) {
    return new Promise((resolve, reject) => {
      let _imagePath: SafeResourceUrl;
      this.httpService.getMemberProfilePic(memberId)
        .subscribe(pic => {
          const _profilePic = pic.image;
          if (_profilePic != null) {
            _imagePath = this.domSanitizer.bypassSecurityTrustResourceUrl('data:image/jpg;base64,'
              + _profilePic);
          }
          resolve(_imagePath);
        }, error => {
          if (bio.gender === '1') {
            _imagePath = this.domSanitizer.bypassSecurityTrustUrl('assets/img/avatar_male.png');
          } else {
            _imagePath = this.domSanitizer.bypassSecurityTrustUrl('assets/img/avatar_female.png');
          }
          resolve(_imagePath);
        });
    });
  }

  getMHIStatus(member) {
    return new Promise((resolve, reject) => {
      this.httpService.getMemberMhiStatus(member.memberId)
        .subscribe(mhiStatus => {
          let rIndicators = [];
          mhiStatus.data.forEach(pIndicator => {
            this.indicators.forEach(indicator => {
              if (pIndicator.indicatorCode === indicator.code) {
                pIndicator.lastUpdatedDate = this.helper.getTimeDifference(parseInt(pIndicator.lastUpdatedDate));
                pIndicator.questions[0].unit = this.getUnit(pIndicator.indicatorCode, pIndicator.questions[0].unit);
                if (pIndicator.questions[0].unit == 'kg') {
                  pIndicator.questions[0].unit = 'lb';
                  pIndicator.questions[0].value = ((pIndicator.questions[0].value) * (2.2046)).toFixed(2);
                }
                if (pIndicator.questions[0].value == NaN || pIndicator.questions[0].value == null) {
                  pIndicator.status = 'NONE';
                }
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
    });
  }

  getUnit(indicator_code: string, unit: string): string {
    let _unit = null;
    if (indicator_code === 'Daily Weight') {
      _unit = 'lb';
      if (unit == 'kg') {
        _unit = 'kg';
      }
    }
    if (indicator_code === 'Breath Rate')
      _unit = 'bpm';
    if (indicator_code === 'Pulse')
      _unit = 'bpm';
    if (indicator_code === 'Oxygen Saturation')
      _unit = '%';
    return _unit;
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
    }, {
        cssClass: 'editGroupModal'
      });
    modal.present();
  }

  goToManagePatientsPage() {
    this.navCtrl.push(ManagePatientsPage);
  }

  presentPopover(patient, indicator, myEvent) {
    const data = {
      'patient': patient,
      'indicator': indicator,
      'event': myEvent,
      'sendAlert': true
    }
    let popover = this.popoverCtrl.create(HoverPage, data, { cssClass: 'contact-popover' });
    popover.onDidDismiss(data => {
      if (data) {
        this.piList.forEach(item => {
          item.patients.forEach(iPatient => {
            if (iPatient === patient) {
              // patient.mhiStatusList.questions[0].value = data.value;
              this.getMHIStatus(patient.profile).then(i => {
                const array = [];
                array.push(i);
                array[0].forEach(indicator => {
                  if (iPatient.mhiStatusList.indicatorCode === indicator.indicatorCode) {
                    iPatient.mhiStatusList.questions[0].value = indicator.questions[0].value;
                    iPatient.mhiStatusList.status = indicator.status;
                    iPatient.mhiStatusList.lastUpdatedDate = indicator.lastUpdatedDate;
                  }
                });
                this.sortPatients(this.sortType);
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