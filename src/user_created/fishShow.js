

function fishAreGreat(){
	alert("did you know that fish are great?")
	getRandomGif("fish")
}

function changeTextToFish(){
	$('li').text("fish are great")
	$('body').prepend("<h1>Fish are great</h1>")
}

function toggleDrawing(){
	if($('#drawing-container').length < 1){
		$('body').append("<div id='drawing-container'></div>")
		drawingCanvas = new p5(drawingSketch,'drawing-container')
	} else if ($('#drawing-container').is(":visible")){
		$('#drawing-container').fadeOut(2000)
	} else {
		$('#drawing-container').fadeIn(2000)
	}
	
}

function drawingSketch(P5){
	var mySize,myColor;
	P5.setup = function(){
		P5.createCanvas(document.documentElement.scrollWidth,document.documentElement.scrollHeight)
		P5.background('rgba(255,255,255, 0.1)');
		mySize = P5.random(10,70)
		myColor = USER.color;
	}
	P5.mouseDragged = function(){
		//console.log(mouseX + ', ' + mouseY)
		var data = {
			x: P5.mouseX,
			y: P5.mouseY,
			color: myColor,
			size: mySize
		}
	  	console.log(data);
		relay({type:"mouseDraw", x: data.x, y:data.y, color: myColor, size:mySize})

		P5.noStroke();
		P5.fill(myColor[0], myColor[1], myColor[2]);
		P5.ellipse(P5.mouseX, P5.mouseY, mySize, mySize)
	}
	P5.newDrawing = function(data){
		P5.noStroke();
		P5.fill(data.color[0],data.color[1],data.color[2]);
		P5.ellipse(data.x, data.y, data.size, data.size)
	}
}