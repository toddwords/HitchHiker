var guide = false;
var currentEl;
var currentText = "";
var originalText = "";
var elType = "";
var elPath;
var contentChanges = [];
var graffiti = false;
var groupEdit = false;
var clearEditBorder;
var USER;
var drawingCanvas;
var urlList;
var multiMouseToggle = false;

chrome.storage.local.get(function(data){
	USER = data;
	console.log(USER.performances[USER.currentPerformance].urlList)
	urlList = USER.performances[USER.currentPerformance].urlList;
	if(checkWebAddress("hitchhiker") && checkWebAddress("join")){
		$('#installDiv').hide()
		$('#joinRoomDiv').show()
		$('#joinHitchHikerRoom').click(function(){
			if(!USER.username){USER.username = prompt("What username would you like to go by when using HitchHiker?"); sync()}
			let openSocketConnection = chrome.runtime.connect()
			console.log("join button clicked")
			console.log($(this).attr("room"))
			chrome.storage.local.set({role:"audience"})
			toServer("joinRoom", {room:$(this).attr("room"), username:USER.username, role:"audience"})
		})
	}

	chrome.runtime.sendMessage({isGuide:"ask"}, function(answer){
		guide = answer.guide;
		if(answer.id == USER.performanceTab){
			$('title').text("[HitchHiker] "+ $('title').text())
		}
	})
	console.log(USER)
	if(USER.room && USER.room !== "lobby"){
		bindEvents();
		setTimeout(siteSpecific, 3000);
		//video test

	}

	
})
chrome.storage.onChanged.addListener(function(){
	chrome.storage.local.get(function(data){
		USER = data;
	})
})

chrome.runtime.onMessage.addListener(function(message,sender, sendResponse){
		if(message.error && message.error.includes("no room by that name")){
			alert("This room is currently unavailable")
			console.log(message.error)
		}
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
				if(!groupEdit) $('.beingEdited').removeClass('beingEdited')
				$clickEl.addClass('beingEdited')
			}
			//var offset = $clickEl.offset()
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
				//currentEl = $(message.elPath)
				// currentEl = $(message.elType+":contains("+message.originalText+")")
			}
			$(message.elPath).text(message.currentText);
		}
		if(message.type == "removeEditBorder"){
			$(message.elPath).removeClass("beingEdited")
		}
		if(message.type == "graffitiToggle"){
			graffiti = !graffiti;
		}
		if(message.type == "toggleGroupEdit"){
			graffiti = groupEdit
			graffiti = !graffiti;
			groupEdit = !groupEdit
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


		if(message.type == "scrollSync" && !guide){
			$(window).scrollTop(message.scroll);
			console.log("scroll syncing")
		}
		if(message.type == "runFunction"){
			var fn = window[message.fn]
			if (typeof fn === "function") fn.apply(null, message.params);
		}
		else if(message.type && message.params){
			console.log(message.type)
			let func = window[message.type];
			console.log(func)
			if(typeof func == "function") func.apply(null, message.params)
		}
		if(message.type){
			chrome.runtime.sendMessage({socketEvent:"status", data:{msg:message.type + " running"}})
		}
})


