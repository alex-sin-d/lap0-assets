

// start game on the title
let gameState = "desktop";
let race;

// assets
let titleScreen, introVid, desktopScreen;
let gmailInterface, flavioMail;
let gmailIcon, strategyIcon;
let mouseCursor;
let backButton;
let driverStrat, qualiStrat, weatherStrat;

// sounds
let appClick, gmailClick, tabClick;

// helpers
let gmailPrompt = true;
let stratTab = "driverInfo"; // default tab

// YES/NO button metrics
let yesX, noX, btnY, btnW, btnH;

// driver arrays / strategy data
var DRIVERS = ["PIERRE GASLY", "FRANCO COLAPINTO"];
var activeDriver = 0; // 0 = Pierre first
var driverPlans = [
  { tyres: [null, null, null], twoStop: false }, // Gasly
  { tyres: [null, null, null], twoStop: false }, // Colapinto
];

var tyreList = ["soft", "medium", "hard"];
var tyreColor = { soft: "#ED4040", medium: "#E7C52E", hard: "#E8E8E8" };
var stintLen = { soft: 14, medium: 19, hard: 25 };

var tyrePros = {
  soft: "Fast launch, maximum grip",
  medium: "Balanced pace and wear",
  hard: "Longest life, slower pace",
};
var tyreCons = {
  soft: "High degradation, early stop",
  medium: "Average in all areas",
  hard: "Slow warm-up, less grip",
};

// advice for every strategy
var comboNote = {
  "soft|soft": "Super-risky! Banking on a Safety Car or rain.",
  "soft|medium": "Classic undercut – watch tyre temps mid-stint.",
  "soft|hard": "Attack early, defend long on hard compound.",
  "medium|soft": "Balanced opening – soft sprint after Lap 19.",
  "medium|medium": "Steady 1-stop; watch late wear if no SC.",
  "medium|hard": "Conservative – safest path to points.",
  "hard|soft": "Slow getaway, aim for late-race charge.",
  "hard|medium": "Long first run, flexible second stint.",
  "hard|hard": "Endurance plan – only suits very hot track.",
};

var customStrategies = { // with this some drivers start on a diffrent leading to a more realstic race
  "FERNANDO ALONSO":   { tyres:["hard","medium",null], twoStop:false },
  "GABRIEL BORTOLETO": { tyres:["soft","medium","medium"], twoStop:true  },
  "LANDO NORRIS":      { tyres:["hard","medium",null], twoStop:false },
  "ISACK HADJAR":      { tyres:["medium","soft","hard"], twoStop:true },
  "ALEX ALBON":        { tyres:["soft","soft","hard"], twoStop:true },
  "CARLOS SAINZ":      { tyres:["hard","medium",null], twoStop:false},
  "YUKI TSUNODA":      { tyres:["soft","hard","medium"], twoStop:true}
};


// preload assets
function preload() {
  introVid = createVideo(
    "https://media.githubusercontent.com/media/alex-sin-d/lap0-assets/main/assets/Lap%200%20-%20Intro%20Vid.mp4"
  );
  introVid.hide();

  titleScreen = loadImage("lap0.jpg");
  desktopScreen = loadImage("desktop.png");
  mouseCursor = loadImage("mouse.png");
  gmailIcon = loadImage("gmail.png");
  strategyIcon = loadImage("strat.jpg");
  gmailInterface = loadImage("webMail.jpg");
  flavioMail = loadImage("flavio.jpg");
  backButton = loadImage("back.png");

  driverStrat = loadImage("driver.png");
  qualiStrat = loadImage("quali.png");
  weatherStrat = loadImage("weather.png");

  appClick = loadSound("appclick.wav");
  gmailClick = loadSound("gmailClick.wav");
  tabClick = loadSound("tabClick.wav"); // new sound for tab switches
}

// intro video finished → desktop
function introFinished() {
  introVid.hide();
  gameState = "desktop";
}

function strategyReady() { // this is for later in the game but needs to be before setup, to confirm that the user ahs selected both strategy for driver
  var i, plan;
  for (i = 0; i < driverPlans.length; i++) {
    plan = driverPlans[i];
    if (!plan.tyres[0] || !plan.tyres[1]) {
      return false;            // still missing a choice
    }
  }
  return true;                 // all good – enable CONFIRM
}

// p5 setup
function setup() {
  createCanvas(745, 565);
  textAlign(CENTER);
  textSize(20);
  introVid.onended(introFinished);
}

