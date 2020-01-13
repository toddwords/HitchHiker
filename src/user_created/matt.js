function toggleSketch(){
	if($('#drawing-container').length < 1){
		$('body').append("<div id='drawing-container'></div>")
		drawingCanvas = new p5(mattSketch,'drawing-container')
	} else if ($('#drawing-container').is(":visible")){
		$('#drawing-container').fadeOut(2000)
	} else {
		$('#drawing-container').fadeIn(2000)
	}
	
}


function mattSketch(P5) {
  P5.setup = function (){

  P5.createCanvas(document.documentElement.scrollWidth,document.documentElement.scrollHeight);
  P5.background('rgba(255,255,255,0.0)');
	}

 P5.draw = function() {

  variableEllipse(P5.mouseX, P5.mouseY, P5.pmouseX, P5.pmouseY);
	}


	function variableEllipse(x, y, px, py) {
	  let speed = P5.abs(x - px) + P5.abs(y - py);
	  P5.stroke(speed);
	  P5.ellipse(x, y, speed, speed);
	}
}