var guide = false;
var currentEl;
var currentText = "";
var originalText = "";
var elType = "";
var elPath;
var contentChanges = [];
var graffiti = false;
var USER;
var drawingCanvas;
var urlList;
setTimeout(siteSpecific, 3000);
chrome.storage.local.get(function(data){
	USER = data;
	console.log(USER.performances[USER.currentPerformance].urlList)
	urlList = USER.performances[USER.currentPerformance].urlList;

})
chrome.storage.onChanged.addListener(function(){
	chrome.storage.local.get(function(data){
		USER = data;
	})
})
chrome.runtime.sendMessage({isGuide:"ask"}, function(answer){
	guide = answer;
	$('title').text("[HitchHiker] "+ $('title').text())
})
chrome.runtime.onMessage.addListener(function(message,sender, sendResponse){
		if(message.changeText){
			changeText(message.changeText)
		}
		if(message.type == "changeText"){
			changeText(message.text)
			speakText(message.text)
		}
		if(message.newMsg){
				addChatBubble(message.newMsg.username, message.newMsg.msg, message.newMsg.color)
		}
		if(message.type == "click"){
			console.log("Guide clicked at " +message.x+","+message.y)
			var $clickEl = $(message.elPath)
			if(checkWebAddress("gutenberg.org")){
				$('.mildEditBorder').removeClass('mildEditBorder')
				$clickEl.addClass('mildEditBorder')
			} else{
				$('.beingEdited').removeClass('beingEdited')
				$clickEl.addClass('beingEdited')
			}
			var offset = $clickEl.offset()
			// var $clickCircle = $("<img id='clickCircle' style='position:absolute; z-index:99999; width:200px; left:"+(offset.left) +"px; top:"+(offset.top)+"px' src='"+chrome.runtime.getURL("assets/clickCircle.gif")+"' />")
			// var $clickCircle = $("<img id='clickCircle' style='position:absolute; z-index:99999; width:200px; left:"+message.x+"px; top:"+message.y+"px' src='"+chrome.runtime.getURL("assets/clickCircle.gif")+"' />")
			// console.log($clickCircle)
			// $('body').append($clickCircle)
			// $clickCircle.fadeOut(1500, function(){$(this).remove()})
			// $('body').append("<img style='position:absolute; left:"+message.x+"; top:"+message.y+"' src='"+chrome.runtime.getURL("assets/clickCircle.gif")+"' />")

			//$('body').append("<img src='"+chrome.extension.getURL("assets/clickCircle.gif")+"' />")
			//$('body').append("<img src='"+chrome.runtime.getURL("assets/clickCircle.gif")+"' />")
		}
		if(message.type == "graffiti"){
			if(message.originalText !== originalText || message.elType !== elType){
				originalText = message.originalText
				elType = message.elType
				currentEl = $(message.elPath)
				// currentEl = $(message.elType+":contains("+message.originalText+")")
			}
			$(currentEl).text(message.currentText);
		}
		if(message.type == "toggleDrawing"){
			console.log("drawing on")
			toggleDrawing()
		}
		if(message.type == "mouseDraw"){
			console.log("mousedraw received")
			drawingCanvas.newDrawing(message)
		}
		if(message.type == "multiGif"){
			var src = (message.src.indexOf("http") >= 0) ? message.src : chrome.runtime.getURL(message.src)
			multiGif(src, message.remove)
		}
		if(message.type == "playSound"){
			var src = (message.src.indexOf("http") >= 0) ? message.src : chrome.runtime.getURL(message.src)
			var audio = new Audio(src);
			audio.play()
		}
		if(message.type == "topSites"){
			window.location = message.url;
		}
		if(message.type == "dance"){
			dance()
		}
		if(message.type == "stopAnimation"){
			stopAnimation()
		}
		if(message.type == "graffitiOn"){
			graffiti = true;
		}
		if(message.type == "runFunction"){
			var fn = window[message.fn]
			if (typeof fn === "function") fn.apply(null, message.params);
		}
		if(message.type == "scrollSync" && !guide){
			$(window).scrollTop(message.scroll);
			console.log("scroll syncing")
		}
		if(message.type){
			chrome.runtime.sendMessage({socketEvent:"status", data:{msg:message.type + " running"}})
		}
})
$('*').click(function(e){
	if(graffiti && guide){
		var allowClick = true;
		console.log(e)
		if(currentEl !== e.target){
			allowClick = false;
			currentEl = e.target
			currentText = ""
			contentChanges = [];
			originalText = e.target.textContent
			elType = e.target.localName
			elPath = $(currentEl).getPath()
			console.log(currentEl)
			console.log($(currentEl).getPath())
	
		}
		relay({"type": "click", "x":e.pageX, "y":e.pageY, "elPath":elPath})
		return allowClick
	}

})

