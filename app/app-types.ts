type AppSession={memberId:string;schoolId:string;schoolCode:string;schoolName:string;username:string;displayName:string;isAdmin:boolean;teacherId:string|null;legacyOwner:boolean};
import type {Teacher,Assessment} from './scoring';
import type {RosterInfo} from './roster-ui';
import type {StrengthBundle,PendingStrength} from '../migration/backend/strength-model';
export type {AppSession};
export type AppData={teachers:Teacher[];assessments:Assessment[];rosterInfo:RosterInfo|null;session:AppSession};
export type PendingDraft={assessment:Assessment;teacherName:string;error?:string;server?:Assessment|null};
export type OfflineSnapshot={data:AppData;pending:PendingDraft[];savedAt:string;offlineUntil:string;strengthCache?:Record<string,StrengthBundle>;strengthPending?:PendingStrength[]};
