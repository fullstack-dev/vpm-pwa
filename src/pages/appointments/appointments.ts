import { Component, ViewChild } from '@angular/core';
import { NavController, ModalController, NavParams } from 'ionic-angular';
import { PatientsPage } from '../patients/patients';
import { SendAlertPage } from '../sendalert/sendalert';
import { HomePage } from '../home/home';
import { RightMenuPage } from '../rightmenu/rightmenu';
import { ManagePatientsPage } from '../managepatients/managepatients';
import { EditListPage } from '../editlist/editlist';
import { LoginPage } from '../login/login';
import { CernerService } from '../../_services/cernerProvider';
import { CalendarComponent } from "ionic2-calendar/calendar";
import { Helper } from '../../_services/helperService';
import { AuthenticationService } from '../../_services/authentication';
import { PatientModalPage } from './patient-modal';
import { MapperService } from '../../_services/mapper';
import { DataService } from '../../_services/data-service';
import { Template, Indicator, Group, GroupToggle } from '../../models/models';
import { IonicPage } from 'ionic-angular/navigation/ionic-page';
import { HttpService } from '../../_services/http-service';
@Component({
  selector: 'page-appointments',
  templateUrl: 'appointments.html'
})
export class AppointmentsPage {
  public userName = localStorage.getItem('userName');
  @ViewChild(CalendarComponent) appointmentsCalendar: CalendarComponent;
  eventSource = [];
  viewTitle;
  isToday: boolean;
  appointments = [];
  newAppointment = new Appointment('Appointment', { reference: null }, 'proposed', []);
  startTime: any;
  members = [];
  challenges: any;
  endTime: any;
  patientRef: any;
  practitionerRef: any;
  description: any;
  allPatients = [];
  slots = [];
  // bio: any;
  selectedSlot: any;
  alertInfo = new Info(null, null, []);
  receiverInfoList = [];
  selectedPatient = {
    name: null,
    ref: null
  };
  tempSlots = [];
  homePatient: any;
  calendar = {
    mode: 'month',
    currentDate: new Date("01-01-2012")
  };
  templates: Array<Template>;
  indicators: Array<Indicator>;
  selected_template: string;
  selected_group: string;
  group: Group;
  challenge: any;
  template: Template;
  // public group_toggle: Array<GroupToggle>;
  currentChallenge: any;
  constructor(
    public navCtrl: NavController,
    public modalCtrl: ModalController,
    public navParams: NavParams,
    public cernerService: CernerService,
    private helper: Helper,
    private authenticationService: AuthenticationService,
    public dataService: DataService,
    public mapper: MapperService,
    public httpService: HttpService
  ) {
    let profile = this.dataService.getUserProfile();
    this.userName = profile.firstName + ' ' + profile.lastName;
    if (this.navParams.data.patient) {
      this.homePatient = this.navParams.data.patient;
      this.selectedPatient.name = this.homePatient.profile.firstName + " " + this.homePatient.profile.lastName;
      this.selectedPatient.ref = 'Patient/' + this.homePatient.cernerId;
      console.log(this.selectedPatient);
    }
  }

