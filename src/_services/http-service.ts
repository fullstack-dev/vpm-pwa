import { Injectable } from "@angular/core";
import { Http, Headers, Response, RequestOptions, ResponseContentType } from '@angular/http';
import { Config } from './config';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { DataService } from "./data-service";
import { Injector } from "@angular/core";
import { Helper } from "./helperService";
// import { Observable } from "rxjs/Rx";

@Injectable()
export class HttpService {

  constructor(
    private http: Http,
    private config: Config,
    private dataService: DataService,
    private helper: Helper
  ) {
    // setTimeout(() => {
    //   this.dataService = injector.get(DataService);
    // });
  }

  private getAuthHeaders() {
    let headers = new Headers();
    let authToken = 'Bearer ' + this.dataService.getAuthToken();
    headers.append('Content-type', 'application/json');
    headers.append('Authorization', authToken);
    return headers;
  }

  public get(_url) {
    return this.http.get(this.getUrl(_url), { headers: this.getAuthHeaders() }
    ).map((res: Response) => {
      return res.json();
    });
  }

  public getMemberProfile(memberId) {
    return this.http.get(this.config.APIURL.concat('userProfile/') + memberId, { headers: this.getAuthHeaders() }
    ).map((res: Response) => {
      return res.json();
    });
  }

  public getMemberProfilePic(memberId) {
    return this.http.get(this.config.APIURL.concat('memberProfilePic/') + memberId, { headers: this.getAuthHeaders() }
    ).map((res: Response) => {
      return res.json();
    });
  }

  public getMemberMhiStatus(memberId) {
    return this.http.get(this.config.APIURL.concat('getMHIStatus/') + memberId, { headers: this.getAuthHeaders() }
    ).map((res: Response) => {
      return res.json();
    });
  }

  public getProfile() {
    return this.http.get(this.config.APIURL.concat('userProfile/') + this.dataService.getUserId(), { headers: this.getAuthHeaders() }
    ).map((res: Response) => {
      return res.json();
    });
  }

  public post(_url, body) {
    return this.http.post(this.getUrl(_url), body, { headers: this.getAuthHeaders() }
    ).map((res: Response) => {
      return res.json();
    });
  }

  public postMemberMhi(body) {
    return this.http.post(this.config.APIURL.concat('saveUserMhi/'), body, { headers: this.getAuthHeaders() }
    ).map((res: Response) => {
      return res.json();
    });
  }

  public delete(_url) {
    return this.http.delete(this.getUrl(_url), { headers: this.getAuthHeaders() }
    ).map((res: Response) => {
      return res.json();
    });
  }

  public getUrl(_url): string {
    const url = this.config.APIURL.concat('users/' + this.dataService.getUserId() + '/' + _url);
    return url;
  }

  public serverError(err: any) {
    console.log('server error: ', err);
    this.helper.hideLoading();
    this.helper.showAlert('There is something not right.', 'Server error!');
    // if (err instanceof Response) {
    //   return Observable.throw(err.json().error || 'server error');
    // }
    // return Observable.throw(Observable.throw(err || 'server error'));
  }
}