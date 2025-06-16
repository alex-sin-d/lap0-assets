// =============================================================
//  LAP‑0  –  STRATEGY CENTER (race.js) v1.0
//  Plain ES5 (no arrow functions). Load BEFORE sketch.js.
//  Exposes:
//    • Race(strategies)   – constructor(runnerStrategies) with methods:
//        - tick()        : advance simulation & handle decisions
//        - applyChoice(c): apply last YES/NO choice
//        - findDriver(n) : lookup index by driver name
//    • HUD.init(race)      – initialize HUD with race reference
//    • HUD.draw()          – render lap counter, decision card, feedback banner, and driver stats
// =============================================================

/* -----------------------------------------------------------
   DECISION DEFINITIONS
   Includes static decisions (laps 1–58) and will inject planned-pit prompts
----------------------------------------------------------- */


// Race length
var TOTAL_LAPS = 58;

// Tyre stint lengths (laps)
var stintLen = { soft: 14, medium: 19, hard: 25 };

// Custom starting grid positions
var TOTAL_LAPS = 58;

// Custom starting grid positions
var STARTING_POSITIONS = {
  "PIERRE GASLY": 4,
  "FRANCO COLAPINTO": 9
};

/* -----------------------------------------------------------
   DRIVER CLASS
----------------------------------------------------------- */
function Driver(name, plan) {
  this.name      = name;
  this.tyre      = plan.tyres[0];
  this.nextTyre  = plan.tyres[1];
  this.finalTyre = plan.tyres[2] || null;
  this.twoStop   = plan.twoStop;
  this.pos       = STARTING_POSITIONS[name] || 1;
  this.tyreWear  = 0;    // 0–100 %
  this.battery   = 50;   // 0–100 %
  this.engine    = 100;  // 0–100 %
  this.totalTime = 0;    // seconds
  this.fastestLap = false;
  this.plannedPits = [];
}

Driver.prototype.computeLapTime = function() {
  var base = 90;
  var wearPenalty = this.tyreWear / 20;
  var batteryBonus = this.battery > 50 ? (this.battery - 50) / 50 * 1 : 0;
  var enginePenalty = (100 - this.engine) / 50 * 2;
  var lapTime = base + wearPenalty - batteryBonus + enginePenalty;
  this.totalTime += lapTime;
  return lapTime;
};

Driver.prototype.changeTyreIfNeeded = function(lap) {
  if (this.plannedPits.indexOf(lap) !== -1) {
    this.tyre = this.plannedTyres.shift();
    this.tyreWear = 0;
  }
};

