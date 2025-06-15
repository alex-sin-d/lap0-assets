// this is to draw the strategy screen for the user to be able to select lines
function drawStrategyUI() {
  const imgY = 40; // img starts below the top of the screen so tabs don't over lap with image itself

  // show the right image behind the tabs
  if (stratTab === "driverInfo") {
    // driverInfo image
    image(driverStrat, 0, imgY, width, height - imgY);
  } else if (stratTab === "track") {
    // track quali positions
    image(qualiStrat, 0, imgY, width, height - imgY);
  } else if (stratTab === "weather") {
    // quali report / weather
    image(weatherStrat, 0, imgY, width, height - imgY);
  }

  // driverInfo
  fill(stratTab === "driverInfo" ? "#0092DF" : "#333");
  rect(40, 10, 130, 30, 6);
  fill(255);
  textSize(12);
  textAlign(CENTER, CENTER);
  text("Drivers", 40 + 130 / 2, 10 + 30 / 2);

  // track quali positions
  fill(stratTab === "track" ? "#0092DF" : "#333");
  rect(180, 10, 130, 30, 6);
  fill(255);
  text("Qualifying Report", 180 + 130 / 2, 10 + 30 / 2);

  // quali report
  fill(stratTab === "weather" ? "#0092DF" : "#333");
  rect(320, 10, 130, 30, 6);
  fill(255);
  text("Weather", 320 + 130 / 2, 10 + 30 / 2);

  // Plan Tab
  fill(stratTab === "plan" ? "#0092DF" : "#333");
  rect(460, 10, 130, 30, 6);
  fill(255);
  text("PLAN", 460 + 130 / 2, 10 + 30 / 2);

  // now draw plan screen if selected
  if (stratTab === "plan") {
    var plan = driverPlans[activeDriver]; // active driver’s plan
    var colX = [110, 310, 510]; // x positions for columns

    // title
    fill(255);
    textSize(22);
    textAlign(CENTER);
    text("Strategy - " + DRIVERS[activeDriver], width / 2, 60);

    // coloum headers
    var headers = ["START", "STINT 2", "STINT 3"];
    fill(180);
    textSize(16);
    for (var i = 0; i < 3; i++) {
      text(headers[i], colX[i] + 70, 90);
    }

    // text buttons for the tire selction
    textSize(14);
    for (var c = 0; c < 3; c++) {
      for (var r = 0; r < 3; r++) {
        var x = colX[c];
        var y = 120 + r * 80;
        var w = 140,
          h = 60;
        var val = tyreList[r];

        // disable stint 3 column when 2 stop toggle is not selected
        if (c === 2 && !plan.twoStop) {
          fill(40);
          noStroke();
          rect(x, y, w, h, 8); // grey overlay
          continue;
        }

        //hover + selected styles
        var over = pointInRect(mouseX, mouseY, x, y, w, h);
        var selected = plan.tyres[c] === val;
        if (selected) {
          fill(40);
          stroke("#F5328C");
          strokeWeight(3);
        } else if (over) {
          fill(55);
          stroke(90);
          strokeWeight(1);
        } else {
          fill(30);
          stroke(60);
          strokeWeight(1);
        }
        rect(x, y, w, h, 8);

        // coloured ring + label
        fill(tyreColor[val]);
        noStroke();
        circle(x + 18, y + h / 2, 18);
        fill(255);
        textAlign(LEFT, CENTER);
        text(val.toUpperCase(), x + 36, y + h / 2);
      }
    }

    // 2 stop toggle buttton so like u can turn it on and off
    fill(plan.twoStop ? "#0092DF" : "#444");
    noStroke();
    rect(540, 70, 80, 24, 12);
    fill(255);
    textSize(12);
    textAlign(CENTER, CENTER);
    text(plan.twoStop ? "2-STOP ON" : "2-STOP OFF", 540 + 40, 70 + 12);

    // heading for summary
    fill(30);
    noStroke();
    rect(60, 360, 625, 120, 8);
    fill(255);
    textSize(16);
    textAlign(LEFT, TOP);
    text("PLAN SUMMARY", 72, 370);

    // build the summary for when first and second tire is selected
    if (plan.tyres[0] && plan.tyres[1]) {
      var startTyre = plan.tyres[0];
      var stint2Tyre = plan.tyres[1];
      var firstLap = stintLen[startTyre];
      var stopsLabel = plan.twoStop ? "2-stop" : "1-stop";
      var comboKey = startTyre + "|" + stint2Tyre;
      var comboHint = comboNote[comboKey] || "";

      var summary = "Pit Lap " + firstLap + " • " + stopsLabel + ".  ";
      summary +=
        "Start on " +
        startTyre.toUpperCase() +
        ", switch to " +
        stint2Tyre.toUpperCase() +
        ".  ";
      summary += "Pros: " + tyrePros[startTyre] + ".  ";
      summary += "Cons: " + tyreCons[startTyre] + ".  ";
      summary += "Stint-2 Pros: " + tyrePros[stint2Tyre] + ".  ";
      summary += "Cons: " + tyreCons[stint2Tyre] + ".  ";
      summary += comboHint;

      // if 2-stop and Stint-3 selected, add second stop details
      if (plan.twoStop && plan.tyres[2]) {
        var stint3Tyre = plan.tyres[2];
        var secondLap = firstLap + stintLen[stint2Tyre];
        summary +=
          "  Second stop Lap " +
          secondLap +
          ", fit " +
          stint3Tyre.toUpperCase() +
          ".";
      }

      fill(180);
      textSize(13);
      text(summary, 72, 400, 625 - 24, 120 - 50);
    } else {
      fill(120);
      textSize(13);
      text("Select Start and Stint-2 tyres to see projections.", 72, 400);
    }

    // next button
    var ready = plan.tyres[0] && plan.tyres[1]; // must pick first 2 tyres
    fill(ready ? "#0092DF" : "#555");
    noStroke();
    rect(242, 500, 260, 50, 10);
    fill(255);
    textSize(18);
    textAlign(CENTER, CENTER);
    var lastDriver = activeDriver === DRIVERS.length - 1;
    var btnLabel = lastDriver ? "CONFIRM STRATEGY" : "NEXT DRIVER";
    text(btnLabel, 242 + 130, 500 + 25);

    // hint
    fill(180);
    textSize(12);
    textAlign(CENTER);
    text("Pick compounds - Toggle 2-stop for Stint 3", width / 2, 470);

    // wet weather notice
    fill(200);
    textSize(12);
    textAlign(CENTER);
    text(
      "If wet weather is detected during the race, race control will alert you and you can change the tyres/pit strategy",
      width / 2,
      455
    );
  }
}
