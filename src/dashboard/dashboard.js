var USER;
var currentPerformance;
let connection;
let socket;


chrome.storage.local.get(function(data){
	chrome.runtime.sendMessage({socketEvent: "getUsers" })
	USER = data;
	currentPerformance = USER.currentPerformance
	$('#roomName').text(USER.room)
	fillPerformances()
	fillURLs()
	fillActions()
	loadEventHandlers()
	$('#actions').load("../modules/guideActions.html",function(){
		bindGuideActions();
	})
	$('#chat').load("../modules/chat.html",function(){
		chatInit();
	})
	var statusUpdate = setInterval(function(){
		chrome.runtime.sendMessage({socketEvent:"getUsers"})
	}, 5000)
	socket = io(USER.serverURL)
	establishRTCConnection(USER.serverURL)
})
chrome.storage.onChanged.addListener(function(){
	chrome.storage.local.get(function(data){
		USER = data;
		fillURLs()
		fillActions()
	})
})

chrome.runtime.onMessage.addListener(function(message){
	if(message.users){
		console.log(message.users)
		USER.users = message.users;
		sync();
		fillUsers(message.users);
	}
	if(message.type == "status"){
		var nameInList = false;
		if(message.msg == "disconnect"){
			$('#'+message.username).remove()
		} else {
		$('#audienceList option').each(function(){
			if($(this).attr("id") == message.username){
				$(this).text(message.username + " - "+message.msg)
				nameInList = true;
			}
		})
		if(!nameInList && message.username != USER.username)
			$('#audienceList').append("<option id='"+message.username+"'>"+message.username + " - "+message.msg+"</option>")
		}
	}
	if(message.restartAsAudience){
		window.close()
	}
})
function loadEventHandlers(){
	$('#newP').click(function(){
		var perfName = prompt("Name your performance:")
		USER.performances[perfName] = {"urlList":[]}
		$('#performanceList').prepend("<option>"+perfName+"</option>").val(perfName).trigger("change")
		sync()
		fillURLs();
	})
	$('#exportPerformance').click(exportPerformance)
	$('#importButton').click(function(){
		$('#importButton').hide()
		$('#importPerformance').fadeIn()
		$('#importPerformance').change(getFile)
	})
	$('#removePerformance').click(function(){
		if(confirm("Are you sure you want to delete "+ USER.currentPerformance + "?")){
			let toRemove = USER.currentPerformance
			delete USER.performances[USER.currentPerformance]
			$('#performanceList option:selected').remove();
			$('#performanceList').trigger("change")
		}
	})
	$('#performanceList').change(function(){
		$('#performanceURLs').empty()
		console.log("change handler running")
		currentPerformance = $('#performanceList').val()
		USER.currentPerformance = currentPerformance;
		fillURLs()
		sync()
	})
	$('#addWebsiteDashboard').click(function(){
		var newURL = $('#newURL').val().trim();
		if(newURL.indexOf('http') < 0){newURL = "http://"+newURL}
		if(isURL(newURL)){
			$('#newURL').val('')
			USER.performances[currentPerformance].urlList.push(newURL)
			sync()
			fillURLs();
		}
	})
	$('#websiteUp').click(function(){
		arraySwap(USER.performances[USER.currentPerformance].urlList, $('#performanceURLs')[0].selectedIndex, $('#performanceURLs')[0].selectedIndex - 1)
		sync()
	})
	$('#websiteDown').click(function(){
		arraySwap(USER.performances[USER.currentPerformance].urlList, $('#performanceURLs')[0].selectedIndex, $('#performanceURLs')[0].selectedIndex + 1)
		sync()
	})
	$('#removeWebsite').click(function(){
		USER.performances[USER.currentPerformance].urlList.splice($('#performanceURLs')[0].selectedIndex, 1)
		$('#performanceURLs option:selected').remove()
		sync()
	})
	$('#playAction').click(function(){
		var action = USER.performances[USER.currentPerformance].actions[$('#actionList')[0].selectedIndex]
		console.log(action)
		console.log(window[action.fn])
		if(typeof window[action.fn] == "function"){
			window[action.fn].apply(null,action.params)
		}
		else {
			action.type = action.fn
			relay(action)
		}
		var index = $('#actionList')[0].selectedIndex + 1;
		setTimeout(function(){$('#actionList').focus(); $('#actionList')[0].selectedIndex = index}, 200);
	})
	$('#actionUp').click(function(){
		arraySwap(USER.performances[USER.currentPerformance].actions, $('#actionList')[0].selectedIndex, $('#actionList')[0].selectedIndex - 1)
		sync()
		$('#actionList').focus()
	})
	$('#actionDown').click(function(){
		arraySwap(USER.performances[USER.currentPerformance].actions, $('#actionList')[0].selectedIndex, $('#actionList')[0].selectedIndex + 1)
		sync()
		$('#actionList').focus()
	})
	$('#actionDel').click(function(){
		USER.performances[USER.currentPerformance].actions.splice($('#actionList')[0].selectedIndex, 1)
		$('#actionList option:selected').remove()
		sync()
		$('#actionList').focus()
	})
	$('#actionList').keyup(function(e){
		if(e.which == 32)
			$('#playAction').trigger("click")
	})
	setBroadcastButton()
	$('#voiceBroadcast button').click(function(){
		if(USER.isBroadcasting){
			relay({type:"stopBroadcast"})
			connection.leave();
			USER.isBroadcasting = false;
			setBroadcastButton()
		}
		else {
			if(connection.waitingForLocalMedia){
				navigator.mediaDevices.getUserMedia({audio:true, video:false}).then(()=>{
					connection.open(USER.room, () =>{
						USER.isBroadcasting = true;
						relay({type:"startBroadcast"})
						setBroadcastButton()
					})
					
				})
			} else {
				connection.open(USER.room, () =>{
					USER.isBroadcasting = true;
					relay({type:"startBroadcast"})
					setBroadcastButton()
				})
			}
		}
		
		sync()
	})
	$('#addGuide').click(function(){
		var username = $('#audienceList').children(":selected").attr("id")
		chrome.runtime.sendMessage({socketEvent: "addGuide", data: {username:username}})
	})
	$('#swapGuide').click(function(){
		var username = $('#audienceList').children(":selected").attr("id")
		chrome.runtime.sendMessage({socketEvent: "swapGuide", data: {username:username}})
	})

}
function fillPerformances(){
	var perfs = Object.keys(USER.performances)
	$('#perormanceList').empty()
	for (var i = 0; i < perfs.length; i++) {
		$('#performanceList').append("<option>"+perfs[i]+"</option>")
	}
	$('#performanceList').val(currentPerformance)
}
function fillURLs(){
	var urls = USER.performances[currentPerformance].urlList;
	$('#performanceURLs, #urlList').empty()
	for (var i = 0; i < urls.length; i++) {
		$('#performanceURLs, #urlList').append("<option>"+urls[i]+"</option>")
	}

}
function fillActions(){
	if(!USER.performances[currentPerformance].actions)
		USER.performances[currentPerformance].actions = [];
	var actions = USER.performances[currentPerformance].actions
	$("#actionList").empty()
	for (var i = 0; i < actions.length; i++) {
		if(actions[i]){
			var actionString = actions[i].fn
			if(typeof actions[i].params[0] == "string")
				actionString += ": "+actions[i].params[0]
			$('#actionList').append("<option>"+actionString+"</option>")
		}
	}
}
function fillUsers(users){
	for (var i = 0; i < users.length; i++) {
		if($("#audienceList #"+users[i]).length > 0 || users[i] == USER.username){continue}
		$('#audienceList').append("<option id='"+users[i]+"'>"+users[i]+"</option>")
	}
	$('#audienceList option').each(function(){
		if(!users.includes($(this).attr("id"))){
			$(this).remove()
		}
	})
}

