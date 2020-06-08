var USER;
chrome.storage.local.get(function(syncData){
	USER = syncData
	console.log(USER)
	init()
})
chrome.storage.onChanged.addListener(function(){
	chrome.storage.local.get(function(data){
		USER = data;
	})
})
chrome.runtime.onMessage.addListener(function(message,sender,sendResponse){
	if(message.rooms && USER.role == "audience" && !USER.room){
		showRooms(message.rooms)
	}
	if(message.users){
		// showUsers(message.users)
	}
	if(message.error){
		showError(message.error)
	}
	if(message.joinRoomSuccess){
		joinRoom(message.room)
		console.log(message.room + " joined")
	}
	if(message.disconnected){
		// reset()
		console.log("disconnected")
	}
	if(message.restartAsGuide){
		USER.role = "guide";
		init()
	}
	if(message.restartAsAudience){
		USER.role = "audience";
		$('#guideTools').fadeOut()
		init()
	}
})

//event handlers





//on startup
function init(){
	// $('#mainDiv,#reset').hide()
	// $('#currentRoom').html("")
	$('#reset').click(reset)
	if(!USER.username){
		USER.username = prompt("What username would you like to go by?")
		USER.username = sanitize(USER.username)
		chrome.storage.local.set({username:USER.username})
		toServer('newMsg', {username:USER.username, msg:"has joined lobby", color:USER.color});
	}
	$('#chat').load("../modules/chat.html",function(){
		chatInit()
	})
	if(!USER.room){
		$('#guide,#audience').fadeIn()
		$('#audience').click(function(){
			//for private rooms
			let roomToJoin = prompt("what is the name of the room you'd like to join?")
			roomToJoin = roomToJoin.toLowerCase()
			attemptJoinRoom(roomToJoin)
			//
			USER.role = "audience"
			USER.messages = []
			sync()
			//for public rooms
			// $('#audience,#guide').hide()
			// toServer('getRooms')
			
		})
		$('#guide').click(function(){
			USER.messages = []
			USER.role = "guide"
			sync()
			var newRoom = prompt("Name your room: ")
			attemptJoinRoom(newRoom.toLowerCase())
		})
	} 
	else {
		afterJoinRoom();
	}

	


}

function showRooms(rooms){
	console.log("showing rooms")
	if($('#roomList').length < 1)
		$('#roomManagement').append("<select id='roomList'></select>")
	$('#roomList').empty().append("<option>Choose an available room:</option>")
	for(var i in rooms){
		console.log(rooms[i].sockets)
		if(!(i in rooms[i].sockets) && i !== 'null' && i !== "lobby")
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
	chrome.storage.local.set({room:room})
	toServer("status", {msg:USER.username +" has joined"})
	afterJoinRoom()
	chrome.runtime.sendMessage({roomJoined:true})
}

function showGuideTools(){
	$('#guideTools').fadeIn()
	
	$('#actions').load("../modules/guideActions.html",function(){
		bindGuideActions();
	})

}



function afterJoinRoom(){

	if(USER.role == "guide"){showGuideTools()}
	$('#currentRoom').html("<strong>Currently <em>"+USER.role+"</em> in <em>"+USER.room+"</em>")
	$('#mainDiv').fadeIn()
	$('#reset').text("Leave Room")

	
}


function showError(error){
	$('#errorMsg').text(error).fadeIn(400,function(){
		setTimeout(function(){$('#errorMsg').fadeOut()},3000)
	})
}


function toServer(eName, obj={}){
	chrome.runtime.sendMessage({socketEvent: eName, data: obj })
}




function reset(){
	if(!USER.role){chrome.runtime.sendMessage({reconnect:true})}
	else {
		USER.role = false;
		USER.room = false;
		toServer("leaveRoom", USER)
		sync()
		location.reload()
	}
}

function sync(){
	chrome.storage.local.set(USER)
}

function relay(obj){
	chrome.runtime.sendMessage({socketEvent: "guideEvent", data: obj })
}

function sanitize(string) {
  const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
  };
  const reg = /[&<>]/ig;
  return string.replace(reg, (match)=>(map[match]));
}