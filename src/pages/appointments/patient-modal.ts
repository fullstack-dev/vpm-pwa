import { Component, ViewChild } from '@angular/core';
import { NavController, ModalController, NavParams, ViewController } from 'ionic-angular';

import { Helper } from '../../_services/helperService';
import { AuthenticationService } from '../../_services/authentication';

@Component({
    selector: 'page-patient-modal',
    templateUrl: 'patient-modal.html'
})
export class PatientModalPage {
    patients = [];
    filterArgs: any;
    constructor(
        public navParams: NavParams,
        public viewCtrl: ViewController,
        public helper: Helper
    ) {
        this.patients = this.navParams.get('patients');
    }

    getItems(event) {

        console.log(event);
        // this.filterArgs = event.data;
    }

    selectPatient(patient) {
        if (patient.cernerId === null) {
            this.helper.showAlert('Not available for appointments.', '');
            return;
        }
        this.viewCtrl.dismiss(patient);
    }
}