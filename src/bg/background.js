var USER;
var audioTracks = [];
chrome.storage.sync.get(function(syncData){
      if(!syncData.id){
        chrome.storage.sync.set({"id":new Date().getTime(), "performances": {"First Performance":{"urlList":[]}}, counter:-1, currentPerformance:"First Performance", "username":false },function(){console.log("initialized")})
      }
      chrome.storage.sync.set({"room":false, "role":false, counter:-1, "color":[Math.floor(Math.random() * 180)+75,Math.floor(Math.random() * 180)+75,Math.floor(Math.random() * 180)+75],messages:[]})
      USER = syncData;
    })
chrome.storage.onChanged.addListener(function(){
  chrome.storage.sync.get(function(data){
    USER = data;
  })
})
chrome.extension.onMessage.addListener(
  function(message, sender, sendResponse) {
  	if(message.speakText){
  		speakText(message.speakText)
  	}
  	if(message.socketEvent){
  		socket.emit(message.socketEvent, message.data)
  		if(message.socketEvent == 'newMsg'){
        if(!message.data.username || !message.data.color){
          message.data.username = USER.username;
          message.data.color = USER.color;
        }
        var msg = message.data.msg.trim()
        console.log(msg.slice(0,2))

  			addMsg(message.data.username, msg, message.data.color)
  		}
  	}
  	if(message.getMessages){
  		sendResponse(messages)
  	}
    if(message.isGuide){
      sendResponse(USER.role == "guide")
    }

  });

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    //make sure this is the active tab
    console.log(tab)
    if(USER.role == "guide" && tab.url.indexOf('http') >= 0 && changeInfo.url && tab.active){
      socket.emit('newPage', {url:tab.url})
    }
    if(tab.url.indexOf('http') >= 0 && changeInfo.status == 'complete' && tab.active){
      console.log(chrome.runtime.getURL('src/user_created/'+USER.room+'.js'))
      chrome.tabs.executeScript(null,{file:'src/user_created/'+USER.room+'.js'})
    }
});
// chrome.windows.create({url:"https://valley-gastonia.glitch.me/", type:"popup", state:"minimized"})
var socket = io('https://hitchhiker.glitch.me/')

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
    return false;
  }
  if(data.type == "stopAudio"){
    for (var i = 0; i < audioTracks.length; i++) {
      audioTracks[i].pause();
    }
    return false
  }
  messageToTab(data)
  console.log(data)
})
socket.on('toClient', function(data){
  console.log(data)
  chrome.runtime.sendMessage(data)
})
socket.on('newPage', function(data){
	newPage(data.url)
})
socket.on('newMsg', function(data){
	addMsg(data.username, data.msg, data.color)
	//speakText(data.msg)
	chrome.runtime.sendMessage({newMsg: data})
  chrome.tabs.query({active: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {newMsg: data});
  });

})
socket.on('changeText', function(data){
	console.log('message received')
	changeText(data.newText)
	speakText(data.newText)
})

socket.on('disconnect', function(){
  chrome.runtime.sendMessage({disconnected:true})
})

//functions
function changeText(str){
	messageToTab({changeText: str})
}
function messageToTab(data){
  chrome.tabs.query({currentWindow: true, index:0}, function(tabs) {
      console.log(tabs)
      if(!tabs[0].active){chrome.tabs.highlight({tabs:0})}
      chrome.tabs.sendMessage(tabs[0].id, data);
  });
}
function newPage(newURL){
	chrome.tabs.query({currentWindow: true, index: 0}, function (tabs) {
    console.log(tabs)
    if(!tabs[0].active){chrome.tabs.highlight({tabs:0})}
		chrome.tabs.update(tabs[0].id, {url:newURL}, function(tab){
      tab.title = "[HitchHiker] "+tab.title;  
    })
	})
}

function addMsg(user, msg, color){
	USER.messages.push({username:user, message:msg, color:color})
}

function speakText(text){
  	chrome.tts.speak(text, {voiceName: "Google UK English Male", rate: 0.75})
}

 