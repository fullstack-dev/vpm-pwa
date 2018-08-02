import { Injectable } from '@angular/core';
import { Http, Headers, Response, RequestOptions, ResponseContentType } from '@angular/http';
import 'rxjs/add/operator/map';
import { Config } from './config';
import { Helper } from './helperService';
import { DataService } from './data-service';
import { HttpService } from './http-service';
import { CernerService } from './cernerProvider';

@Injectable()
export class AuthenticationService {
  constructor(
    private http: Http,
    private config: Config,
    private helper: Helper,
    private dataService: DataService,
    private httpService: HttpService,
    private cernerService: CernerService
  ) { }

  authorizationCall(link: string) {
    let headers = new Headers();
    headers.append('Accept', 'application/json+fhir');
    return this.http.get(link, { headers: headers }
    ).map((response: Response) => {
      return response;
    })
  }

  checkEHRLoginState() {
    return new Promise((resolve, reject) => {
      if (localStorage.getItem('EHRprovider')) {
        let EHRprovider = localStorage.getItem('EHRprovider');
        if (EHRprovider === 'Cerner') {
          this.config.setFhirUri(this.config.CERNER_SERVICE_URI);
          this.config.setFhirClientId(this.config.CERNER_CLIENT_ID);
          this.validateToken().then(_ => {
            resolve();
          }).catch(e => {
            reject('ehr');
          });
        } else if (EHRprovider === 'Epic') {
          this.config.setFhirUri(this.config.EPIC_SERVICE_URI);
          this.config.setFhirClientId(this.config.EPIC_CLIENT_ID);
          this.validateToken().then(_ => {
            resolve();
          }).catch(e => {
            reject(e);
          });
        } else {
          reject('ehr')
        }
      } else {
        reject('ehr');
      }
    });
  }

  validateToken() {
    return new Promise((resolve, reject) => {
      console.log(localStorage.getItem('refreshToken_provider'));
      if (localStorage.getItem('refreshToken_provider') != undefined || localStorage.getItem('refreshToken_provider') != '') {
        this.cernerService.getNewToken()
          .subscribe(res => {
            this.dataService.setAccessToken(res.access_token);
            resolve();
          }, err => {
            reject('ehr');
          });
      } else {
        reject('token');
      }
    });
  }

  checkServerLoginState() {
    return new Promise((resolve, reject) => {
      this.dataService.initialize().then(_ => {
        this.httpService.getProfile()
          .subscribe((profile: any) => {
            this.dataService.setUserProfile(profile.data);

            resolve();
          }, error => {
            // FIXME: user logged in but some error is there, can retry getting profile.
            reject('server');
          });
      }).catch(err => {
        reject('server');
      });
    });
  }

  // getPatient(link: string, accessToken: string) {
  //   return this.http.get(link, { headers: this.getHeadersPatients(accessToken) }
  //   ).map((response: Response) => {
  //     return response;
  //   }, error => {
  //     this.helper.hideLoading();
  //   })
  // }

  // private getHeadersPatients(accessToken: string) {
  //   let headers = new Headers();
  //   headers.append('authorization', "Bearer " + accessToken);
  //   return headers;
  // }

  // private getHeadersHealthwizz() {
  //   const headers = new Headers();
  //   var authToken = 'Bearer ' + localStorage.getItem('authToken');
  //   headers.append('Content-type', 'application/json');
  //   headers.append('Authorization', authToken);
  //   return headers;
  // }

  public healthwizzAuthCall(credentials: any) {
    let headers = new Headers();
    headers.append('Content-type', 'application/json');
    return this.http.post(this.config.APIURL + 'authenticate', JSON.stringify(credentials), { headers: headers })
      .map((response: Response) => {
        return response;
      }, error => {
        this.helper.hideLoading();
      });
  }

  // public healthwizzApiPostCall(link: any, data: any) {
  //   var token = localStorage.getItem('authToken');
  //   var authToken = 'Bearer ' + token;
  //   let headers = new Headers();
  //   headers.append('Content-type', 'application/json');
  //   headers.append("Authorization", authToken);
  //   return this.http.post(this.config.APIURL + link, JSON.stringify(data), { headers: headers })
  //     .map((response: Response) => {
  //       return response;
  //     }, error => {
  //       this.helper.hideLoading();
  //     })
  // }

  // public healthwizzApiCall(link: string) {
  //   if (localStorage.getItem('authToken')) {
  //     var token = localStorage.getItem('authToken');
  //     var authToken = 'Bearer ' + token;
  //     var headers = new Headers();
  //     headers.append('Content-Type', 'application/json');
  //     headers.append("Authorization", authToken);
  //     return this.http.get(this.config.APIURL + link, { headers: headers })
  //       .map((response: Response) => {
  //         return response;
  //       }, error => {
  //         this.helper.hideLoading();
  //         console.error(error);
  //       });
  //   }
  // }

  // public healthwizzApiDeleteCall(link: string) {

  //   if (localStorage.getItem('authToken')) {
  //     var token = localStorage.getItem('authToken');
  //     var authToken = 'Bearer ' + token;
  //     var headers = new Headers();
  //     headers.append('Content-Type', 'application/json');
  //     headers.append("Authorization", authToken);
  //     return this.http.delete(this.config.APIURL + link, { headers: headers })
  //       .map((response: Response) => {
  //         return response;
  //       }, error => {
  //         this.helper.hideLoading();
  //         console.error(error);
  //       });
  //   }
  // }

  // public getProfilePic(link: string) {
  //   const authHeader = 'Bearer ' + localStorage.getItem('authToken');
  //   const headers = new Headers();
  //   headers.append('Accept', 'application/json');
  //   headers.append('Content-Type', 'application/json');
  //   headers.append('Authorization', authHeader);
  //   let requestOptions = new RequestOptions({
  //     headers: headers,
  //     responseType: ResponseContentType.Blob,
  //   });

  //   return this.http.get(this.config.APIURL + link, requestOptions)
  //     .map((res) => {
  //       return new Blob([res.blob()], { type: "application/octet-stream" });
  //     });
  // }

  // public sendAlert(link: string, body: any) {
  //   return this.http.post(this.config.APIURL + link, body, { headers: this.getHeadersHealthwizz() })
  //     .map((response: Response) => {
  //       return response;
  //     }, error => {
  //       console.error(error);
  //       this.helper.hideLoading();
  //     })
  // }

  // public getChallenges() {
  //   const link = 'users/' + localStorage.getItem('userId') + '/challenges';
  //   const headers = this.getHeadersHealthwizz();
  //   return this.http.get(this.config.APIURL + link, { headers: headers })
  //     .map((response: Response) => {
  //       return response;
  //     }, error => {
  //       this.helper.hideLoading();
  //       console.error(error);
  //     });
  // }

  // public getDemoChallenges() {
  //   return this.demoChallenges;
  // }
}