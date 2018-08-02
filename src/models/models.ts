
export class PatientBo {
  constructor(
    public profile: any,
    public bio: any,
    public mhiStatusList: any,
    public avatar: any,
    public cernerId: string
  ) { }
}
export class PIList {
  constructor(
    public indicator: any,
    public patients: Array<any>
  ) { }
}
export class StatusList {
  constructor(
    public index: number,
    public red: Array<any>,
    public yellow: Array<any>,
    public green: Array<any>,
    public none: Array<any>
  ) { }
}

export class PatientChallengeList {
  constructor(
    public challenges: Array<any>,
    public patient: any //PaientBo
  ) { }
}

export class ChallengePatientList {
  constructor(
    public challenge: any,
    public patients: Array<Patient> //PaientBo
  ) { }
}

export class Patient {
  constructor(
    public profile: any,
    public bio: any,
    public mhiStatusList: any,
    public avatar: any,
    public statusCount: {
      red: number,
      yellow: number,
      green: number
    },
    public otherChallenges: any,
    public isMember: boolean,
    public extId: any
  ) { }
}

export class Externals {
  constructor(
    public externalId: string,
    public externalSystemName: string
  ) { }
}

export class CernerProfile {
  constructor(
    public profile: Profile,
    public bio: Bio,
    public avatar: string
  ) { }
}

export class Profile {
  constructor(
    public firstName: string,
    public lastName: string,
    public href: string,
    public id: string
  ) { }
}

export class Bio {
  constructor(
    public firstName: string,
    public lastName: string,
    public cell: string,
    public email: string,
    public gender: string,
    public dob: string
  ) { }
}

export class Template {
  constructor(
    public challengeTemplateType: string,
    public description: string,
    public id: string,
    public indicatorLst: Array<Indicator>,
    public name: string
  ) { }
}

export class Indicator {
  constructor(
    public code: string,
    public isCalculable: boolean
  ) { }
}

export class New_Challenge {
  constructor(
    public name: string,
    public description: string,
    public startDate: string,
    public endDate: string,
    public challengeScope: string,
    public challengeType: Challenge_Type,
    public challengeTemplateInfo: Template
  ) { }
}

export class Challenge_Type {
  constructor(
    public name: string,
    public description: string
  ) { }
}

export class Group {
  constructor(
    public template: Template,
    public challenges: Array<any>
  ) { }
}

export class GroupToggle {
  constructor(
    public value: boolean,
    public challenge: any
  ) { }
}