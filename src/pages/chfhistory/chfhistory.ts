import { Component } from '@angular/core';
import { NavController, ModalController, NavParams } from 'ionic-angular';

import { HomePage } from '../home/home';
import { PatientsPage } from '../patients/patients';
import { SendAlertPage } from '../sendalert/sendalert';
import { AppointmentsPage } from '../appointments/appointments';
import { RightMenuPage } from '../rightmenu/rightmenu';
import { ManagePatientsPage } from '../managepatients/managepatients';
import { DailyWeightPage } from '../dailyweight/dailyweight';
import { EditListPage } from '../editlist/editlist';
import { LoginPage } from '../login/login';

@Component({
	selector: 'page-chfhistory',
	templateUrl: 'chfhistory.html'
})

export class CHFHistoryPage {
	public userName = localStorage.getItem('userName');
	patient: any;
	property_titles = [
		{ title: "Daily Weight" },
		{ title: "Leg Swelling" },
		{ title: "Breath Rate" },
		{ title: "Pulse" },
		{ title: "Oxygen Saturation" },
		{ title: "Low Salt Diet" },
		{ title: "Fluid Restriction" },
		{ title: "Meds Taken As Advised" },
		{ title: "Next Appointment" }
	];

	patients = [
		{ property: "262 lbs", timespan: "22 Aug 11:08 P.M" },

		{ property: "+++", timespan: "22 Aug 11:08 P.M" },

		{ property: "23", timespan: "22 Aug 11:08 P.M" },

		{ property: "99", timespan: "22 Aug 11:08 P.M" },

		{ property: "80", timespan: "22 Aug 11:08 P.M" },

		{ property: "No", timespan: "22 Aug 11:08 P.M" },

		{ property: "No", timespan: "22 Aug 11:08 P.M" },

		{ property: "No", timespan: "22 Aug 11:08 P.M" },

		{ property: "", timespan: "OCT 2, 2017" }
	];

	constructor(
		public navCtrl: NavController,
		public navParams: NavParams,
		public modalCtrl: ModalController
	) {
		this.patient = this.navParams.data.patient;
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

	goToDailyWeightPage() {
		this.navCtrl.push(DailyWeightPage);
	}
}