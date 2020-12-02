var USER;
var audioTracks = [];
let socket;
let connection;

chrome.storage.local.get(function(syncData){
      if(!syncData.id){
        chrome.storage.local.set({"id":new Date().getTime(), "performances": {"First Performance":{"urlList":[], "actions":[]}}, counter:-1, currentPerformance:"First Performance", "username":false, voices:[], currentVoice: "Google UK English Male" },function(){console.log("initialized")})
      }
      chrome.storage.local.set({"room":false, "role":false, isBroadcasting:false,  counter:-1, "color":[Math.floor(Math.random() * 180)+75,Math.floor(Math.random() * 180)+75,Math.floor(Math.random() * 180)+75],messages:[], performanceTab: false, scrollSync:false, speakChat:false, isRecording:false})
      let voiceList = [];
      chrome.tts.getVoices(
        function(voices) {
          for (var i = 0; i < voices.length; i++) {
            if(voices[i].voiceName.indexOf("Google") > -1)
              voiceList.push(voices[i].voiceName);
          }
          for (let index = 0; index < voiceList.length; index++) {
            if(voiceList[0].indexOf("English") < 0){
              voiceList.push(voiceList.shift())
            }
            else {
              break;
            }
            
          }
          syncData.voices = voiceList
          chrome.storage.local.set({"voices":voiceList})
          USER = syncData;
      });
      
    })
chrome.tabs.query({},function(tabs){
  for(let i=0; i<tabs.length; i++){
    if(tabs[i].url.includes("hitchhiker.glitch.me/joinRoom")){
      console.log(tabs[i].id)
      chrome.tabs.reload(tabs[i].id)
      setTimeout(function(){chrome.tabs.update(tabs[i].id, {highlighted:true})},2000)
      
      console.log("success")
    }
  }
})
chrome.storage.onChanged.addListener(function(){
  chrome.storage.local.get(function(data){
    USER = data;
  })
})
chrome.extension.onMessage.addListener(
  function(message, sender, sendResponse) {
  	if(message.speakText){
  		speakText(message.speakText)
  	}
  	if(message.socketEvent){
        // if(message.data.type == "startBroadcast"){
        //   console.log("opening connection")
        //   connection.open(USER.room, function(){
        //     socket.emit(message.socketEvent, message.data)
        //   })
        //   // return false
        // }
        if(message.socketEvent == "leaveRoom"){
          connection.leave()
        }
      socket.emit(message.socketEvent, message.data)
  		// if(message.socketEvent == 'newMsg'){
    //     if(!message.data.username || !message.data.color){
    //       message.data.username = USER.username;
    //       message.data.color = USER.color;
    //     }
    //     var msg = message.data.msg.trim()

  		// 	addMsg(message.data.username, msg, message.data.color)
  		// }
  	}
  	if(message.getMessages){
  		sendResponse(USER.messages)
  	}
    if(message.isGuide){
      sendResponse({guide:USER.role == "guide", id:sender.tab.id})
    }
    // if(message.roomJoined){
    //   onJoinRoom()
    // }
    if(message.newPageClient){
      newPage(message.newPageClient)
    }
    if(message.reconnect){
      socket.disconnect(true)
      connection.leave()
      connectToServer()
    }
    if(message.canBroadcast){
      connection.open(USER.room)
    }
    if(message.createPerformanceTab){
      createNewPerformanceTab(()=>{socket.emit("getCurrentPage")}, false)
    }

  });

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    //make sure this is the active tab
    console.log(changeInfo)
    if(USER.role == "guide" && tab.url.indexOf('http') >= 0 && changeInfo.url && tabId == USER.performanceTab){
      socket.emit('newPage', {url:tab.url})
      
    }
    if(tab.url.indexOf('http') >= 0 && changeInfo.status == 'complete' && tabId == USER.performanceTab){
      tab.title = "[HitchHiker] "+tab.title;
      //to run user enabled scripts
      // console.log(chrome.runtime.getURL('src/user_created/'+USER.room+'.js'))
      // chrome.tabs.executeScript(USER.performanceTab,{file:'src/user_created/'+USER.room+'.js'})
    }
});
//refresh for all when guide refreshes
chrome.webNavigation.onCommitted.addListener(function(details){
  if(details.transitionType == "reload" && USER.role == "guide" && details.url.indexOf('http') >= 0 && details.tabId == USER.performanceTab){
    console.log(details)
    socket.emit('newPage', {url:details.url})
  }
})

