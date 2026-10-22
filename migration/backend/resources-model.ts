export type EvidenceModule='strength'|'management'|'achievement'|'standard4';
export const evidenceModules:EvidenceModule[]=['strength','management','achievement','standard4'];
export const evidenceModuleLabels:Record<EvidenceModule,string>={strength:'Evidens Kekuatan Kami',management:'Evidens Pengurusan Kami',achievement:'Evidens Pencapaian Kami',standard4:'Evidens Standard 4 — Pencerapan'};
export type DriveSettings={revision:number;folderUrl:string;moduleFolders?:Partial<Record<EvidenceModule,string>>;clientId:string;apiKey:string;projectNumber:string;updatedAt:string|null};
export const evidenceFolder=(settings:DriveSettings,module:EvidenceModule)=>settings.moduleFolders?.[module]||settings.folderUrl||'';
export const googleConnectionReady=(settings:DriveSettings)=>!!(settings.clientId&&settings.apiKey&&settings.projectNumber);
export type AchievementPSS={id:string;standard:string;title:string;memberIds:string[]};