function exportPerformance(){
	let perf = USER.performances[USER.currentPerformance]
	download(JSON.stringify(perf), USER.currentPerformance + ".hitch")
}
function download(content, fileName) {
    var a = document.createElement("a");
    var file = new Blob([content], {type: "text/plain"});
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
}


function arraySwap(arr, index1, index2){
	if(index2 >= arr.length){
		arr.pop().unshift()
	}
	else if(index2 < 0){
		arr.shift().push()
	}
	else{
		[arr[index1], arr[index2]] = [arr[index2], arr[index1]];
	}
}

function isURL(str) {
  var regex = /(http|https):\/\/(\w+:{0,1}\w*)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%!\-\/]))?/;
  if(!regex .test(str)) {
    return false;
  } else {
    return true;
  }
}


function getFile(event) {
	const input = event.target
  if ('files' in input && input.files.length > 0) {
	  importFileContent(input.files[0])
  }
}

function importFileContent( file) {
	console.log(file)
	let fileName = file.name;
	readFileContent(file).then(content => {
	  	newPerformance = JSON.parse(content);
	  	perfName = fileName.split(".hitch")[0]
		USER.performances[perfName] = newPerformance
		$('#performanceList').prepend("<option>"+perfName+"</option>").val(perfName).trigger("change")
		sync()
		fillURLs();
	  	$('#importPerformance').hide()
	  	$('#importButton').show()
  }).catch(error => console.log(error))
}