/* -----------------------------------------------------------
   DECISION DEFINITIONS
   Includes static decisions (laps 1–58) and will inject planned-pit prompts
----------------------------------------------------------- */
var staticDecisions = [
  {
    lap: 1,
    prompt: "Lap 1: The lights go out and the field barrels into Turn 1; should Pierre risk a narrow inside move on Tsunoda under heavy braking to gain two positions?",
    bullets: [
      "+2 positions if he threads the needle",
      "30% chance he runs wide and loses four places",
      "Momentum boost for the next stint"
    ],
    yes: { driver: 0, random: [
      { p: 0.7, delta: { pos: -2, tyreWear: 5 }, feedback: { text: "Clean pass! Gained 2 positions.", positive: true } },
      { p: 0.3, delta: { pos: 4 }, feedback: { text: "Too tight—went wide and dropped 4 positions.", positive: false } }
    ] },
    no: { driver: 0, delta: {}, feedback: { text: "Held position safely.", positive: true } }
  },
  {
    lap: 3,
    prompt: "Lap 3: DRS window opens—should Pierre push to overtake Norris down the long back straight?",
    bullets: [
      "+1 position on a clean pass",
      "20% chance of front-wing damage (-8 km/h top speed)",
      "DRS battery drained by 10%"
    ],
    yes: { driver: 0, random: [
      { p: 0.7, delta: { pos: -1, battery: -10 }, feedback: { text: "Successful DRS pass!", positive: true } },
      { p: 0.2, delta: { engine: -5 }, feedback: { text: "Wing clipped—top speed reduced.", positive: false } },
      { p: 0.1, delta: {}, feedback: { text: "Missed the DRS window.", positive: false } }
    ] },
    no: { driver: 0, delta: { battery: 5 }, feedback: { text: "Conserved battery charge.", positive: true } }
  },
  {
    lap: 10,
    prompt: "Lap 10: Safety Car deployed! Pit now to save ~20s but adjust strategy?",
    bullets: [
      "Save 20s vs green-flag pit",
      "Rejoin mid-pack as many others pit",
      "May need an extra stop later"
    ],
    yes: { driver: 0, delta: { tyreWear: -100, battery: 5 }, feedback: { text: "Pitted under SC; neutral result.", positive: true } },
    no: { driver: 0, delta: {}, delayed: { afterLaps: 5, delta: { pos: 2 } }, feedback: { text: "Stayed out; rivals on fresh rubber passed you.", positive: false } }
  },
  {
    lap: 15,
    prompt: "Lap 15: Tyres at ~70% wear—push hard for two laps?",
    bullets: [
      "+2 positions if successful",
      "Tyre wear rate ×2.5 afterwards",
      "Risk lock-ups under braking"
    ],
    yes: { driver: 0, delta: { pos: -2, tyreWear: 15 }, feedback: { text: "Gained positions but tyres took a beating.", positive: true } },
    no: { driver: 0, delta: {}, feedback: { text: "Conserved tyres for later stints.", positive: true } }
  },
  {
    lap: 18,
    prompt: "Lap 18: Soft compound >60% worn in dirty air—should Pierre ease off to cool them by dropping back 1 place?",
    bullets: [
      "Lose 1 place now to reduce wear rate by 40% for 4 laps",
      "Stay aggressive and tyre wear increases sharply"
    ],
    yes: { driver: 0, delta: { pos: 1 }, feedback: { text: "Cooled tyres; sacrificed one position.", positive: true } },
    no: { driver: 0, delta: { tyreWear: 10 }, feedback: { text: "Tyres suffered heavy wear.", positive: false } }
  },
  {
    lap: 26,
    prompt: "Lap 26: On fresh mediums while cars ahead are on hards—should Pierre go for the overcut?",
    bullets: [
      "+1 position on clean undercut",
      "Engine suffers -5% from push",
      "Tyre wear +15% for next stint"
    ],
    yes: { driver: 0, delta: { pos: -1, battery: -5, tyreWear: 15 }, feedback: { text: "Overcut successful!", positive: true } },
    no: { driver: 0, delta: {}, feedback: { text: "Held position; engine preserved.", positive: true } }
  },
  {
    lap: 28,
    prompt: "Lap 28: Rain expected in one lap—box for intermediates?",
    bullets: [
      "Most competitors will pit too",
      "Stay out on slicks risks a spin"
    ],
    yes: { driver: 1, delta: { tyre: "intermediate", tyreWear: 0 }, feedback: { text: "Pitted for intermediates.", positive: true } },
    no: { driver: 1, random: [ { p: 1, delta: { pos: 10 }, feedback: { text: "Spun out in rain—lost 10 places.", positive: false } } ] }
  },
  {
    lap: 31,
    prompt: "Lap 31: Rain stops—switch back to slicks now?",
    bullets: [
      "Mediums: +0.6s/lap, may need late stop",
      "Hards: -1.2s/lap but likely one-stop"
    ],
    yes: { driver: 1, delta: { tyre: "medium", battery: 5 }, feedback: { text: "Switched to mediums.", positive: true } },
    no: { driver: 1, delta: { tyre: "hard" }, feedback: { text: "Switched to hards.", positive: true } }
  },
  {
    lap: 33,
    prompt: "Lap 33: Cold hards—risk a defensive lock-up to keep position?",
    bullets: [
      "40% chance of flat-spot (+0.3s/lap)",
      "Alternatively, let the car through (-1 position)"
    ],
    yes: { driver: 0, random: [
      { p: 0.4, delta: { tyreWear: 20 }, feedback: { text: "Locked up—tyres flat-spotted.", positive: false } },
      { p: 0.6, delta: { pos: 1 }, feedback: { text: "Let through; tyres stayed clean.", positive: true } }
    ] },
    no: { driver: 0, delta: {}, feedback: { text: "Defended conservatively.", positive: true } }
  },
  {
    lap: 34,
    prompt: "Lap 34: Track drying—pit early for slicks?",
    bullets: [
      "-1 place now, +0.8s/lap next 4 laps",
      "Stay on inters and lap times suffer"
    ],
    yes: { driver: 1, delta: { tyre: "soft", tyreWear: 0 }, feedback: { text: "Switched to slicks.", positive: true } },
    no: { driver: 1, delta: {}, feedback: { text: "Stayed on inters; lost pace.", positive: false } }
  },
  {
    lap: 38,
    prompt: "Lap 38: Team orders—should Colapinto back up the field so Pierre can pit ahead?",
    bullets: [
      "Pierre rejoining ahead (+2 places)",
      "Franco loses two spots"
    ],
    yes: { driver: 1, delta: { pos: 2 }, feedback: { text: "Team orders executed; Pierre benefits.", positive: true } },
    no: { driver: 1, delta: {}, feedback: { text: "No team orders; race status quo.", positive: true } }
  },
  {
    lap: 45,
    prompt: "Lap 45: Another Safety Car—take a cheap second stop?",
    bullets: [
      "Fresh softs +1s/lap to finish",
      "Drop 2 positions now"
    ],
    yes: { driver: 0, delta: { tyreWear: -100, battery: 5 }, feedback: { text: "SC second stop; net gain expected.", positive: true } },
    no: { driver: 0, delta: {}, feedback: { text: "Stayed out; late tyre failure risk.", positive: false } }
  },
  {
    lap: 47,
    prompt: "Lap 47: Virtual Safety Car—cheap softs stop?",
    bullets: [
      "Save ~11s vs green-flag stop",
      "Rejoin on fresh softs"
    ],
    yes: { driver: 1, delta: { tyreWear: -100 }, feedback: { text: "VSC stop completed.", positive: true } },
    no: { driver: 1, delta: {}, feedback: { text: "Skipped VSC stop; softs fading.", positive: false } }
  },
  {
    lap: 49,
    prompt: "Lap 49: Heavy rain—pit again for intermediates?",
    bullets: [
      "+3s/lap in heavy rain on inters",
      "40% spin chance if on slicks"
    ],
    yes: { driver: 0, delta: { tyre: "intermediate", tyreWear: 0 }, feedback: { text: "Pitted for intermediates.", positive: true } },
    no: { driver: 0, random: [ { p: 1, delta: { pos: 5 }, feedback: { text: "Spun in heavy spray.", positive: false } } ] }
  },
  {
    lap: 53,
    prompt: "Lap 53: Tyre wear ≥90%—pit now or risk puncture?",
    bullets: [
      "+25s pit penalty, safe finish",
      "15% puncture risk each lap"
    ],
    yes: { driver: 1, delta: { totalTime: 25 }, feedback: { text: "Pit stop; finished safely.", positive: true } },
    no: { driver: 1, random: [ { p: 0.15, delta: { totalTime: Infinity }, feedback: { text: "Punctured—race over.", positive: false } } ] }
  },
  {
    lap: 55,
    prompt: "Lap 55: Chase the fastest lap now?",
    bullets: [
      "+1 championship point",
      "Tyre wear +15%"
    ],
    yes: { driver: 0, delta: { tyreWear: 15 }, feedback: { text: "Fastest lap achieved!", positive: true } },
    no: { driver: 0, delta: {}, feedback: { text: "Tyres conserved; no point.", positive: true } }
  },
  {
    lap: 57,
    prompt: "Lap 57: Attempt a last-lap dive on Russell?",
    bullets: [
      "40% overtake success (+1 pos)",
      "15% crash risk (DNF)"
    ],
    yes: { driver: 0, random: [
      { p: 0.4, delta: { pos: -1 }, feedback: { text: "Dive successful!", positive: true } },
      { p: 0.15, delta: { totalTime: Infinity }, feedback: { text: "Crash—race over.", positive: false } },
      { p: 0.45, delta: {}, feedback: { text: "Attempt failed; held position.", positive: false } }
    ] },
    no: { driver: 0, delta: {}, feedback: { text: "Held position safely.", positive: true } }
  },
  {
    lap: 58,
    prompt: "Lap 58: Use aggressive engine mode to the flag?",
    bullets: [
      "+5 km/h top speed",
      "25% engine blow-up risk"
    ],
    yes: { driver: 0, random: [
      { p: 0.75, delta: {}, feedback: { text: "Aggressive finish—well done!", positive: true } },
      { p: 0.25, delta: { totalTime: Infinity }, feedback: { text: "Engine blew—DNF!", positive: false } }
    ] },
    no: { driver: 0, delta: {}, feedback: { text: "Safe finish; engine intact.", positive: true } }
  }
];
/* -----------------------------------------------------------
   RACE ENGINE
----------------------------------------------------------- */
function Race(strategies) {
  this.lap = 0;
  this.drivers = [];
  this.decision = null;
  this.banner = null;
  this.bannerTimer = 0;
  this.decisions = staticDecisions.slice();

  for (var i = 0; i < DRIVERS.length; i++) {
    var name = DRIVERS[i];
    var plan = strategies[name] || { tyres:["soft","medium",null], twoStop:false };
    var drv = new Driver(name, plan);
    drv.plannedTyres = plan.tyres.slice(1);
    drv.plannedPits = [];
    var lap1 = stintLen[plan.tyres[0]];
    if (lap1) drv.plannedPits.push(lap1);
    if (plan.twoStop && plan.tyres[2]) drv.plannedPits.push(lap1 + stintLen[plan.tyres[1]]);
    // inject planned-pits
    for (var j=0;j<drv.plannedPits.length;j++) this.decisions.push({
      lap: drv.plannedPits[j],
      prompt: "Planned pit on lap " + drv.plannedPits[j] + " to switch to " + drv.plannedTyres[j] + "?",
      bullets: ["Reset wear, 20s pit time","Sticks to plan"],
      yes:{driver:i,extra:function(d){d.tyre=this.plannedTyres[j];d.tyreWear=0;},feedback:{text:"Planned stop executed.",positive:true}},
      no:{driver:i,delta:{},feedback:{text:"Skipped planned stop.",positive:false}}
    });
    drv.pos = STARTING_POSITIONS[name] || drv.pos;
    this.drivers.push(drv);
  }
  // forced pit when wear hits 100%
  this.forcedDecisions = [];
}