function bindEvents(){
	$('*').click(function(e){
		if(graffiti && (guide||groupEdit)){
			var allowClick = true;
			console.log(e)
			if(currentEl !== e.target){
				allowClick = false;
				relay({type:"removeEditBorder", elPath:elPath})
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
			if(e.ctrlKey && e.which == 37){
				prevWebsite()
			}
			else if(e.ctrlKey && e.which == 39){
				nextWebsite()
			}
			else if(e.ctrlKey && e.which == 40){
				addWebsite()
			}
		}
		if(graffiti && (guide||groupEdit) && $('#chatInput').length < 1){
			console.log(currentEl)
			e.preventDefault()
			// if(e.ctrlKey && e.which == 86){
			// 	contentChanges.push($(currentEl).text())
			// 	navigator.clipboard.readText().then(clipText => currentEl.innerText = currentText = clipText);
			// }
			if(currentEl && e.ctrlKey && e.which == 90){
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
			else if(currentEl && e.which == 13){
				$(currentEl).removeClass("beingEdited")
				relay({type:"removeEditBorder", elPath:elPath})
				currentEl = false;
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
}

function changeText(str){
	$('h1,h2,h3:not(:has(img)),h4,h5,h6,span:not(:has(*)),p,a:not(:has(img)),div:not(:has(*)),li:not(:has(*)),option,strong,b,em').not("#replStart").text(str)
}
function changeImages(urls){
	var images = $('img,picture, picture source')
	console.log(images)
	var imgLinkArray = urls.trim().split(" ")
	
	for (var i = 0, l = images.length; i < l; i++) {
	  console.log(imgLinkArray[i % imgLinkArray.length])
	  console.log(images[i].src)
	  images[i].src = imgLinkArray[i % imgLinkArray.length]
	  images[i]["data-src"] = imgLinkArray[i % imgLinkArray.length]
	  images[i].srcset = imgLinkArray[i % imgLinkArray.length]
	  console.log(images[i].src)
    }
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
function prevWebsite(){
	USER.counter--;
	if(USER.counter < 0){USER.counter=0}
	chrome.storage.local.set({counter: USER.counter})
	window.location = urlList[USER.counter]
}
function nextWebsite(){
	USER.counter++;
	if(USER.counter >= urlList.length){USER.counter=0}
	chrome.storage.local.set({counter: USER.counter})
	window.location = urlList[USER.counter]
}
function addWebsite(){
	USER.performances[USER.currentPerformance].urlList.push(location.href)
	sync()
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
			px: P5.pmouseX,
			py: P5.pmouseY,
			x: P5.mouseX,
			y: P5.mouseY,
			color: myColor,
			size: mySize
		}
	  	console.log(data);
		relay({type:"mouseDraw", px: P5.pmouseX, py: P5.pmouseY, x: data.x, y:data.y, color: myColor, size:mySize})

		P5.strokeWeight(mySize)
		P5.stroke(myColor[0], myColor[1], myColor[2]);
		P5.line(P5.pmouseX, P5.pmouseY, P5.mouseX, P5.mouseY)
		//P5.noStroke();
		// P5.fill(myColor[0], myColor[1], myColor[2]);
		// P5.ellipse(P5.mouseX, P5.mouseY, mySize, mySize)
	}
	P5.newDrawing = function(data){
		P5.strokeWeight(data.size)
		P5.stroke(data.color[0], data.color[1], data.color[2]);
		P5.line(data.px, data.py, data.x, data.y)
		// P5.noStroke();
		// P5.fill(data.color[0],data.color[1],data.color[2]);
		// P5.ellipse(data.x, data.y, data.size, data.size)
	}
}
function multiMouse(){
	multiMouseToggle = !multiMouseToggle
	if(multiMouseToggle){
		$(document).mousemove(function(e){
			relay({type: "onMoveMultiMouse", params: [USER.id, (e.clientX+window.scrollX)/document.body.scrollWidth, (e.clientY+window.scrollY)/document.body.scrollHeight]})
		})
	}
	else{
		$(document).off(mousemove)
	}
}

function onMoveMultiMouse(userId,x,y){
	if(userId != USER.id){
		if($('#'+userId).length < 1){
			let cursorImg = $('<img />').attr('src', chrome.runtime.getURL("assets/cursor.png")).attr('id', userId).css({top:y*document.body.scrollHeight,left:x*document.body.scrollWidth}).addClass('multiMouse')
			$('body').prepend(cursorImg)
		} else {
			$('#'+userId).css({top:y*document.body.scrollHeight, left:x*document.body.scrollWidth})
		}
	}
}
function speakText(str){
	chrome.runtime.sendMessage({speakText:str})
}
function relay(obj){
	chrome.runtime.sendMessage({socketEvent: "guideEvent", data: obj })
}
function sync(callback=function(){}){
	chrome.storage.local.set(USER, callback)
}
function toServer(eName, obj={}){
	chrome.runtime.sendMessage({socketEvent: eName, data: obj })
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
  };
  const reg = /[&<>]/ig;
  return string.replace(reg, (match)=>(map[match]));
}
function checkWebAddress(url) {
	return window.location.href.indexOf(url) >= 0
}