// main draw loop
function draw() {
  background(0);

  if (gameState === "titleScreen") {
    image(titleScreen, 0, 0, width, height);
  } else if (gameState === "intro") {
    introVid.show();
    introVid.position(0, 0);
    introVid.size(width, height);
  } else if (gameState === "desktop") {
    noCursor();
    image(desktopScreen, 0, 0, width, height);
    image(gmailIcon, 136, 112, 60, 45);
    image(strategyIcon, 126, 20, 75, 50);
    image(mouseCursor, mouseX, mouseY, 30, 30);

    if (gmailPrompt) {
      fill(255);
      rect(525, 450, 225, 50);
      fill(0);
      textSize(14);
      text("You've got mail!", 525 + 112.5, 466);
      text("Check your Gmail to continue.", 525 + 112.5, 484);
    }
  } else if (gameState === "email") {
    image(gmailInterface, 0, 0, width, height);
    image(backButton, 15, 430, 200, 160);
    image(mouseCursor, mouseX, mouseY, 30, 30);
  } else if (gameState === "flavioEmail") {
    image(flavioMail, 0, 0, width, height);
    image(mouseCursor, mouseX, mouseY, 30, 30);
  } else if (gameState === "strategy") {
    drawStrategyUI();
    noCursor();
    image(mouseCursor, mouseX, mouseY, 30, 30);
  } else if (gameState === "race") {
    
  if (race) {
    race.tick(millis());
    HUD.draw();
  image(mouseCursor, mouseX, mouseY, 30, 30);
  }

  } else if (gameState === "result") {
    // result screen coming soon
  }
}

function handleDecision(choice) {
  race.applyChoice(choice);
}

// mouse controls
function mousePressed() {
  console.log("mousePressed at", mouseX, mouseY, "state:", gameState);
  
  if (gameState === "race" && race.decision) {
  // YES?
  if (pointInRect(mouseX, mouseY, yesX, btnY, btnW, btnH)) {
    handleDecision("yes");
  }
  // NO?
  else if (pointInRect(mouseX, mouseY, noX, btnY, btnW, btnH)) {
    handleDecision("no");
  }
  return;  // swallow all other clicks until the decision is resolved
}

  // title to the intro
  if (gameState === "titleScreen") {
    introVid.play();
    gameState = "intro";
    return;
  }

  // desktop clicks
  if (gameState === "desktop") {
    const overGmail =
      mouseX > 136 && mouseX < 196 && mouseY > 112 && mouseY < 157;
    if (overGmail) {
      appClick.play();
      gameState = "email";
    }
    const overStrat =
      mouseX > 132 && mouseX < 178 && mouseY > 21 && mouseY < 64;
    if (overStrat) {
      appClick.play();
      gameState = "strategy";
    }
    return;
  }

  // email inbox clicks
  if (gameState === "email") {
    const overFlavio =
      mouseX > 212 && mouseX < 728 && mouseY > 181 && mouseY < 265;
    if (overFlavio) {
      gmailClick.play();
      gameState = "flavioEmail";
    }
    const overBackDesktop =
      mouseX > 15 && mouseX < 215 && mouseY > 430 && mouseY < 590;
    if (overBackDesktop) {
      appClick.play();
      gameState = "desktop";
      gmailPrompt = false;
    }
    return;
  }

  // flavio email → back
  if (gameState === "flavioEmail") {
    const overBack =
      mouseX > 75 && mouseX < 185 && mouseY > 460 && mouseY < 505;
    if (overBack) {
      gmailClick.play();
      gameState = "email";
      gmailPrompt = false;
    }
    return;
  }

  // strategy screen clicks
  if (gameState === "strategy") {
    // --- Tabs ---
    if (pointInRect(mouseX, mouseY, 40, 10, 130, 30)) {
      stratTab = "driverInfo";
      tabClick.play();
      return;
    }
    if (pointInRect(mouseX, mouseY, 180, 10, 130, 30)) {
      stratTab = "track";
      tabClick.play();
      return;
    }
    if (pointInRect(mouseX, mouseY, 320, 10, 130, 30)) {
      stratTab = "weather";
      tabClick.play();
      return;
    }
    if (pointInRect(mouseX, mouseY, 460, 10, 130, 30)) {
      stratTab = "plan";
      tabClick.play();
      return;
    }

    // --- PLAN TAB INTERACTIONS ---
    if (stratTab === "plan") {
      let plan = driverPlans[activeDriver];
      let colX = [110, 310, 510];

      // tyre compound buttons
      for (let c = 0; c < 3; c++) {
        if (c === 2 && !plan.twoStop) continue;
        for (let r = 0; r < 3; r++) {
          if (
            pointInRect(
              mouseX,
              mouseY,
              colX[c],
              120 + r * 80,
              140,
              60
            )
          ) {
            plan.tyres[c] = tyreList[r];
            appClick.play();
          }
        }
      }

      // 2-stop toggle
      if (pointInRect(mouseX, mouseY, 540, 70, 80, 24)) {
        plan.twoStop = !plan.twoStop;
        if (!plan.twoStop) plan.tyres[2] = null;
      }

      // “Next Driver” or “Confirm Strategy” button
      if (
        pointInRect(mouseX, mouseY, 242, 500, 260, 50)
      ) {
        // only require *this* driver's first two tyres
        if (plan.tyres[0] && plan.tyres[1]) {
          appClick.play();
          if (activeDriver < DRIVERS.length - 1) {
            // move to next driver
            activeDriver++;
          } else {
            // last driver → launch the race
            race = new Race(DRIVERS, customStrategies);
            HUD.init(race);
            gameState = "race";
          }
        }
      }
    }
  }
}

  
  


// hit-test helper
function pointInRect(px, py, rx, ry, rw, rh) {
  return px > rx && px < rx + rw && py > ry && py < ry + rh;
}

// keyboard shortcut
function keyPressed() {
  if (gameState === "titleScreen") {
    introVid.play();
    gameState = "intro";
  }
}
