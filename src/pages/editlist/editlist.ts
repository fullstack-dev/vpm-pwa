import { Component } from '@angular/core';
import { NavController, NavParams, ViewController } from 'ionic-angular';
import { Template } from '../../models/models';

@Component({
  selector: 'page-editlist',
  templateUrl: 'editlist.html'
})
export class EditListPage {

  templates: Array<Template>;
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public viewCtrl: ViewController
  ) {
    this.templates = navParams.data.templates;
  }

  // dismiss(data) {
  //   this.viewCtrl.dismiss(data);
  // }

}