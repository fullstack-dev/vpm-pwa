import { Pipe, PipeTransform } from '@angular/core';
@Pipe({ name: 'sortAlertBy' })
export class SortAlertByPipe implements PipeTransform {

  transform(records: Array<any>, args?: any): any {
    return records.sort(function (a, b) {
      if (args.by === 'R-H') {
        let redA;
        let redB;
        if (a.patient.statusCount == undefined) {
          redA = 0;
        } else {
          redA = a.patient.statusCount.red;
        }
        if (b.patient.statusCount == undefined) {
          redB = 0;
        } else {
          redB = b.patient.statusCount.red;
        }
        if (redA > redB) {
          return -1;
        }
        if (redA < redB) {
          return 1;
        }
        return 0;
      }
      if (args.by === 'H-R') {
        let redA;
        let redB;
        if (a.patient.statusCount == undefined) {
          redA = 0;
        } else {
          redA = a.patient.statusCount.green;
        }
        if (b.patient.statusCount == undefined) {
          redB = 0;
        } else {
          redB = b.patient.statusCount.green;
        }

        if (redA > redB) {
          return -1;
        }
        if (redA < redB) {
          return 1;
        }
        return 0;
      }
      if (args.by === 'A-Z') {
        let nameA;
        let nameB;
        if (a.patient.profile.firstName == null) {
          nameA = 'z';
        } else {
          nameA = a.patient.profile.firstName.toUpperCase();
        }
        if (b.patient.profile.firstName == null) {
          nameB = 'z';
        } else {
          nameB = b.patient.profile.firstName.toUpperCase();
        }
        if (nameA < nameB) {
          return -1;
        }
        if (nameA > nameB) {
          return 1;
        }
        return 0;
      }
      if (args.by === 'Z-A') {
        let nameA;
        let nameB;
        if (a.patient.profile.firstName == null) {
          nameA = 'z';
        } else {
          nameA = a.patient.profile.firstName.toUpperCase();
        }
        if (b.patient.profile.firstName == null) {
          nameB = 'z';
        } else {
          nameB = b.patient.profile.firstName.toUpperCase();
        }
        if (nameA > nameB) {
          return -1;
        }
        if (nameA < nameB) {
          return 1;
        }
        return 0;
      }

    });
  };
}