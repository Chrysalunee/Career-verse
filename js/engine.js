export function createState(){return {screen:'home',professionId:null,companyId:null,employed:false,day:1,energy:90,stress:12,reputation:10,internal:10,money:0,skill:1,satisfaction:55,tasksDone:0,history:[]};}
export function loadGame(){try{return {...createState(),...JSON.parse(localStorage.getItem('career-verse-save')||'{}')};}catch{return createState();}}
export function saveGame(state){try{localStorage.setItem('career-verse-save',JSON.stringify(state));}catch{/* Penyimpanan browser bisa dinonaktifkan. */}}
export function clamp(value,min,max){return Math.max(min,Math.min(max,value));}
export function acceptanceChance(state,company,profession){const fit=company.roles.includes(profession.id)?1:0;const skill=Math.min(state.skill||1,10)/10;const rep=(state.reputation||10)/100;return Math.round(clamp(25+fit*30+skill*25+rep*20,5,95));}
export function evaluateTask(score,state){const energy=score>=80?-7:-10;const stress=(state.stress||0)>65?8:score>=75?2:6;return {score,energy,stress,rep:score>=80?4:score>=60?2:-1,internal:score>=75?3:0};}
export function salaryFor(base,levelIndex=0,multiplier=1){return Math.round(base*(1+levelIndex*.18)*multiplier/1000)*1000;}
