import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { Http, Headers } from '@angular/http';
import { ToastController, Platform } from 'ionic-angular';
import { HomePage } from '../home/home';
import { AuthenticationService } from '../../_services/authentication';
import { JwtHelper } from '../../_services/jwtHelper';
import { Helper } from '../../_services/helperService';
import { AppointmentsPage } from '../appointments/appointments';
import { Config } from '../../_services/config';
import { DataService } from '../../_services/data-service';
import { HttpService } from '../../_services/http-service';
import { CernerService } from '../../_services/cernerProvider';
@Component({
  selector: 'login-home',
  templateUrl: 'login.html'
})
export class LoginPage {
  loading = false;
  cernerActive = false;
  healthwizzActive = false;
  email: any;
  password: any;
  credentials = {
    emailID: this.email,
    password: this.password
  };
  cernerURL = this.config.CERNER_SERVICE_URI + "metadata";
  epicURL = this.config.EPIC_SERVICE_URI + "metadata";

  constructor(
    public navCtrl: NavController,
    private authenticationService: AuthenticationService,
    private helper: Helper,
    private http: Http,
    private config: Config,
    public toastCtrl: ToastController,
    public dataService: DataService,
    public httpService: HttpService,
    private cernerService: CernerService
  ) {
    if (localStorage.getItem('EHRprovider')) {
      let EHRprovider = localStorage.getItem('EHRprovider');
      if (EHRprovider === 'Cerner') {
        this.config.setFhirUri(this.config.CERNER_SERVICE_URI);
        this.config.setFhirClientId(this.config.CERNER_CLIENT_ID);
        this.checkForCode();
      } else if (EHRprovider === 'Epic') {
        this.config.setFhirUri(this.config.EPIC_SERVICE_URI);
        this.config.setFhirClientId(this.config.EPIC_CLIENT_ID);
        this.checkForCode();
      } else {

      }
    } else {

    }

    // FIXME: use below code for oauth with popup;
    // this.authenticationService.checkEHRLoginState()
    //   .then(_ => {
    //     this.authenticationService.checkServerLoginState()
    //       .then(_ => {
    //         this.dataService.setInitial(true);
    //         navCtrl.push(HomePage);
    //       }).catch(e => {
    //         console.log("logging to healthwizz")
    //         this.healthwizzActive = true;
    //         this.cernerActive = false;
    //         this.loading = false;
    //       });
    //   }).catch(e => {
    //    console.log(e);
    //    this.checkForCode();
    //   });
  }

  checkForCode() {
    const url = window.location.href;
    if (url.indexOf('code') !== -1) {
      console.log("getting id token");
      this.helper.showLoading();
      let code;
      const code1 = url.split('code=')[1];
      if (code1.indexOf('login') !== -1) {
        code = code1.split('#/login/')[0];
      } else {
        code = code1;
      }
      this.getIdToken(code);
    } else {
      console.log("Loggin into ehr");
      // this.cerner_auth_login_provider();
    }
  }

  loginToCerner() {
    localStorage.setItem('EHRprovider', 'Cerner');
    this.config.setFhirUri(this.config.CERNER_SERVICE_URI);
    this.config.setFhirClientId(this.config.CERNER_CLIENT_ID);
    this.ehr_auth_login(0, 1, true, this.config.CERNER_SCOPE);
  }
  loginToEpic() {
    localStorage.setItem('EHRprovider', 'Epic');
    this.config.setFhirUri(this.config.EPIC_SERVICE_URI);
    this.config.setFhirClientId(this.config.EPIC_CLIENT_ID);
    this.ehr_auth_login(1, 0, false, this.config.EPIC_SCOPE);
  }
  ehr_auth_login(token_index: number, auth_index: number, include_scope: boolean, scope: string) {
    try {
      this.loading = true;
      this.authenticationService.authorizationCall(this.config.getFhirUri() + 'metadata')
        .subscribe(result => {
          var response = result.json();
          var token_url_p = response.rest[0].security.extension[0].extension[token_index].valueUri;
          localStorage.setItem('token_url_p', token_url_p);
          var authorization_url_p = response.rest[0].security.extension[0].extension[auth_index].valueUri;
          var authenticate_url = authorization_url_p + "?" + "response_type=code&" + "client_id=" + encodeURIComponent(this.config.getFhirClientId()) + "&" + "scope=" + encodeURIComponent(scope) + "&" + "aud=" + encodeURIComponent(this.config.CERNER_SERVICE_URI) + "&" + "redirect_uri=" + encodeURIComponent(this.config.REDIRECT_URI);
          var width = 880;
          var height = 650;
          var left = (screen.width - width) / 2;
          var top = (screen.height - height) / 2;
          var params;
          if (top > 20) {
            top = top - 20;
          }
          params = 'width=' + width + ', height=' + height;
          params += ', top=' + top + ', left=' + left;
          params += 'titlebar=no, location=yes';
          var href = window.open(authenticate_url, '_self', params);
          // FIXME: use below for oauth with popup;
          // this.waitForLogin(href);
        },
        error => {
          console.log("false:", error);
          this.loading = false;
          let toast = this.toastCtrl.create({
            message: 'Server Not Available.\nPlease try again.',
            duration: 2000,
            position: 'middle'
          });
          toast.present(toast);
        });
    } catch (e) {
      alert("something is wrong");
      console.log(e);
    }

  }