Race.prototype.tick = function() {
  if (this.lap >= TOTAL_LAPS || this.decision) return;
  this.lap++;
  // tyre changes
  for (var i=0;i<this.drivers.length;i++) this.drivers[i].changeTyreIfNeeded(this.lap);
  // check forced pit
  for (i=0;i<this.drivers.length;i++){
    var d=this.drivers[i]; if(d.tyreWear>=100){
      this.decision={lap:this.lap,prompt:"Tyres gone—box now?",bullets:["Puncture if you stay","+25s pit time"],yes:{driver:i,delta:{tyreWear:-999},extra:function(x){x.tyre="hard";x.tyreWear=0;},feedback:{text:"Forced pit done.",positive:true}},no:{driver:i,random:[{p:1,delta:{totalTime:9999},feedback:{text:"Punctured!",positive:false}}]}};
      return;
    }
  }
  // static/planned decisions
  for(i=0;i<this.decisions.length;i++) if(this.decisions[i].lap===this.lap){this.decision=this.decisions[i];return;}
  // normal lap
  for(i=0;i<this.drivers.length;i++) this.drivers[i].computeLapTime();
  this.updatePositions();
};

Race.prototype.applyChoice=function(choice){
  var b=(choice==='yes'?this.decision.yes:this.decision.no);
  var d=this.drivers[b.driver];
  if(b.delta)for(var k in b.delta){
    if(typeof d[k]==='number' && typeof b.delta[k]==='number')d[k]+=b.delta[k];
    else d[k]=b.delta[k];
  }
  if(b.random){var r=Math.random(),cum=0;for(var m=0;m<b.random.length;m++){cum+=b.random[m].p;if(r<cum){var rnd=b.random[m];for(k in rnd.delta){
        if(typeof d[k]==='number' && typeof rnd.delta[k]==='number')d[k]+=rnd.delta[k];
        else d[k]=rnd.delta[k];
      }this.banner=rnd.feedback;break;}}}
  if(b.extra)b.extra(d);
  if(typeof d.tyreWear==='number')d.tyreWear=Math.max(0,Math.min(100,d.tyreWear));
  if(typeof d.battery==='number')d.battery=Math.max(0,Math.min(100,d.battery));
  if(typeof d.engine==='number')d.engine=Math.max(0,Math.min(100,d.engine));
  if(!b.random&&!b.extra)this.banner=b.feedback;
  this.decision=null; this.updatePositions();
};

