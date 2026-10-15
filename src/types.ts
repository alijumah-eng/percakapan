export interface Lesson {id:string;title:string;arabic:string;goal:string;icon:string;level:string;minutes:number;lines:{speaker:string;arabic:string;latin:string;meaning:string}[];vocabulary:{arabic:string;meaning:string}[];note:string;quiz:{id:string;prompt:string;options:string[]}[]}
export type Progress=Record<string,{completed?:boolean;score?:number;updatedAt?:string}>;
export interface QuizResult {score:number;results:{id:string;correct:boolean;answer:number;explanation:string}[]}
