import { Component } from '@angular/core';
import { NavController, ModalController } from 'ionic-angular';

import { PatientsPage } from '../patients/patients';
import { SendAlertPage } from '../sendalert/sendalert';
import { AppointmentsPage } from '../appointments/appointments';
import { HomePage } from '../home/home';
// import { ManagePatientsPage } from '../managepatients/managepatients';
import { EditListPage } from '../editlist/editlist';
import { LoginPage } from '../login/login';
import { AuthenticationService } from '../../_services/authentication';
import { DataService } from '../../_services/data-service';

@Component({
  selector: 'page-rightmenu',
  templateUrl: 'rightmenu.html'
})
export class RightMenuPage {
  public userName = localStorage.getItem('userName');
  newProfile = new Profile(null, null, null);
  name: string;
  email: string;
  challenges: any;
  bio: any;
  constructor(
    public navCtrl: NavController,
    public modalCtrl: ModalController,
    private dataService: DataService
  ) {
    this.bio = this.dataService.getUserProfile();
    this.name = this.bio.firstName.concat(" ").concat(this.bio.lastName);
    this.email = this.bio.email;
  }

  updateProfile() {
    console.log(this.newProfile);
  }

  logout() {
    localStorage.clear();
    this.navCtrl.setRoot(LoginPage);
  }

  cancel() {
    this.navCtrl.pop();
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

  goToEditListPage() {
    let modal = this.modalCtrl.create(EditListPage);
    modal.present();
  }
}

class Profile {
  constructor(
    public password: any,
    public rePassword: any,
    public newPassword: any
  ) { }
}