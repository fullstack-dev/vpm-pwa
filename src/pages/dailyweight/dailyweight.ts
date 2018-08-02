import { Component, ViewChild } from '@angular/core';
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
    selector: 'page-dailyweight',
    templateUrl: 'dailyweight.html'
})

export class DailyWeightPage {
    public userName = localStorage.getItem('userName');
    @ViewChild('smileCanvas') smileCanvas;
    smileHeight: number = 250;
    unitNumber: number = 50;

    property_number = [269, 347, 426, 300, 284, 220, 249, 265, 290, 320, 355, 463, 485, 325, 286, 247, 215, 169, 270, 370, 468, 666, 762, 760, 657, 600, 554, 453];

    constructor(
        public navCtrl: NavController,
        public modalCtrl: ModalController) {

    }

    ngAfterViewInit() {

        this.drawVerticalLine();
        this.drawPoint();
        this.drawArc();
    }

    drawSmile() {

        let ctx = this.smileCanvas.nativeElement.getContext('2d');
        ctx.beginPath();
        ctx.moveTo(20, 150);
        ctx.bezierCurveTo(20, this.smileHeight, 230, this.smileHeight, 230, 150);
        ctx.lineWidth = 2;
        ctx.strokeStyle = 'black';
        ctx.stroke();

    }

    drawVerticalLine() { // draw vertical line
        let ctx = this.smileCanvas.nativeElement.getContext('2d');
        ctx.beginPath();
        for (var i = 0; i <= this.property_number.length * this.unitNumber; i += this.unitNumber) {
            ctx.moveTo(i, 0);
            ctx.lineTo(i, 800);
        }
        ctx.lineWidth = 1;
        ctx.strokeStyle = "#EFEFF4";
        ctx.stroke();
    }

    drawPoint() { // coordinator put and value
        let ctx = this.smileCanvas.nativeElement.getContext('2d');

        for (var i = 0; i <= this.property_number.length; i++) {
            ctx.beginPath();
            ctx.arc(this.unitNumber * i, 900 - this.property_number[i], 5, 0, 2 * Math.PI, false);
            ctx.fillStyle = 'gray';
            ctx.fill();


            ctx.textAlign = "center";
            ctx.fillStyle = 'black';
            ctx.fillText(i.toString(), this.unitNumber * i + 10, 10);
            ctx.fillText(this.property_number[i], this.unitNumber * i + 10, 900 - this.property_number[i] - 10);//coordinator value text
        }
    }

    drawArc() { // draw graph
        let ctx = this.smileCanvas.nativeElement.getContext('2d');

        ctx.moveTo(0, 900 - this.property_number[0]);

        for (var i = 0; i < this.property_number.length; i++) {

            var x_mid = (this.unitNumber * i + this.unitNumber * (i + 1)) / 2;
            var y_mid = (900 - this.property_number[i] + 900 - this.property_number[i + 1]) / 2;
            var cp_x1 = (x_mid + this.unitNumber * i) / 2;
            var cp_y1 = (y_mid + 900 - this.property_number[i]) / 2;
            var cp_x2 = (x_mid + this.unitNumber * (i + 1)) / 2;
            var cp_y2 = (y_mid + 900 - this.property_number[i + 1]) / 2;

            ctx.quadraticCurveTo(cp_x1, 900 - this.property_number[i], x_mid, y_mid);
            ctx.quadraticCurveTo(cp_x2, 900 - this.property_number[i + 1], this.unitNumber * (i + 1), 900 - this.property_number[i + 1]);

            // ctx.beginPath();
            // ctx.moveTo(this.unitNumber * i, 900 - this.property_number[i]);
            // ctx.lineTo(this.unitNumber * (i + 1), 900 - this.property_number[i + 1]);
            // // ctx.bezierCurveTo(20, this.smileHeight, 230, this.smileHeight, 230, 150);
            ctx.lineWidth = 1;
            ctx.strokeStyle = '#48C5CD';
            ctx.stroke();
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
        let modal = this.modalCtrl.create(EditListPage);
        modal.present();
    }

    goToManagePatientsPage() {
        this.navCtrl.push(ManagePatientsPage);
    }

    goToCHFHistoryPage() {
        this.navCtrl.pop();
    }

}