Race.prototype.updatePositions=function(){
  this.drivers.sort(function(a,b){return a.totalTime-b.totalTime;});
  for(var i=0;i<this.drivers.length;i++)this.drivers[i].pos=i+1;
};

Race.prototype.findDriver=function(name){for(var i=0;i<this.drivers.length;i++)if(this.drivers[i].name===name)return i;return-1;};

/* -----------------------------------------------------------
   HUD RENDERER
----------------------------------------------------------- */
var HUD=(function(){
  var raceRef;
  return{
    init:function(race){raceRef=race;},
    draw:function(){
      noStroke();fill(0,150);rect(0,0,width,height);
      textSize(18);fill(255);textAlign(RIGHT,TOP);
      text('Lap '+raceRef.lap+'/'+TOTAL_LAPS,width-20,10);
      if(raceRef.banner){
        if(millis() < raceRef.bannerTimer){
          var bw=300,bh=40,bx=width/2-bw/2,by=20;
          fill(50,180);noStroke();
          rect(bx,by,bw,bh,8);
          fill(255);textAlign(CENTER,CENTER);textSize(18);
          text(raceRef.banner,bx+bw/2,by+bh/2);
        }else{
          raceRef.banner=null;
        }
      }
      if(raceRef.decision)drawDecisionCard(raceRef.decision.prompt,raceRef.decision.bullets,width/2-300,80,600,300);
      textSize(24);textLeading(28);fill(255);
      var p=raceRef.drivers[0];textAlign(LEFT,BOTTOM);
      text(p.name+' (P'+p.pos+')\nTyre: '+p.tyre+' '+(100-p.tyreWear).toFixed(0)+'%\nBAT '+p.battery+'%  ENG '+p.engine+'%',20,height-20);
      var f=raceRef.drivers[1];textAlign(RIGHT,BOTTOM);
      text(f.name+' (P'+f.pos+')\nTyre: '+f.tyre+' '+(100-f.tyreWear).toFixed(0)+'%\nBAT '+f.battery+'%  ENG '+f.engine+'%',width-20,height-20);
    }
  };
})();

