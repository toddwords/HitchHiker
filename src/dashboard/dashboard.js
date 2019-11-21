var USER;
var currentPerformance;
chrome.storage.sync.get(function(data){
	chrome.runtime.sendMessage({socketEvent: "getUsers" })
	USER = data;
	currentPerformance = USER.currentPerformance
	$('#roomName').text(USER.room)
	var perfs = Object.keys(USER.performances)
	for (var i = 0; i < perfs.length; i++) {
		$('#performanceList').append("<option>"+perfs[i]+"</option>")
	}
	$('#performanceList').val(currentPerformance)
	fillURLs()
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
})
chrome.storage.onChanged.addListener(function(){
	chrome.storage.sync.get(function(data){
		USER = data;
		fillURLs()
	})
})

chrome.runtime.onMessage.addListener(function(message){
	if(message.users){
		USER.users = message.users;
		sync();
		// fillUsers();
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
		if(!nameInList)
			$('#audienceList').append("<option id='"+message.username+"'>"+message.username + " - "+message.msg+"</option>")
		}
	}
})
function loadEventHandlers(){
	$('#newP').click(function(){
		var perfName = prompt("Name your performance:")
		USER.performances[perfName] = {"urlList":[]}
		$('#performanceList').prepend("<option>"+perfName+"</option>").val(perfName).trigger("change")
		chrome.storage.sync.set(USER)
	})
	$('#performanceList').change(function(){
		$('#performanceURLs').empty()
		console.log("change handler running")
		currentPerformance = $('#performanceList').val()
		fillURLs()
		USER.currentPerformance = currentPerformance;
		chrome.storage.sync.set(USER);
	})
	$('#addWebsiteDashboard').click(function(){
		var newURL = $('#newURL').val().trim();
		if(newURL.indexOf('http') < 0){newURL = "http://"+newURL}
		if(isURL(newURL)){
			$('#newURL').val('')
			USER.performances[currentPerformance].urlList.push(newURL)
			$('#performanceURLs').append("<option>"+newURL+"</option>")
			sync()
		}
	})
	$('#removeWebsite').click(function(){
		USER.performances[USER.currentPerformance].urlList.splice($('#performanceURLs')[0].selectedIndex, 1)
		$('#performanceURLs option:selected').remove()
		sync()
	})

}
function fillURLs(){
	var urls = USER.performances[currentPerformance].urlList;
	$('#performanceURLs').empty()
	for (var i = 0; i < urls.length; i++) {
		$('#performanceURLs').append("<option>"+urls[i]+"</option>")
	}
}
function fillUsers(){
	var users = USER.users ? USER.users : [];
	$('#audienceList').empty()
	for (var i = 0; i < users.length; i++) {
		$('#audienceList').append("<option id='"+users[i]+"'>"+users[i]+"</option>")
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

function sync(){
	chrome.storage.sync.set(USER)
}

function relay(obj){
	chrome.runtime.sendMessage({socketEvent: "guideEvent", data: obj })
}