chrome.tabs.onRemoved.addListener(function(tabId,removeInfo){
  if(tabId == USER.performanceTab){
    USER.performanceTab = false;
    sync()
  }
})
//DEV SERVER
// var socket = io('https://hitchhiker.glitch.me/')
//PRODUCTION SERVER
// var socket = io("https://hitchhiker-server.herokuapp.com/")
chrome.runtime.onConnect.addListener(function (externalPort) {
  console.log(USER)
  if(USER.room == "lobby" || !USER.room ){
    connectToServer()
    console.log("connecting")
  }
  externalPort.onDisconnect.addListener(function () {
    if(USER.room == "lobby" || !USER.room ){
      socket.disconnect(true);
    }
  })
})
// connectToServer();
function connectToServer(){
  var serverURL = $.ajax({
                    url: "https://raw.githubusercontent.com/toddwords/HitchHiker/master/currentServer.txt",
                    async: false
                 }).responseText.trim();
  // var serverURL = "https://hitchhiker.glitch.me/"
  console.log(serverURL)
  socket = io(serverURL)
  chrome.storage.local.set({"serverURL":serverURL});
  establishRTCConnection(serverURL)
  // socket = io("https://hitchhiker-server.herokuapp.com/")

  // socket.on('connect_error', function(){
  //     console.log("connection error, switching to backup server")
  //     socket = io('https://hitchhiker.glitch.me')
  // })
  socket.on('reconnect', () => {
    if(USER.room){
      socket.emit("joinRoom", {room:USER.room, username:USER.username, role:USER.role})
    }
  });
  socket.on('guideEvent', function(data){
    if(data.type == "topSites"){
      if(USER.role == "guide"){return false};
      chrome.topSites.get(function(sites){
        data.url=sites[data.num].url
      })
    }
    if(data.type == "playSound"){
      console.log(data.src)
      var audio = new Audio(data.src)
      audio.loop = data.loop;
      audioTracks.push(audio)
      audioTracks[audioTracks.length-1].play()
      socket.emit("status", {msg:"playSound"})
      return false;
    }
    if(data.type == "stopAudio"){
      for (var i = 0; i < audioTracks.length; i++) {
        audioTracks[i].pause();
      }
      return false
    }
    if(data.type == "deleteRecent"){
      if(audioTracks.length > 0){
        var stopAudio = audioTracks.pop()
        stopAudio.pause()
      }
      return false
    }
    if(data.type == "startBroadcast" && USER.room && USER.role !== "guide"){
      console.log("broadcast start")
      connection.sdpConstraints.mandatory = {
        OfferToReceiveAudio: true,
        OfferToReceiveVideo: false
      };
      connection.join(USER.room)
    }
    if(data.type == "stopBroadcast" ){
      connection.leave()
    }
    if(data.type == "speakText"){
      speakText(data.msg)
    }
    if(data.type == "setVoice"){
      chrome.storage.local.set({"currentVoice": data.params[0]})
			USER.currentVoice = data.params[0]
    }
    messageToTab(data)
    console.log(data)
  })
  socket.on('toClient', function(data){
    if(data.joinRoomSuccess){
      USER.room = data.room
      sync()
      onJoinRoom();
    }
    if(data.error){
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        var currTab = tabs[0];
        if (currTab) { // Sanity check
          chrome.tabs.sendMessage(currTab.id, data)
        }
      });
    }
    console.log(data)
    chrome.runtime.sendMessage(data)
  })
  socket.on('status', function(data){
    console.log("status received")
    chrome.runtime.sendMessage(data)
  })
  socket.on('heartbeat', function(data){
    console.log(data)
    chrome.runtime.sendMessage({heartbeat:true, "data":data})
  })
  socket.on('newPage', function(data){
  	newPage(data.url)
  })
  socket.on('newMsg', function(data){
  	addMsg(data.username, data.msg, data.color)
  	//speakText(data.msg)
  	chrome.runtime.sendMessage({newMsg: data})
    if(USER.performanceTab)
      chrome.tabs.sendMessage(USER.performanceTab, {newMsg: data});

  })
  socket.on('changeText', function(data){
  	console.log('message received')
  	changeText(data.newText)
  	speakText(data.newText)
  })
  socket.on('becomeGuide', function(data){
    USER.role = "guide"
    sync()
    console.log("i am a guide now")
    chrome.runtime.sendMessage({restartAsGuide:true})
  })
  socket.on("becomeAudience", function(){
      USER.role = "audience"
      sync()
      console.log("i am audience now")
      chrome.runtime.sendMessage({restartAsAudience:true})
  })
  socket.on('reset', function(){
    USER.room = false;
    USER.role = false;
    sync()
    chrome.runtime.sendMessage({reset:true})
  })
      
  socket.on('disconnect', function(reason){
    chrome.runtime.sendMessage({disconnected:true})
    connection.leave();
    console.log(reason)
  })
}
//functions
function changeText(str){
	messageToTab({changeText: str})
}
function messageToTab(data){
    chrome.tabs.sendMessage(USER.performanceTab, data);  
}
function newPage(newURL){
  if(!USER.performanceTab){
    createNewPerformanceTab(updatePage)
  } else {
    updatePage(newURL)
  }	
}
function updatePage(newURL){
  chrome.tabs.update(USER.performanceTab, {url:newURL, active:true}, function(tab){
      tab.title = "[HitchHiker] "+tab.title;
      socket.emit("status", {msg:"currently on "+newURL})  
  })
  var data = {username:"server",msg:"Going to " + newURL,color:[127,127,127]}
  addMsg(data.username, data.msg, data.color)
  chrome.runtime.sendMessage({newMsg: data})
}
function createNewPerformanceTab(callback=function(){}, active=true){
  chrome.tabs.create({url:"https://hitchhiker.glitch.me/start.html", active:active},function(tab){
    USER.performanceTab = tab.id;
    chrome.storage.local.set({performanceTab:tab.id})
    console.log("performance tab created with id " + USER.performanceTab)
    chrome.tabs.move(USER.performanceTab, {index:0})
    callback()
  })
}
function addMsg(user, msg, color){
	USER.messages.push({username:user, message:msg, color:color})
  chrome.storage.local.set({messages:USER.messages})
}

function speakText(text){
  	chrome.tts.speak(text, {voiceName: USER.currentVoice, rate: 0.75})
}

 function openNewWindow(newUrl, left, top, time){
  var newTimeout = setTimeout(function(){
    if(newUrl.slice(0,4) != "http"){newUrl = "http://"+newUrl}
    chrome.windows.create({ url: newUrl, left:left, top:top, width:500, height:400 });
  }, time * 1000)
  timeouts.push(newTimeout)
}

function onJoinRoom(){
  createNewPerformanceTab(function(){
    if(USER.role == "guide"){
      chrome.windows.create({type:"popup",url:chrome.extension.getURL("src/dashboard/index.html"), width:960, height:1080});
      console.log(USER.room)
      // connection.open(USER.room)
    }
    else{
      socket.emit("getCurrentPage")
      connection.sdpConstraints.mandatory = {
        OfferToReceiveAudio: true,
        OfferToReceiveVideo: false
      };
      connection.join(USER.room)
    }
  })
}

function sync(){
  chrome.storage.local.set(USER)
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
	connection.mediaConstraints.video = false

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