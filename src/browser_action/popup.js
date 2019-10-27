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
	if(message.rooms && USER.role == "audience" && !USER.room){
		showRooms(message.rooms)
	}
	if(message.users){
		showUsers(message.users)
	}
	if(message.error){
		showError(message.error)
	}
	if(message.joinRoomSuccess){
		joinRoom(message.room)
	}
	if(message.disconnected){
		reset()
	}
})

//event handlers





//on startup
function init(){
	// $('#mainDiv,#reset').hide()
	// $('#currentRoom').html("")
	if(!USER.username){
		USER.username = prompt("What username would you like to go by?")
		chrome.storage.sync.set({username:USER.username})
	}
	if(!USER.role){
		$('#guide,#audience').fadeIn()
		$('#audience').click(function(){
			$('#audience,#guide').hide()
			toServer('getRooms')
			USER.role = "audience"
			chrome.storage.sync.set({role:USER.role})
		})
		$('#guide').click(function(){
			USER.role = "guide"
			chrome.storage.sync.set({role:USER.role})
			var newRoom = prompt("Name your room: ")
			attemptJoinRoom(newRoom)
		})
	} 
	else {
		showChat();
	}

	


}

function showRooms(rooms){
	console.log("showing rooms")
	if($('#roomList').length < 1)
		$('#roomManagement').append("<select id='roomList'></select>")
	$('#roomList').empty().append("<option>Choose an available room:</option>")
	for(var i in rooms){
		console.log(rooms[i].sockets)
		if(!(i in rooms[i].sockets) && i !== 'null')
			$('#roomList').append("<option>"+i+"</option>")
	}
	$('#roomList').change(function(){
		if(this.selectedIndex > 0){
			//audience joins room
			attemptJoinRoom(this.options[this.selectedIndex].value)
		}
	})
}

function showUsers(users){
	for (var i = 0; i < users.length; i++) {
		console.log(users[i])
	}
}
function attemptJoinRoom(room){
	toServer("joinRoom", {room:room, username:USER.username, role:USER.role})
	
}
function joinRoom(room){
	$('#audience,#guide').hide()
	$('#roomList').fadeOut()
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
	$('#actions').load("../modules/guideActions.html",function(){
		bindGuideActions();
	})
}

function addWebsite(){
	chrome.tabs.query({currentWindow: true, active: true}, function (tabs) {
		USER.performances[USER.currentPerformance].urlList.push(tabs[0].url)
		$('#urlList').append("<option>"+tabs[0].url+"</option>")
		sync()
	})
}

function showChat(){
	if(USER.role == "guide"){showGuideTools()}
	$('#mainDiv').fadeIn()
	$('#chatForm button').click(sendMsg)
	$(document).keyup(function(e){
		if(e.key == 'Enter'){
			$(':focus').siblings('button').first().trigger("click")
		}
	})
	$('#reset').fadeIn().click(reset)
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
	$('#messages p').last()[0].scrollIntoView({behavior:"smooth",block:"end"})
	if(user == "The Guide"){
  		chrome.runtime.sendMessage({speakText: msg})
	}

}

function showError(error){
	$('#errorMsg').text(error).fadeIn(400,function(){
		setTimeout(function(){$('#errorMsg').fadeOut()},3000)
	})
}

function newPage(newURL){
	$('#messages').append("<p>Going to <em>"+newURL+"</em></p>")
	chrome.tabs.query({currentWindow: true, index: 0}, function (tabs) {
		chrome.tabs.highlight({tabs:0})
		chrome.tabs.update(tabs[0].id, {url:newURL})
	})
}



function toServer(eName, obj={}){
	chrome.runtime.sendMessage({socketEvent: eName, data: obj })
}

function reset(){
	USER.role = false;
	USER.room = false;
	toServer("leaveRoom", USER)
	sync()
	location.reload()
}

function sync(){
	chrome.storage.sync.set(USER)
}

function relay(obj){
	chrome.runtime.sendMessage({socketEvent: "guideEvent", data: obj })
}