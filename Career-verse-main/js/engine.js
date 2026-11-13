// Logika murni game: status, keseimbangan, skor, dan progres karier.
const SAVE_KEY = 'career-verse-save';
export function createState(){return {screen:'home',workdayMode:'full',professionId:null,companyId:null,employed:false,day:1,energy:90,stress:12,reputation:10,internal:12,money:1200000,skill:1,satisfaction:55,tasksDone:0,xp:0,relationship:30,salary:0,level:'Intern',history:[],achievements:[],event:null,lastResult:null};}
export function clamp(value,min,max){return Math.max(min,Math.min(max,Number(value)||0));}
export function loadGame(){try{return {...createState(),...JSON.parse(localStorage.getItem(SAVE_KEY)||'{}')};}catch{return createState();}}
export function saveGame(state){try{localStorage.setItem(SAVE_KEY,JSON.stringify(state));return true;}catch{return false;}}
export function acceptanceChance(state,company,profession){const fit=company?.roles?.includes(profession?.id)?1:0;return Math.round(clamp(25+fit*30+clamp(state.skill||1,1,10)*2+clamp(state.reputation||0,0,100)*.15+clamp(state.relationship||0,0,100)*.1,5,95));}
export function evaluateTask(baseScore,state){const fatigue=state.energy<25?12:state.energy<45?6:0;const stressPenalty=state.stress>80?10:state.stress>60?5:0;const score=Math.round(clamp(baseScore-fatigue-stressPenalty+(state.skill||1)*.7,0,100));return {score,energy:score>=80?-7:score>=55?-10:-13,stress:score>=80?2:score>=55?5:9,rep:score>=85?4:score>=65?2:score<40?-1:0,internal:score>=75?3:0,xp:score>=80?30:score>=55?20:12};}
export function salaryFor(base,levelIndex=0,multiplier=1){return Math.round(base*(1+Math.max(0,levelIndex)*.18)*multiplier/1000)*1000;}
export function xpToNextLevel(level){return 100+Math.max(0,level-1)*40;}
export function canPromote(state,profession){const ladder=profession?.careerLadder||[];const i=ladder.indexOf(state.level);return i>=0&&i<ladder.length-1&&state.tasksDone>=8&&state.skill>=2.5&&state.internal>=50;}
export function formatMoney(value){return new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',maximumFractionDigits:0}).format(value||0);}
