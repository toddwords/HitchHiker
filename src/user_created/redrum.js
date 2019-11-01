function addPopup(text) {
  var popup = $("<h1></h1>");
  $(popup)
    .addClass("popupText")
    .css({
      display: "none",
      position: "fixed",
      top: "20%",
      left: "30%",
      width: "400px",
      "background-color": "rgba(100,255,255,0.5)",
      border: "2px solid black",
      "border-radius": "10px",
      padding: "10px",
      "font-size": "36px",
      "z-index": 10 + $(".popupText").length
    });
  $(popup).text(text);
  $("body").prepend(popup);
  $(popup).fadeIn(400, function() {
    setTimeout(function() {
      $(popup).fadeOut();
    }, 4000);
  });
}

function replaceText(inText) {
  var words = inText.trim().split(" ");
  var findWord = words[0];
  var replaceWord = words[1];
  var textnodes = getTextNodes();
  var findRE = new RegExp(findWord, "gi");
  for (var i = 0; i < textnodes.length; i++) {
    var text = textnodes[i].nodeValue;
    textnodes[i].nodeValue = text.replace(findRE, replaceWord);
  }
}

function getTextNodes() {
  // get all html elements
  var elements = document.querySelectorAll("body, body *");
  var results = [];
  //loop through the elements children nodes
  for (var i = 0; i < elements.length; i++) {
    var child = elements[i].childNodes[0];

    // grab everything that's a textNode (nodeType is "3")
    if (elements[i].hasChildNodes() && child.nodeType == 3) {
      results.push(child);
    }
  }

  return results;
}

function bubbleDrawing() {
  if ($("#drawing-container").length < 1) {
    $("body").append("<div id='drawing-container'></div>");
    drawingCanvas = new p5(bubbleSketch, "drawing-container");
  } else if ($("#drawing-container").is(":visible")) {
    $("#drawing-container").fadeOut(2000);
  } else {
    $("#drawing-container").fadeIn(2000);
  }
}

function bubbleSketch(P5) {
  var mySize, myColor;
  P5.setup = function() {
    P5.createCanvas(
      document.documentElement.scrollWidth,
      document.documentElement.scrollHeight
    );
    P5.background("rgba(255,255,255, 0.1)");
    s = 14;
    c = (P5.random(100, 255), P5.random(100, 255), P5.random(255), 30);
    t = ["FREE SPACE"];
  };
  P5.mouseDragged = function() {
    var data = {
      x: P5.mouseX,
      y: P5.mouseY,
      color: c,
      size: s
    };
    console.log(data);
    relay({
      type: "mouseDraw",
      x: data.x,
      y: data.y,
      color: c,
      size: s
    });

    P5.stroke(P5.random(100, 255), P5.random(100, 255), P5.random(100, 255));
    P5.noFill();
    P5.textSize(16);
    P5.text(t, P5.mouseX, P5.mouseY);
  };
  P5.newDrawing = function(data) {
     P5.stroke(data.color);
    P5.noFill();
    P5.textSize(16);
    P5.text(t, data.x, data.y);
  };
}

function graffitti() {
  if ($("#drawing-container").length < 1) {
    $("body").append("<div id='drawing-container'></div>");
    drawingCanvas = new p5(graffittiSketch, "drawing-container");
  } else if ($("#drawing-container").is(":visible")) {
    $("#drawing-container").fadeOut(2000);
  } else {
    $("#drawing-container").fadeIn(2000);
  }
}

function graffittiSketch(P5) {
  var mySize, myColor;
  P5.setup = function() {
    P5.createCanvas(
      document.documentElement.scrollWidth,
      document.documentElement.scrollHeight
    );
    P5.background("rgba(255,255,255, 0.1)");
    s = P5.random(8, 10);
    c = 0;
  };
  P5.mouseDragged = function() {
    var data = {
      x: P5.mouseX,
      y: P5.mouseY,
      color: c,
      size: s
    };
    console.log(data);
    relay({
      type: "mouseDraw",
      x: data.x,
      y: data.y,
      color: c,
      size: s
    });

    P5.noStroke();
    P5.fill(0);
    P5.rect(P5.mouseX, P5.mouseY, s, s);
  };
  P5.newDrawing = function(data) {
    P5.noStroke();
    P5.fill(0);
    P5.rect(data.x, data.y, data.size, data.size);
  };
}