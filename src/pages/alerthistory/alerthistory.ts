import { Component } from '@angular/core';
import { NavController, ModalController } from 'ionic-angular';

import { HomePage } from '../home/home';
import { PatientsPage } from '../patients/patients';
import { SendAlertPage } from '../sendalert/sendalert';
import { AppointmentsPage } from '../appointments/appointments';
import { RightMenuPage } from '../rightmenu/rightmenu';
import { ManagePatientsPage } from '../managepatients/managepatients';
import { EditListPage } from '../editlist/editlist';
import { LoginPage } from '../login/login';


@Component({
    selector: 'page-alerthistory',
    templateUrl: 'alerthistory.html'
})
export class AlertHistoryPage {
    public userName = localStorage.getItem('userName');
    constructor(
        public navCtrl: NavController,
        public modalCtrl: ModalController) {

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
        let modal = this.modalCtrl.create(EditListPage);
        modal.present();
    }

    goToManagePatientsPage() {
        this.navCtrl.push(ManagePatientsPage);
    }

    goToPatientListItemPage() {
        this.navCtrl.pop();
    }

}