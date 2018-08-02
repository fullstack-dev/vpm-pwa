import { Injectable } from "@angular/core";
import { LoadingController, AlertController } from 'ionic-angular';
import xml2js from 'xml2js'
import { DataService } from "./data-service";

function _window(): any {
  return window;
}
@Injectable()
export class Helper {
  public loading;
  constructor(
    public loadingCtrl: LoadingController,
    private alertCtrl: AlertController
  ) {

  }

  get window(): any {
    return _window();
  }

  public showLoading() {
    this.loading = this.loadingCtrl.create({
      content: 'Please wait...',
      spinner: 'bubbles'
    });
    this.loading.present();
  }

  public hideLoading() {
    if (this.loading) {
      this.loading.dismiss();
    }
  }

  public showAlert(message: string, title: string) {
    let alert = this.alertCtrl.create({
      title: title,
      message: message,
      buttons: [{
        text: 'OK',
        handler: () => {
          alert.dismiss();
          return false;
        }
      }]
    });
    alert.present();
  }

  public showConfirm(title, message, positiveBtnText, negativeBtnText) {
    const promise = new Promise((resolve, reject) => {
      let confirm = this.alertCtrl.create({
        title: title,
        message: message,
        buttons: [
          {
            text: negativeBtnText,
            handler: () => {
              reject('CANCEL');
            }
          },
          {
            text: positiveBtnText,
            handler: () => {
              resolve('OK');
            }
          }
        ]
      });
      confirm.present();
    });
    return promise;
  }

  public getTimeDifference(old_time: number) {
    var d = new Date();
    var n = d.getTime();
    let difference = "";
    var updatedDate = n - old_time;
    var daysDifference = Math.floor(updatedDate / 1000 / 60 / 60 / 24);
    var hoursDifference = Math.floor(updatedDate / 1000 / 60 / 60);
    var minutesDifference = Math.floor(updatedDate / 1000 / 60);
    var secondsDifference = Math.floor(updatedDate / 1000);

    if (daysDifference > 0 && daysDifference < 31) {
      if (daysDifference == 1)
        difference = daysDifference + ' day ago';
      else
        difference = daysDifference + ' days ago';
    } else if (daysDifference >= 31) {
      daysDifference = daysDifference % 30;
      if (daysDifference > 1)
        difference = daysDifference + ' months ago';
      else
        difference = daysDifference + ' month ago';
    } else {
      if (hoursDifference > 0) {
        if (hoursDifference == 1)
          difference = hoursDifference + ' hour ago';
        else
          difference = hoursDifference + ' hours ago';
      } else {
        if (minutesDifference > 0) {
          if (minutesDifference == 1)
            difference = minutesDifference + ' minute ago';
          else
            difference = minutesDifference + ' minutes ago';
        } else {
          if (secondsDifference > 0) {
            if (secondsDifference == 1)
              difference = secondsDifference + ' second ago';
            else
              difference = secondsDifference + ' seconds ago';
          }
        }
      }
    }
    return difference;
  }

  public transformToJson(data: string) {
    let res;
    xml2js.parseString(data, { explicitArray: false }, (err, result) => {
      if (err) {
        throw new Error(err);
      } else {
        res = result;
      }
    });
    return res;
  }
}
