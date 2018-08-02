import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController } from 'ionic-angular';
import { HttpService } from '../../_services/http-service';
import { Template, New_Challenge } from '../../models/models';
import { Helper } from '../../_services/helperService';
import { DeleteGroupPage } from '../delete-group/delete-group';
import { DataService } from '../../_services/data-service';
@IonicPage()
@Component({
  selector: 'page-edit-group',
  templateUrl: 'edit-group.html',
})
export class EditGroupPage {
  private userId = localStorage.getItem('userId');
  templates: Array<Template>
  // TODO: make a Challenge class
  challenges: Array<any>;
  group_name: string;
  // TODO: make selected_template to Template type
  selected_template: Template
  new_challenge: New_Challenge
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public http: HttpService,
    public helper: Helper,
    public modalCtrl: ModalController,
    public dataService: DataService
  ) {
    this.challenges = [];
    this.templates = navParams.data.templates;
    // Only show SYSTEM type templates
    navParams.data.challenges.forEach(challenge => {
      if (challenge.challengeTemplateInfo.challengeTemplateType === 'SYSTEM') {
        this.challenges.push(challenge);
      }
    });
  }

  createChallenge(template: Template) {
    if (this.group_name == undefined) {
      this.helper.showAlert('Please provide a group name.', 'Empty name!');
      return;
    }

    if (template == undefined) {
      template = this.templates[0];
    }
    const d = new Date();
    const m = d.getMonth() ? d.getMonth() > 0 : d.getMonth() + 1;
    const data = {
      name: this.group_name,
      description: "Template for Health Wizz.",
      startDate: (m + '/' + d.getDate() + '/' + d.getFullYear()),
      endDate: (m + '/' + d.getDate() + '/' + (d.getFullYear() + 5)),
      challengeScope: "noInvite",
      challengeType: {
        name: "INDICATOR_BASED",
        description: ""
      },
      challengeTemplateInfo: template
    }
    this.new_challenge = data;
    console.log(this.new_challenge);
    this.helper.showLoading();
    this.http.post('challenges', this.new_challenge)
      .subscribe(created => {
        console.log(created);
        this.group_name = "";
        this.challenges.push(created);
        this.helper.hideLoading();
        this.dataService.loadGroups();
      }, err => {
        console.log(err);
      });
  }

  deleteGroup(challenge, index) {
    let deleteModel = this.modalCtrl.create(DeleteGroupPage, {
      challenge: challenge
    }, {
        cssClass: 'deleteGroupModal'
      });
    deleteModel.onDidDismiss(isDeleted => {
      if (isDeleted == true) {
        this.dataService.loadGroups();
        this.challenges.splice(index, 1);
      }
    });
    deleteModel.present();
  }
}
