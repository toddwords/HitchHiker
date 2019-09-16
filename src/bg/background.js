var guide = false;
var USER;
chrome.storage.sync.get(function(syncData){
      if(!syncData.id){
        chrome.storage.sync.set({"id":new Date().getTime(), "performances": {"First Performance":{"urlList":[]}}, counter:-1, currentPerformance:"First Performance", "username":false},function(){console.log("initialized")})
      }
      chrome.storage.sync.set({"room":false, "role":false, counter:-1, "color":[Math.floor(Math.random() * 180)+75,Math.floor(Math.random() * 180)+75,Math.floor(Math.random() * 180)+75]})
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
        if(guide && msg.slice(0,2) == "x "){
          msg = msg.slice(2)
          socket.emit('changeText', {newText:msg})
          changeText(msg)
          speakText(msg)
        }
  			addMsg(message.data.username, msg, message.data.color)
  		}
  	}
  	if(message.getMessages){
  		sendResponse(messages)
  	}
    if(message.guide == true){
      guide = true;
    }
    if(message.isGuide){
      sendResponse(guide)
    }
  });

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if(guide && tab.url.indexOf('http') >= 0){
      socket.emit('newPage', {url:tab.url})
    }
});

var socket = io('https://hitchhiker.glitch.me/')
var messages = [];
socket.on('guideEvent', function(data){
  if(data.type == "topSites"){
    if(guide){return false};
    chrome.topSites.get(function(sites){
      data.url=sites[data.num].url
    })
  }
  chrome.tabs.query({active: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, data);
  });
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


//functions
function changeText(str){
	chrome.tabs.query({active: true}, function(tabs) {
  		chrome.tabs.sendMessage(tabs[0].id, {changeText: str});
	});
  	//chrome.runtime.sendMessage({speakText: str})


}

function newPage(newURL){
	chrome.tabs.query({currentWindow: true, active: true}, function (tab) {
		chrome.tabs.update(tab.id, {url:newURL})
	})
}

function addMsg(user, msg, color){
	messages.push({username:user, message:msg, color:color})
}

function speakText(text){
  	chrome.tts.speak(text, {voiceName: "Google UK English Male", rate: 0.75})

}

 