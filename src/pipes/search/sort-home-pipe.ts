import { Pipe, PipeTransform } from '@angular/core';
@Pipe({ name: 'sortHomeBy' })
export class SortHomeByPipe implements PipeTransform {

  transform(records: Array<any>, args?: any): any {
    return records.sort(function (a, b) {
      if (args.by === 'R-H') {
        if (a.mhiStatusList.status === 'RED' && b.mhiStatusList.status === 'GREEN') {
          return 1;
        } else if (a.mhiStatusList.status === 'GREEN' && b.mhiStatusList.status === 'RED') {
          return -1;
        } else {
          return 0;
        }
      }
      if (args.by === 'H-R') {
        if (a.mhiStatusList.status === 'RED' && b.mhiStatusList.status === 'GREEN') {
          return -1;
        } else if (a.mhiStatusList.status === 'GREEN' && b.mhiStatusList.status === 'RED') {
          return 1;
        } else {
          return 0;
        }
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