  getMetadata() {

  }

  waitForLogin(href) {

    setTimeout(() => {
      if (href) {
        try {
          let link = href.location.href;
          if (link !== undefined && link.indexOf('code') !== -1) {
            href.close();
            let code = link.split('code=')[1];
            this.getIdToken(code);
          } else {
            this.waitForLogin(href);
          }
        } catch (e) {
          alert("something is wrong");
        }
      }
    }, 1000);
  }

  getIdToken(code) {
    var data = "client_id=" + this.config.getFhirClientId() + "&redirect_uri=" + this.config.REDIRECT_URI + "&grant_type=authorization_code" + "&code=" + code;
    var headers = new Headers();
    headers.append('Content-Type', 'application/X-www-form-urlencoded');
    const token_url_p = localStorage.getItem('token_url_p');
    this.http.post(token_url_p, data, { headers: headers }).subscribe((data1) => {
      var result_json = data1.json();
      localStorage.setItem('refreshToken_provider', result_json.refresh_token);
      if (result_json.access_token) {
        this.dataService.setAccessToken(result_json.access_token);
      }
      if (result_json.refresh_token) {
        this.dataService.setRefreshToken(result_json.refresh_token);
      }
      if (result_json.id_token) {
        this.dataService.setIdToken(result_json.id_token);
        const jwtHelper = new JwtHelper();
        const parsedToken = jwtHelper.decodeToken(result_json.id_token);
      }
      // this.credentials.emailID = parsedToken.sub;
      this.dataService.initialize()
        .then(_ => {
          this.autoLogin();
        }).catch(err => {
          this.healthwizzActive = true;
          this.cernerActive = false;
          this.loading = false;
          this.helper.hideLoading();
        });
    }, error => {
      this.helper.hideLoading();
      if ((window.location.href).indexOf('code=') !== -1) {
        window.location.href = window.location.origin;
        return;
      }
      console.log("error", error);
      this.loading = false;
      let toast = this.toastCtrl.create({
        message: 'Server not available.\nPlease try again.',
        duration: 2000,
        position: 'middle'
      });
      toast.present(toast);
    });
  }

  loginToHealthwizz() {
    this.cernerActive = true;
    this.healthwizzActive = false;
  }

  login() {
    this.helper.showLoading();
    this.authenticationService.healthwizzAuthCall(this.credentials)
      .subscribe(result => {
        const response = result.json();
        localStorage.setItem("authToken", response.data.authToken);
        localStorage.setItem("userId", response.data.userId);
        this.dataService.initialize()
          .then(_ => {
            this.httpService.getProfile()
              .subscribe((profile: any) => {
                this.dataService.setUserProfile(profile.data);
                this.dataService.setInitial(true);
                this.navCtrl.push(HomePage);
              });
          }).catch(err => {
            this.helper.hideLoading();
            console.log(err);
          });
      }, error => {
        this.helper.hideLoading();
        const e = error.json();
        this.helper.showAlert(e.message, 'Login Failed');
      });
  }

  autoLogin() {
    this.httpService.getProfile()
      .subscribe((profile: any) => {
        this.dataService.setUserProfile(profile.data);
        this.dataService.setInitial(true);
        this.navCtrl.push(HomePage);
      }, error => {
        this.healthwizzActive = true;
        this.cernerActive = false;
        this.loading = false;
        this.helper.hideLoading();
      });
  }
}
