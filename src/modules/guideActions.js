function bindGuideActions(){
	console.log("loaded")
	$('#goDashboard').click(function(){
      chrome.windows.create({type:"popup",url:chrome.extension.getURL("src/dashboard/index.html"), width:960, height:1080})
	})
	$('#addWebsite').click(addWebsite);
	$('.actionHeader').click(function(){
		$(this).next('.actionDiv').first().slideToggle()
	})
	for (var i = 0; i < USER.performances[USER.currentPerformance].urlList.length; i++) {
		$('#urlList').append("<option>"+USER.performances[USER.currentPerformance].urlList[i]+"</option>")
	}
	$('#goButton').click(function(){
		console.log("go button pressed")
		var url = $('#urlList').val();
		var index = $('#urlList')[0].selectedIndex
		console.log("url: "+url)
		console.log("index: "+index)
		save({fn:"goToPage", params:[url, index]})
		goToPage(url, index)
	})

	$('#draw button').click(function(){
		toggleDraw()
		save({fn:"toggleDraw", params:[]})
	})
	$('#speakChat').prop("checked", USER.speakChat)
	$('#speakChat').change(function(){
		USER.speakChat = $(this).prop("checked")
		chrome.storage.local.set({speakChat:$(this).prop("checked")})
	})
	$('#changeText button').click(function(){
		changeText($('#changeText input').val())
		save({fn:"changeText", params:[$('#changeText input').val()]})
	})
	$('#edit button').click(function(){
		editOn()
		save({fn:"editOn", params:[]})
	})
	$('#scrollSync').prop("checked", USER.scrollSync)
	$('#scrollSync').change(function(){
		USER.scrollSync = $(this).prop("checked")
		chrome.storage.local.set({scrollSync:$(this).prop("checked")})
	})
	$('#burn button').click(function(){
		burn($('#removeGif').is(":checked"))
		save({fn:"burn", params:[$('#removeGif').is(":checked")]})
	})
	$('#rain button').click(function(){
		rain($('#removeGif').is(":checked"))
		save({fn:"rain", params:[$('#removeGif').is(":checked")]})
	})
	$('#dance button').click(function(){
		dance()
		save({fn:"dance", params:[]})
	})
	$('#stopAnimation button').click(function(){
		stopAnimation()
		save({fn:"stopAnimation", params:[]})
		
	})
	$('#getGif button').click(function(){
		getGif($('#getGif input').val(), $('#removeGif').is(":checked"), $('#sticker').is(":checked"))
		// $('#getGif input').val("")
		save({fn:"getGif", params:[$('#getGif input').val(), $('#removeGif').is(":checked"), $('#sticker').is(":checked")]})
	})
	$('#topSites button').click(function(){
		goTopSite(parseInt($(this).text())-1)
		save({fn:"goTopSite", params:[parseInt($(this).text())-1]})
	})
	// $('#sounds button').click(function(){
	// 	var src = "assets/" + $(this)[0].id + ".mp3"
	// 	console.log(src)
	// 	relay({type:"playSound", src: src})
	// })
	$('#getSound button').first().click(function(){
		getSound($('#getSound input').val(), $('#loop').is(":checked"), $('#randomSound').is(":checked"))
		save({fn:"getSound", params:[$('#getSound input').val(), $('#loop').is(":checked"), $('#randomSound').is(":checked")]})
	})
	$('#stopAudio').click(function(){
		stopAudio()
		save({fn:"stopAudio", params:[]})

	})
	$('#stopLast').click(function(){
		stopLastAudio()
		save({fn:"stopLastAudio", params:[]})
	})
	$('#runFunction').click(function(){
		runFunction($('#runFunc').val().trim())
		save({fn:"runFunction", params:[$('#runFunc').val().trim()]})
	})
	$('#recordActions').prop("checked", USER.isRecording)
	$('#recordActions').change(function(){
		USER.isRecording = $(this).prop("checked")
		chrome.storage.local.set({isRecording:$(this).prop("checked")})
	})


}
function changeTxt(text){
	relay({type:"changeText", "text": text})
	$('#changeText input').val("")
}
function editOn(){
	relay({type:"graffitiOn"})
}
function goToPage(url,counter){
	newPage(url)
	USER.counter = counter;
	console.log(USER)
	console.log("USER.counter: "+USER.counter)
	chrome.storage.local.set({counter:counter})
}
function toggleDraw(){
	relay({type:"toggleDrawing"})
}
function burn(remove){
	relay({type:"multiGif", "src": "assets/flames.gif", remove:remove})

}
function rain(remove){
	relay({type:"multiGif", "src": "assets/rain.gif", remove:remove})

}
function dance(){
	relay({type:"dance"})
}
function stopAnimation(){
	relay({type:"stopAnimation"})
}
function getGif(tag, remove=true, sticker=true){
	var url = sticker ? 'https://api.giphy.com/v1/stickers/search?api_key=SnREKKYQNbZIxQm0BvFOeBhW1lYCDpjy&limit=1&q='+tag : 'https://api.giphy.com/v1/gifs/random?api_key=SnREKKYQNbZIxQm0BvFOeBhW1lYCDpjy&limit=1&q='+tag
	console.log(url)
	fetch(url)
		.then(function(response){return response.json()})
		.then(function(data){
			relay({type:"multiGif", src:data.data[0].images.downsized_medium.url, remove:remove})
		  })
		.catch(function(error){
			return console.log(error)
		})
}
function getSound(query,loop=false,random=false){
	var url = "https://freesound.org/apiv2/search/text/?query="+query+"&fields=name,previews&token=x7M8M6ynwyXPNWMpwDLnJRGS8HwAthvbof6Ge820&format=json"
	fetch(url)
		.then(function(response){return response.clone().text()})
		.then(function(data){
			console.log(data)
			data = JSON.parse(data)
			if(data.results.length >= 1)
				var src = random ? choice(data.results).previews["preview-hq-mp3"] : data.results[0].previews["preview-hq-mp3"]
				relay({type:"playSound", src:src, loop:loop})
		  })
		.catch(function(error){
			return console.log(error)
		})
}
function stopAudio(){
	relay({type:"stopAudio"})
}
function stopLastAudio(){
	relay({type:"deleteRecent"})
}
function goTopSite(num){
		relay({type:"topSites", num: num})
}
function changeText(str){
  	chrome.tabs.sendMessage(USER.performanceTab, {changeText: str});

  	chrome.runtime.sendMessage({speakText: str})
}

function choice(arr){
	return arr[Math.floor(Math.random() * arr.length)]
}

function runFunction(msg){
	var spaceIndex = msg.indexOf(" ") > 0 ? msg.indexOf(" ") : msg.length
	var fn = msg.slice(0,spaceIndex);
    var fnparams = [msg.slice(spaceIndex+1)]
    relay({type:"runFunction", fn: fn, params: fnparams})
}
function newPage(newURL){
	chrome.runtime.sendMessage({newPageClient:newURL})
}

function addWebsite(){
	chrome.tabs.query({currentWindow: true, active: true}, function (tabs) {
		USER.performances[USER.currentPerformance].urlList.push(tabs[0].url)
		$('#urlList').append("<option>"+tabs[0].url+"</option>")
		sync()
	})
}

function save(obj){
	if(!USER.performances[USER.currentPerformance].actions)
		USER.performances[USER.currentPerformance].actions = [];
	if(USER.isRecording){
		USER.performances[USER.currentPerformance].actions.push(obj)
		sync()
	}
}