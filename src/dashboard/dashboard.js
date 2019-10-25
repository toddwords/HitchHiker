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
	var statusUpdate = setInterval(function(){
		chrome.runtime.sendMessage({socketEvent:"getUsers"})
	}, 5000)
})
chrome.storage.onChanged.addListener(function(){
	chrome.storage.sync.get(function(data){
		USER = data;
	})
})

chrome.runtime.onMessage.addListener(function(message){
	if(message.users){
		USER.users = message.users;
		sync();
		fillUsers();
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
		$('#urlList').empty()
		console.log("change handler running")
		currentPerformance = $('#performanceList').val()
		fillURLs()
		USER.currentPerformance = currentPerformance;
		chrome.storage.sync.set(USER);
	})
	$('#addWebsite').click(function(){
		var newURL = $('#newURL').val().trim();
		if(newURL.indexOf('http') < 0){newURL = "http://"+newURL}
		if(isURL(newURL)){
			$('#newURL').val('')
			USER.performances[currentPerformance].urlList.push(newURL)
			$('#urlList').append("<option>"+newURL+"</option>")
			sync()
		}
	})
	$('#removeWebsite').click(function(){
		USER.performances[USER.currentPerformance].urlList.splice($('#urlList')[0].selectedIndex, 1)
		$('#urlList option:selected').remove()
		sync()
	})

}
function fillURLs(){
	var urls = USER.performances[currentPerformance].urlList;
	for (var i = 0; i < urls.length; i++) {
		$('#urlList').append("<option>"+urls[i]+"</option>")
	}
}
function fillUsers(){
	var users = USER.users ? USER.users : [];
	$('#audienceList').empty()
	for (var i = 0; i < users.length; i++) {
		$('#audienceList').append("<option>"+users[i]+"</option>")
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