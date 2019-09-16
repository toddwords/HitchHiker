var USER;
var currentPerformance;
chrome.storage.sync.get(function(data){
	USER = data;
	currentPerformance = USER.currentPerformance
	var perfs = Object.keys(USER.performances)
	for (var i = 0; i < perfs.length; i++) {
		$('#performanceList').append("<option>"+perfs[i]+"</option>")
	}
	$('#performanceList').val(currentPerformance)
	fillURLs()
	loadEventHandlers()
})
chrome.storage.onChanged.addListener(function(){
	chrome.storage.sync.get(function(data){
		USER = data;
	})
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