function readFileContent(file) {
	const reader = new FileReader()
  return new Promise((resolve, reject) => {
    reader.onload = event => resolve(event.target.result)
    reader.onerror = error => reject(error)
    reader.readAsText(file)
  })
}
function sync(){
	chrome.storage.local.set(USER)
}

function relay(obj){
	chrome.runtime.sendMessage({socketEvent: "guideEvent", data: obj })
}

function establishRTCConnection(socketURL){
	connection = new RTCMultiConnection();
	connection.socketURL = socketURL
	connection.socketMessageEvent = 'rtc-connect';
	connection.session = {
	  audio: true,
	  video: false,
	  oneway: true
	}
	connection.sdpConstraints.mandatory = {
	  OfferToReceiveAudio: false,
	  OfferToReceiveVideo: false
	};
	connection.iceServers = [{
	'urls': [
		'stun:stun.l.google.com:19302',
		'stun:stun1.l.google.com:19302',
		'stun:stun2.l.google.com:19302',
		'stun:stun.l.google.com:19302?transport=udp',
	]
	}];
	connection.audiosContainer = document.getElementById('audios-container');
	connection.onstream = function(event) {
	  var existing = document.getElementById(event.streamid);
	  if(existing && existing.parentNode) {
		existing.parentNode.removeChild(existing);
	  }
  
	  event.mediaElement.removeAttribute('src');
	  event.mediaElement.removeAttribute('srcObject');
	  event.mediaElement.muted = true;
	  event.mediaElement.volume = 0;
  
	  var audio = document.createElement('audio');
  
	  try {
		  audio.setAttributeNode(document.createAttribute('autoplay'));
		  audio.setAttributeNode(document.createAttribute('playsinline'));
	  } catch (e) {
		  audio.setAttribute('autoplay', true);
		  audio.setAttribute('playsinline', true);
	  }
  
	  if(event.type === 'local') {
		audio.volume = 0;
		try {
			audio.setAttributeNode(document.createAttribute('muted'));
		} catch (e) {
			audio.setAttribute('muted', true);
		}
	  }
	  audio.srcObject = event.stream;
  
	  var width = 100;
	  var mediaElement = getHTMLMediaElement(audio, {
		  title: event.userid,
		  buttons: ['full-screen'],
		  width: width,
		  showOnMouseEnter: false
	  });
  
	  connection.audiosContainer.appendChild(mediaElement);
  
	  setTimeout(function() {
		  mediaElement.media.play();
	  }, 5000);
  
	  mediaElement.id = event.streamid;
  };
  connection.onstreamended = function(event) {
	var mediaElement = document.getElementById(event.streamid);
	if (mediaElement) {
		mediaElement.parentNode.removeChild(mediaElement);
  
		if(event.userid === connection.sessionid && !connection.isInitiator) {
		  alert('Broadcast is ended. We will reload this page to clear the cache.');
		  location.reload();
		}
	}
  };
  
  connection.onMediaError = function(e) {
	if (e.message === 'Concurrent mic process limit.') {
		if (DetectRTC.audioInputDevices.length <= 1) {
			alert('Please select external microphone. Check github issue number 483.');
			return;
		}
  
		var secondaryMic = DetectRTC.audioInputDevices[1].deviceId;
		connection.mediaConstraints.audio = {
			deviceId: secondaryMic
		};
  
		connection.join(connection.sessionid);
	}
  };
  
  }
  function setBroadcastButton(){
	if(USER.isBroadcasting){
		$('#voiceBroadcast button').css("background-color", "rgba(255,0,0,0.3)")
		$('#voiceBroadcast span').text("On")
	} else {
		$('#voiceBroadcast button').css("background-color", "")
		$('#voiceBroadcast span').text("Off")
	}
}