$(document).keydown(function(e){
	if(e.shiftKey && e.key==" "){

		toggleChatInput();
		console.log("togglingChat")
	}
	if(guide){
		if(e.key=="D"){
			// relay({type:"toggleDrawing"})
			// toggleDrawing()
			// console.log("toggling drawing")
		}
		else if(e.which == 39){
			nextWebsite()
		}
	}
	if(graffiti && guide && $('#chatInput').length < 1){
		console.log(currentEl)
		e.preventDefault()
		if(e.ctrlKey && e.which == 86){
			contentChanges.push($(currentEl).text())
			navigator.clipboard.readText().then(clipText => currentEl.innerText = currentText = clipText);
		}
		else if(currentEl && e.ctrlKey && e.which == 90){
			if(contentChanges.length > 0){
				currentText = contentChanges.pop()
				$(currentEl).text(currentText);
				relay({type:"graffiti", elPath:elPath, originalText:originalText, elType:elType, currentText:currentText})
			}


		}
		// else if(e.ctrlKey){
		// 	return true
		// }
		else if(currentEl && e.key.length == 1){
			contentChanges.push($(currentEl).text())
			currentText += e.key
			$(currentEl).text(currentText);
			relay({type:"graffiti", elPath:elPath, originalText:originalText, elType:elType, currentText:currentText})
		}
		else if(currentEl && e.which == 8){
			contentChanges.push($(currentEl).text())
			currentText = currentText.slice(0,-1)
			$(currentEl).text(currentText);
			relay({type:"graffiti", elPath:elPath, originalText:originalText, elType:elType, currentText:currentText})
		}
		
		return false
	}
})
$(window).scroll(function(){
	if(USER.scrollSync && guide){ 
		scrollAmt = $(window).scrollTop()
		console.log(scrollAmt)
		relay({type:"scrollSync", scroll:scrollAmt})
		console.log("sending scroll")
	}
})

function changeText(str){
	$('h1,h2,h3:not(:has(img)),h4,h5,h6,span:not(:has(*)),p,a:not(:has(img)),div:not(:has(*)),li:not(:has(*)),option,strong,b,em').not("#replStart").text(str)
}
function multiGif(src, remove){
	var gifCreator = setInterval(function(){
		var gif = $("<img />").addClass("multiGif").attr("src", src)
		$(gif).css({top:randRange(0, window.innerHeight - 100), left:randRange(0,window.innerWidth-100), width:randRange(30,300), "z-index":10+$('.multiGif').length})
		$('body').prepend(gif)
	},30)
	setTimeout(function(){
		clearInterval(gifCreator);
		if(remove){
			var gifRemover = setInterval(function(){
				$('.multiGif').last().remove()
				if($('.multiGif').length==0){clearInterval(gifRemover)}
			},25)
		}

	},3000)
}
function dance(){
	$('img, p, h1,h2,h3,h4,h5,h6, a, li').each(function(index){
		$(this).addClass('animate')
		switch(index % 4){
			case 0:
				$(this).addClass("dance")
				break
			case 1:
				$(this).addClass("dance2")
				break
			case 2:
				$(this).addClass("fastPulse")
				break
			case 3:
				$(this).addClass("slowTop")
		}
	})
}
function stopAnimation(){
	$('img, p, h1,h2,h3,h4,h5,h6, a, li').removeClass('animate dance dance2 fastPulse slowTop')
}
function nextWebsite(){
	USER.counter++;
	if(USER.counter >= urlList.length){USER.counter=0}
	chrome.storage.local.set({counter: USER.counter})
	window.location = urlList[USER.counter]
}

