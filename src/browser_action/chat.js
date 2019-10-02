var USER;
chrome.storage.sync.get(function(syncData){
	USER = syncData
	console.log(USER)
	init()
})
chrome.storage.onChanged.addListener(function(){
	chrome.storage.sync.get(function(data){
		USER = data;
	})
})
chrome.runtime.onMessage.addListener(function(message,sender,sendResponse){
	if(message.newMsg){
		addMsg(message.newMsg.username, message.newMsg.msg, message.newMsg.color)
	}
	if(message.rooms){
		showRooms(message.rooms)
	}
	if(message.users){
		showUsers(message.users)
	}
})

//event handlers





//on startup
function init(){
	if(!USER.username){
		USER.username = prompt("What username would you like to go by?")
		chrome.storage.sync.set({username:USER.username})
	}
	if(!USER.role){
		$('#mainDiv').append("<button id='guide'>Guide</button><button id='audience'>Audience</button>")
		$('#audience').click(function(){
			$('#audience,#guide').hide()
			toServer('getRooms')
			USER.role = "audience"
			chrome.storage.sync.set({role:USER.role})
		})
		$('#guide').click(function(){
			$('#audience,#guide').hide()
			USER.role = "guide"
			chrome.runtime.sendMessage({guide:true})
			chrome.storage.sync.set({role:USER.role})
			var newRoom = prompt("Name your room: ")
			joinRoom(newRoom)
		})
	} else {
		showChat();
	}
	if($('#reset').length < 1){
		$('body').append("<button id='reset'>Leave Room</button>")
	}
	$('#reset').click(reset)


}

function showRooms(rooms){
	if($('#roomList').length < 1)
		$('body').append("<select id='roomList'></select>")
	$('#roomList').append("<option>Choose an available room:</option>")
	for(var i in rooms){
		console.log(rooms[i].sockets)
		if(!(i in rooms[i].sockets) && i !== 'null')
			$('#roomList').append("<option>"+i+"</option>")
	}
	$('#roomList').change(function(){
		if(this.selectedIndex > 0){
			//audience joins room
			joinRoom(this.options[this.selectedIndex].value)
		}
	})
}

function showUsers(users){
	for (var i = 0; i < users.length; i++) {
		console.log(users[i])
	}
}
function joinRoom(room){
	$('#roomList').fadeOut()
	toServer("joinRoom", {room:room, username:USER.username})
	USER.room = room;
	chrome.storage.sync.set({room:room})
	showChat()
	$('#currentRoom').html("<strong>Currently <em>"+USER.role+"</em> in <em>"+USER.room+"</em>")
}
function showGuideTools(){
	$('#guideTools').fadeIn()
	for (var i = 0; i < USER.performances[USER.currentPerformance].urlList.length; i++) {
		$('#urlList').append("<option>"+USER.performances[USER.currentPerformance].urlList[i]+"</option>")
	}
	$('#goButton').click(function(){
		newPage($('#urlList').val())
		USER.counter = $('#urlList')[0].selectedIndex;
		sync()
	})
	$('#goDashboard').click(function(){
      chrome.tabs.create({url:chrome.extension.getURL("src/dashboard/index.html")})
	})
	$('#addWebsite').click(addWebsite);
	$('#draw button').click(function(){
		relay({type:"toggleDrawing"})
	})
	$('#changeText button').click(function(){
		relay({type:"changeText", "text": $('#changeText input').val()})
		$('#changeText input').val("")
	})
	$('#edit button').click(function(){
		relay({type:"graffitiOn"})
	})
	$('#burn button').click(function(){
		relay({type:"multiGif", "src": chrome.extension.getURL("assets/flames.gif")})
	})
	$('#rain button').click(function(){
		relay({type:"multiGif", "src": chrome.extension.getURL("assets/rain.gif"), remove:true})
	})
	$('#dance button').click(function(){
		relay({type:"dance"})
	})
	$('#stopAnimation button').click(function(){
		relay({type:"stopAnimation"})
		console.log("good click")
	})
	$('#getGif button').click(function(){
		getRandomGif($('#getGif input').val())
		// $('#getGif input').val("")
	})
	$('#topSites button').click(function(){
		relay({type:"topSites", num: parseInt($(this).text())-1})
	})
}

function addWebsite(){
	chrome.tabs.query({currentWindow: true, active: true}, function (tabs) {
		USER.performances[USER.currentPerformance].urlList.push(tabs[0].url)
		$('#urlList').append("<option>"+tabs[0].url+"</option>")
		sync()
	})
}
function getRandomGif(tag){
	var url = 'https://api.giphy.com/v1/stickers/random?api_key=SnREKKYQNbZIxQm0BvFOeBhW1lYCDpjy&tag='+tag
	fetch(url)
		.then(function(response){return response.json()})
		.then(function(data){
			relay({type:"multiGif", src:data.data.image_original_url, remove:true})
		  })
		.catch(function(error){
			return console.log(error)
		})
}
function showChat(){
	if(USER.role == "guide"){showGuideTools()}
	$('#chatForm').fadeIn()
	$('#messages').fadeIn()
	$('#chatForm button').click(sendMsg)
	$(document).keyup(function(e){
		if(e.key == 'Enter'){
			$(':focus').siblings('button').trigger("click")
		}
	})
	chrome.runtime.sendMessage({getMessages: true}, function(messages){
		console.log(messages)
		for (var i = 0; i < messages.length; i++) {
			addMsg(messages[i].username, messages[i].message, messages[i].color)
		}
	})
	$('input').focus()
}

function sendMsg(){
	var msg = $('#chatForm input').val();
	if(msg.length > 0){
		toServer('newMsg', {username:USER.username, msg:msg, color:USER.color});
		addMsg(USER.username, msg, USER.color);
		$('#chatForm input').val('')
	}
}
function addMsg(user, msg, color){
	var colorString = "rgba("+color[0]+","+color[1]+","+color[2]+",0.85)"
	$('#messages').append("<p style='background-color:"+colorString+"'><strong>"+user+": </strong>"+msg+"</p>")
	if(user == "The Guide"){
  		chrome.runtime.sendMessage({speakText: msg})
	}

}
function newPage(newURL){
	$('#messages').append("<p>Going to <em>"+newURL+"</em></p>")
	chrome.tabs.query({currentWindow: true, active: true}, function (tab) {
		chrome.tabs.update(tab.id, {url:newURL})
	})
}

function changeText(str){
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
  		chrome.tabs.sendMessage(tabs[0].id, {changeText: str});
	});
  	chrome.runtime.sendMessage({speakText: str})
}

function toServer(eName, obj={}){
	chrome.runtime.sendMessage({socketEvent: eName, data: obj })
}

function reset(){
	USER.role = false;
	USER.room = false;
	console.log(USER)
	init();
}

function sync(){
	chrome.storage.sync.set(USER)
}

function relay(obj){
	chrome.runtime.sendMessage({socketEvent: "guideEvent", data: obj })
}