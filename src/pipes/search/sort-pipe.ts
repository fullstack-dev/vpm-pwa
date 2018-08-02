import { Pipe, PipeTransform } from '@angular/core';
@Pipe({ name: 'sortBy' })
export class SortByPipe implements PipeTransform {

  transform(records: Array<any>, args?: any): any {
    return records.sort(function (a, b) {
      if (args.by === 'R-H') {
        let redA;
        let redB;
        if (a.statusCount == undefined) {
          redA = 0;
        } else {
          redA = a.statusCount.red;
        }
        if (b.statusCount == undefined) {
          redB = 0;
        } else {
          redB = b.statusCount.red;
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
        if (a.statusCount == undefined) {
          redA = 0;
        } else {
          redA = a.statusCount.green;
        }
        if (b.statusCount == undefined) {
          redB = 0;
        } else {
          redB = b.statusCount.green;
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
        if (a.profile.firstName == null) {
          nameA = 'z';
        } else {
          nameA = a.profile.firstName.toUpperCase();
        }
        if (b.profile.firstName == null) {
          nameB = 'z';
        } else {
          nameB = b.profile.firstName.toUpperCase();
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
        if (a.profile.firstName == null) {
          nameA = 'z';
        } else {
          nameA = a.profile.firstName.toUpperCase();
        }
        if (b.profile.firstName == null) {
          nameB = 'z';
        } else {
          nameB = b.profile.firstName.toUpperCase();
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