  ngOnInit() {
    try {
      this.helper.showLoading();
      if (localStorage.getItem('EHRprovider') === 'Cerner') {
        this.authenticationService.checkEHRLoginState()
          .then(_ => {
            this.getInitialData();
          }).catch(e => {
            this.helper.hideLoading();
            this.helper.showAlert("User unauthorized.", '');
            this.navCtrl.setRoot(LoginPage);
          });
      } else {
        this.getInitialData();
      }
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
    this.selectChallenge();
    this.addNextAppointment();

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

  loadData() {
    let promises = [];
    promises.push(this.loadAppointments());
    promises.push(this.getSlots());
    return Promise.all(promises);
  }

  fetchGroupData() {
    this.getMembers(this.challenge.campaignInfo.circleInfo.id, this.challenge.creatorId)
      .then(_ => {
        console.log(this.members);
        this.loadData().then(_ => {
          console.log(this.slots);
          this.helper.hideLoading();
        });
      });
  }

  getMembers(circleId, creatorId) {
    return new Promise((resolve, reject) => {
      this.members = [];
      this.httpService.get('circles/' + circleId + '/members')
        .subscribe(_members => {
          let members = _members.info;
          members.forEach((member, index, a) => {
            if (member.invitationState === 'accept' && member.memberId !== creatorId) {
              this.getBio(member.memberId)
                .then((bio: any) => {
                  this.mapper.getCernerId(bio.email, bio.cell)
                    .then((id: string) => {
                      // if (id !== null) {
                      let _patient = { profile: member, bio: bio, cernerId: id };
                      this.members.push(_patient);
                      if (index === members.length - 1) {
                        resolve();
                      }
                    });
                });
            } else if (index === members.length - 1) {
              resolve();
            }
          });
        });
    });
  }


  loadAppointments() {
    return new Promise((resolve) => {
      let patientsRef;
      if (this.members.length == 0) {
        resolve();
        // this.helper.hideLoading();
        return;
      }
      if (this.members.length > 1) {
        this.members.forEach((member, i, a) => {
          if (member.cernerId !== null) {
            if (i == 0 || patientsRef == undefined || patientsRef == null) {
              patientsRef = member.cernerId;
            } else {
              patientsRef = patientsRef + "," + member.cernerId;
            }
          }
        });
      } else {
        if (this.members[0].cernerId !== null) {
          patientsRef = this.members[0].cernerId;
        }
      }

      if (patientsRef === null || patientsRef === undefined) {
        resolve();
        return;
      }

      this.cernerService.getAppointments(patientsRef).subscribe(result => {
        let res = result.json();
        if (res.total == 0) {
          resolve();
          // this.helper.hideLoading();
          return;
        }
        const appointments = (result.json()).entry;
        console.log(appointments);
        this.loadEvents(appointments).then(_ => {
          resolve();
        });
      }, error => {
        this.helper.hideLoading();
        this.helper.showAlert('Failed to get appointments', 'Failed');
      });

    });
  }

  getSlots() {
    this.cernerService.getSlots().subscribe(result => {
      this.slots = (result.json()).entry;
      this.slots.forEach(slot => {
        slot.resource.start = new Date(slot.resource.start);
        slot.resource.end = new Date(slot.resource.end);
      });
    }, error => {
      this.helper.hideLoading();
      this.helper.showAlert('Failed to get Slots.', 'Failed');
    });
  }

  loadEvents(appointments) {
    return new Promise((resolve) => {
      this.eventSource = [];
      this.getEventSource(appointments).then(r => {
        this.appointmentsCalendar.loadEvents();
        resolve();
      });
    });
  }

  getEventSource(appointments) {
    return new Promise((resolve, reject) => {
      appointments.forEach((appointment, index, array) => {
        this.getParticipants(appointment).then(eventParticipant => {
          const start = new Date(appointment.resource.start);
          const end = new Date(appointment.resource.end);
          this.eventSource.push(new Event(appointment.resource.description, start, end, false, eventParticipant));
        });
        if (index == array.length - 1) {
          resolve('ok');
        }
      });
    });
  }

  getParticipants(appointment) {
    return new Promise((resolve, reject) => {
      const eventParticipant = [];
      appointment.resource.participant.forEach((participant, index, array) => {
        if ((participant.actor.reference).indexOf('Patient') !== -1) {
          this.cernerService.getPatientByParam(participant.actor.reference)
            .subscribe(result => {
              console.log(result.json());
              const patient = result.json();
              if (patient.name[0].given) {
                eventParticipant.push({
                  id: patient.id,
                  firstName: patient.name[0].given[0],
                  lastName: patient.name[0].family[0]
                });
              }
            }, error => {
              this.helper.hideLoading();
            });
        }
        if (index == array.length - 1) {
          resolve(eventParticipant);
        }
      });
    });
  }

  openPatientSelectModal() {
    let patientModal = this.modalCtrl.create(PatientModalPage,
      { patients: this.members },
      { cssClass: 'appointmentPatientsModal' }
    );
    patientModal.onDidDismiss(patient => {
      if (patient) {
        console.log(patient);
        this.selectedPatient.name = patient.profile.firstName + " " + patient.profile.lastName;
        this.selectedPatient.ref = 'Patient/' + patient.cernerId;
      }
    });
    patientModal.present();
  }

  addAppointment() {
    this.newAppointment.participant = [];
    this.newAppointment.slot.reference = 'Slot/' + this.selectedSlot.resource.id;
    this.newAppointment.participant.push(new Participant({ reference: this.selectedPatient.ref, display: 'PATIENT, TEST' }, 'needs-action'));
    console.log(this.newAppointment);
    this.helper.showLoading();
    this.cernerService.getNewToken().subscribe(r => {
      this.cernerService.postAppointment(this.newAppointment).subscribe(result => {
        console.log(result);
        this.sendAlert().then(r => {
          this.helper.hideLoading();
          this.helper.showAlert('Appointment created successfully', 'Success');
          this.loadAppointments();
        }).catch(e => {
          this.helper.hideLoading();
          this.helper.showAlert('Appointment created successfully, But alert is not sent to the person.', 'Success');
          this.loadAppointments();
        });

      }, error => {
        this.helper.hideLoading();
        this.helper.showAlert('Failed to create appointment', 'Failed.');
        console.log(error);
      });
    }, e => {
      this.helper.showAlert('Session Expired.', 'Signed Out');
      this.navCtrl.setRoot(LoginPage);
    });

  }

  sendAlert() {
    const promise = new Promise((resolve, reject) => {
      this.members.forEach(member => {
        if ((this.selectedPatient.name).indexOf(member.profile.firstName) !== -1) {
          this.receiverInfoList.push(new ReceiverInfo(member.profile.memberId, member.bio.email, member.bio.cell, false));
          console.log(this.receiverInfoList);
          const startdate = new Date(this.selectedSlot.resource.start);
          this.alertInfo.message = 'Your appointment is scheduled on :' + startdate.toLocaleString();
          this.alertInfo.subject = "Come to appointment.";
          const userId = localStorage.getItem('userId');
          this.alertInfo.receiverInfo = this.receiverInfoList;
          this.httpService.post('notification', this.alertInfo)
            .subscribe(result => {
              resolve('OK');
            }, error => {
              reject(error);
            });
        }
      });
    });
    return promise;
  }

  getBio(memberId) {
    const promise = new Promise((resolve, reject) => {
      const link = 'userProfile/' + memberId;
      this.httpService.getMemberProfile(memberId)
        .subscribe(_bio => {
          resolve(_bio.data);
        });
    });
    return promise;
  }

  onInput(event) {

  }

  onViewTitleChanged(title) {
    this.viewTitle = title;
  }
  onEventSelected(event) {
    console.log('Event selected:' + event.startTime + '-' + event.endTime + ',' + event.title);
  }

  onTimeSelected(ev) {
    const appointments = [];
    ev.events.forEach(event => {
      if (event.references.length > 0) {
        event.references.forEach(ref => {
          appointments.push({
            id: ref.id,
            firstName: ref.firstName,
            lastName: ref.lastName
          });
        });
      }
    });
    this.appointments = appointments;
  }
  onCurrentDateChanged(event: Date) {
    var today = new Date();
    today.setHours(0, 0, 0, 0);
    event.setHours(0, 0, 0, 0);
    this.isToday = today.getTime() === event.getTime();
  }

  onRangeChanged(ev) {
    console.log('range changed: startTime: ' + ev.startTime + ', endTime: ' + ev.endTime);
  }
  markDisabled = (date: Date) => {
    var current = new Date();
    current.setHours(0, 0, 0);
    return date < current;
  };


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
    let modal = this.modalCtrl.create(EditListPage);
    modal.present();
  }

  goToManagePatientsPage() {
    this.navCtrl.push(ManagePatientsPage);
  }

}

class Event {
  constructor(
    public title: string,
    public startTime: Date,
    public endTime: Date,
    public allDay: Boolean,
    public references: any
  ) { }
}

class Appointment {
  constructor(
    public resourceType: string,
    public slot: { reference: string },
    public status: string,
    public participant: Array<Participant>
  ) { }
}

class Participant {
  constructor(
    public actor: { reference: string, display: string },
    public status: string
  ) { }
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