function addChatBubble(username,msg,color){
	if($('#chatDiv').length < 1){
		$('body').prepend("<div id='chatDiv'></div>")
	}
	var styleString = "'background-color:rgba("+color[0]+","+color[1]+","+color[2]+",0.85); border-color:rgb("+color[0]+","+color[1]+","+color[2]+"'"
	var bubble = "<div class='chatBubble' style="+styleString+"><strong>"+username+":</strong> "+msg+"</div>"
	$(bubble).hide().appendTo("#chatDiv").fadeIn(1200).delay(5000).fadeOut(1200)

}
function toggleChatInput(){
	if($('#chatInput').length < 1){
		$('body').append("<div id='inputDiv'><span id='replStart'>>   </span><input id='chatInput' /></div>")
	}
	$('#inputDiv').slideToggle()
	if($('#inputDiv').is(":visible")){
		$('#chatInput').focus().blur(function(){$(this).parent().slideUp()})
		$('#chatInput').keydown(function(e){
			if(e.key == "Enter"){
				if($('#chatInput').val().length > 0){
					var msg = $('#chatInput').val()
					console.log(msg)
					$('#chatInput').val("")
					if(parseChatInput(msg)){
						msg = sanitize(msg)
						// addChatBubble(USER.username,msg, USER.color )
						chrome.runtime.sendMessage({socketEvent: "newMsg",data:{username:USER.username, color:USER.color, msg:msg}})
						if(guide && USER.speakChat)
							relay({type:"speakText", msg:msg})
					}
				}
			}
		})
	} else {
		$('#chatInput').off('keydown blur')
	}

}
function parseChatInput(msg){
	msg = msg.trim()
	if(guide && msg.slice(0,2) == "g "){
          msg = msg.slice(2)
          getGif(msg)
          console.log("gettin gif")
          return false
    }
    if(guide && msg.slice(0,2) == "x "){
          msg = msg.slice(2)
          relay({type:"changeText", "text": msg})
          return false
    }
    if(guide && msg.slice(0,2) == "f "){
    	msg = msg.slice(2)
    	runFunction(msg)
    	return false
    }
    if(guide && msg.slice(0,2) == "s "){
    	console.log(msg.slice(2))
    	getSound(msg.slice(2))
    	return false
    }
    if(guide && msg.slice(0,2) == "l "){
    	getSound(msg.slice(2),true)
    	return false
    }
    if(guide && msg.slice(0,2) == "sx"){
    	relay({type:"stopAudio"})
    	return false
    }
    return true
}

function siteSpecific(){
	if(checkWebAddress("web.archive.org")){
		$('#wm-ipp-base').remove()
	}
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

function speakText(str){
	chrome.runtime.sendMessage({speakText:str})
}
function relay(obj){
	chrome.runtime.sendMessage({socketEvent: "guideEvent", data: obj })
}

function randRange(min,max){
	return Math.floor(Math.random()*(max-min) + min)
}
jQuery.fn.getPath = function () {
    if (this.length != 1) throw 'Requires one element.';

    var path, node = this;
    while (node.length) {
        var realNode = node[0], name = realNode.localName;
        if (!name) break;
        name = name.toLowerCase();

        var parent = node.parent();

        var siblings = parent.children(name);
        if (siblings.length > 1) { 
            name += ':eq(' + siblings.index(realNode) + ')';
        }

        path = name + (path ? '>' + path : '');
        node = parent;
    }

    return path;
};

function sanitize(string) {
  const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;',
      "/": '&#x2F;',
  };
  const reg = /[&<>"'/]/ig;
  return string.replace(reg, (match)=>(map[match]));
}
function checkWebAddress(url) {
	return window.location.href.indexOf(url) >= 0
}