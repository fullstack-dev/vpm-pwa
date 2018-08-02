import { Injectable } from "@angular/core";
import { Config } from './config';
import 'rxjs/add/operator/map';
import { Subject } from "rxjs/Subject";
import { I_templates, I_challenges, I_groups } from "./interfaces";
import { Observable } from "rxjs/Observable";
import { Template, Group } from "../models/models";
@Injectable()
export class DataService {
  // subjects
  private _templates = new Subject<I_templates>();
  private _challenges = new Subject<I_challenges>();
  private _groups = new Subject<I_groups>();
  // observers
  $templates = this._templates.asObservable();
  $challenges = this._challenges.asObservable();
  $groups = this._groups.asObservable();
  // properties
  public templates: Array<any>;
  public indicators: Array<any>;
  public challenges: Array<any>;
  public userId: any;
  public userProfile: any;
  public authToken: string;
  public template: Template;
  public challenge: any;
  public group: any;
  public accessToken: string;
  public refreshToken: string;
  public idToken: string;
  public isInitial: boolean = true;
  constructor(
    private config: Config
  ) { }

  initialize() {
    return new Promise((resolve, reject) => {
      if (localStorage.getItem('userId') && localStorage.getItem("authToken")) {
        this.userId = localStorage.getItem('userId');
        this.authToken = localStorage.getItem("authToken");
        resolve();
      } else {
        reject();
      }
    });
  }

  setInitial(value: boolean) {
    this.isInitial = value;
  }

  getInitial(): boolean {
    return this.isInitial;
  }

  loadTemplates() {
    this._templates.next(<I_templates>{ load: true });
  }

  loadGroups() {
    this._groups.next(<I_groups>{ load: true });
  }

  // public getIndicators(template: Template) {
  //   return template.indicatorLst;
  // }

  public makeGroup(template: Template, challenges: Array<any>) {
    return new Promise((resolve) => {
      let _challenges: Array<any> = [];
      challenges.forEach(challenge => {
        if (template.id === challenge.challengeTemplateInfo.id) {
          _challenges.push(challenge);
        }
      });
      this.setGroup(new Group(template, _challenges));
      resolve();
    });
  }

  public setUserProfile(userProfile: any) {
    this.userProfile = userProfile;
  }

  public getUserProfile() {
    return this.userProfile;
  }

  public setUserId(userId: any) {
    this.userId = userId;
  }

  public getUserId() {
    return this.userId;
  }

  public setAccessToken(accessToken: string) {
    this.accessToken = accessToken;
  }

  public getAccessToken(): string {
    return this.accessToken;
  }

  public setRefreshToken(refreshToken: string) {
    this.refreshToken = refreshToken;
  }

  public getRefreshToken(): string {
    return this.refreshToken;
  }

  public setIdToken(idToken: string) {
    this.idToken = idToken;
  }

  public getIdToken(): string {
    return this.idToken;
  }

  public setAuthToken(authToken: string) {
    this.authToken = authToken;
  }

  public getAuthToken() {
    return this.authToken;
  }

  public setTemplate(template: Template) {
    this.template = template;
  }

  public getTemplate() {
    return this.template;
  }

  public setTemplates(templates: any) {
    this.templates = templates;
  }

  public getTemplates() {
    return this.templates;
  }

  public setChallenge(challenge: any) {
    this.challenge = challenge;
  }

  public getChallenge() {
    return this.challenge;
  }

  public setChallenges(challenges: any) {
    this.challenges = challenges;
  }

  public getChallenges() {
    return this.challenges;
  }

  public setGroup(group: any) {
    this.group = group;
  }

  public getGroup() {
    return this.group;
  }

  // public setIndicators(indicators: any) {
  //   this.indicators = indicators;
  // }

  // public getIndicators(indicators: any) {
  //   return this.indicators
  // }
}