/* -----------------------------------------------------------
   DRAW HELPERS
----------------------------------------------------------- */
function drawDecisionCard(prompt,bullets,x,y,w,h){
  fill('#F5F5F5');stroke('#E10600');strokeWeight(3);rect(x,y,w,h,12);
  noStroke();fill('#1A1A1A');textAlign(LEFT,TOP);textLeading(22);text(prompt,x+20,y+20,w-40);
  var by=y+80;for(var i=0;i<bullets.length;i++){text('• '+bullets[i],x+40,by);by+=28;}
  btnW=130;btnH=50;
  yesX=x+(w/2-btnW-20);noX=x+(w/2+20);btnY=y+h-btnH-20;
  fill('#FFD400');rect(yesX,btnY,btnW,btnH,8);fill('#1A1A1A');textAlign(CENTER,CENTER);text('YES',yesX+btnW/2,btnY+btnH/2);
  fill('#E10600');rect(noX,btnY,btnW,btnH,8);fill('#FFF');text('NO',noX+btnW/2,btnY+btnH/2);
}

function drawFeedbackCard(txt, positive) {
  // Position the feedback box just below the decision card
  var cardY = 80;
  var cardH = 300;
  var padding = 10;
  var w = 400;
  var h = 60;
  var x = width/2 - w/2;
  var y = cardY + cardH + padding;

  noStroke();
  fill(positive ? '#00A550' : '#D32F2F');
  rect(x, y, w, h, 8);

  // Emoji + text centered
  fill(255);
  textSize(20);
  textAlign(CENTER, CENTER);
  var symbol = positive ? '👍' : '👎';
  text(symbol + ' ' + txt, x + w/2, y + h/2);
}
