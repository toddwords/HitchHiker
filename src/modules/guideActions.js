function bindGuideActions(){
	console.log("loaded")
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
		relay({type:"multiGif", "src": "assets/flames.gif", remove:$('#removeGif').is(":checked")})
	})
	$('#rain button').click(function(){
		relay({type:"multiGif", "src": "assets/rain.gif", remove:$('#removeGif').is(":checked")})
	})
	$('#dance button').click(function(){
		relay({type:"dance"})
	})
	$('#stopAnimation button').click(function(){
		relay({type:"stopAnimation"})
		console.log("good click")
	})
	$('#getGif button').click(function(){
		getRandomGif($('#getGif input').val(), $('#removeGif').is(":checked"), $('#sticker').is(":checked"))
		// $('#getGif input').val("")
	})
	$('#topSites button').click(function(){
		relay({type:"topSites", num: parseInt($(this).text())-1})
	})
	// $('#sounds button').click(function(){
	// 	var src = "assets/" + $(this)[0].id + ".mp3"
	// 	console.log(src)
	// 	relay({type:"playSound", src: src})
	// })
	$('#getSound button').first().click(function(){
		getSound($('#getSound input').val(), $('#loop').is(":checked"), $('#randomSound').is(":checked"))
	})
	$('#stopAudio').click(function(){
		relay({type:"stopAudio"})
	})
	$('#runFunction').click(function(){
		runFunction($('#runFunc').val().trim())
	})

}

function getRandomGif(tag, remove=true, sticker=true){
	var url = sticker ? 'https://api.giphy.com/v1/stickers/random?api_key=SnREKKYQNbZIxQm0BvFOeBhW1lYCDpjy&tag='+tag : 'https://api.giphy.com/v1/gifs/random?api_key=SnREKKYQNbZIxQm0BvFOeBhW1lYCDpjy&tag='+tag
	console.log(url)
	fetch(url)
		.then(function(response){return response.json()})
		.then(function(data){
			relay({type:"multiGif", src:data.data.image_original_url, remove:remove})
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
function changeText(str){
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
  		chrome.tabs.sendMessage(tabs[0].id, {changeText: str});
	});
  	chrome.runtime.sendMessage({speakText: str})
}

function choice(arr){
	return arr[Math.floor(Math.random() * arr.length)]
}

function runFunction(msg){
	var spaceIndex = msg.indexOf(" ") > 0 ? msg.indexOf(" ") : msg.length
	var fn = msg.slice(0,spaceIndex);
    var fnparams = [msg.slice(spaceIndex)]
    relay({type:"runFunction", fn: fn, params: fnparams})
}