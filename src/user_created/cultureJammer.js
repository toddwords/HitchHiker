//This is the code that will be injected on any page


//put the changes you want to make here
//put a unique chunk of the url inside checkWebAddress, make sure to surround with quotes
//to edit a new website, copy and past the three lines starting with if() and ending with }
function changeWebContent(){
	if(checkWebAddress("nytimes.com")){
		replaceText("rump", "Sunscreen Sandwich")
		// replaceText("Donald Trump", "Sunscreen Sandwich")
		// replaceText("rump", "Sunscreen Sandwich")
	}

	if(checkWebAddress("craigslist")){
		//put in the HTML tag(s) you want to target inside $('') and change the text
		//h1 h2 and h3 are often good for titles, p is good for article text
		$('h1,h2,h3').text("buy buy buy")		
	}
	if(checkWebAddress("tacobell.com")){
		$('h1,h2,h3').text("destroy me with your nacho weapons")
		replaceText("Taco", "Garbage")
		
	}

	if(checkWebAddress("foodnetwork.com")){
		replaceText("Chicken", "Human")
		replaceText("Steak", "Human")
		replaceText("Pork", "Human")
		replaceText("Sausage", "Human")
	}
	//you can use "||" to have the same code run on multiple websites
	if(checkWebAddress("shell.com") || checkWebAddress("bp.com") || checkWebAddress("exxon.com")){
		//you provide a list of links to images in the form replaceImages(["imageLink1", "imageLink2", "imageLink3"])
		//you can provide as many image links as you want, just make sure to surround them with "" and put commas in between
		//don't forget the []
		replaceImages(["https://media.npr.org/assets/img/2019/03/06/ap_19060055964451_wide-d6a93eef34ec41b78facc33907f97084bf4a5916.jpg?s=6", "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Oil-spill.jpg/220px-Oil-spill.jpg", "https://www.irishtimes.com/polopoly_fs/1.3152483.1499874818!/image/image.jpg_gen/derivatives/box_620_330/image.jpg", "https://ak2.picdn.net/shutterstock/videos/18556112/thumb/8.jpg"])
	}

	if(checkWebAddress("grubhub.com")){
		console.log("hi i am on grubhub now");
		$('h1.homepage-hero-copy').text("Never leave your apartment")
		replaceImages(["https://d7hftxdivxxvm.cloudfront.net/?resize_to=width&src=https%3A%2F%2Fartsy-media-uploads.s3.amazonaws.com%2FbYUIIupz_cVL-n6Yv3yazg%252FTracey%2BEmin%2BMy%2BBedInstallation%2BTurner%2BPrize%2BExhibition%2BTate%2BGallery%2BLondon%2B20%2BOctober%2B1999%2B-%2B23%2BJanuary%2B2000%2B%2528medium%2Bres%2529-1200.jpg&width=1200&quality=80"])
	}
	if(checkWebAddress("arbys.com")){
		$('h1,h2,h3,h4,h5,h6,a,p').text("Praise beef. All hail beef.")
		$('a').attr("href", "https://toddwords.com")
	}
}

//here are the functions you can call


changeWebContent();
setTimeout(changeWebContent, 3000)

function checkWebAddress(url) {
	return window.location.href.indexOf(url) >= 0
}
function replaceText(findWord, replaceWord){
 var textnodes = getTextNodes();
 var findRE = new RegExp(findWord, "gi")
 for (var i = 0; i < textnodes.length; i++) {
   var text = textnodes[i].nodeValue;
   textnodes[i].nodeValue = text.replace(findRE, replaceWord);
 }
}
function replaceImages(imgLinkArray){
	//change images on page
	var images = $('img,picture, picture source')
	for (var i = 0, l = images.length; i < l; i++) {
	  console.log(imgLinkArray[i % imgLinkArray.length])
	  console.log(images[i].src)
	  images[i].src = imgLinkArray[i % imgLinkArray.length]
	  images[i]["data-src"] = imgLinkArray[i % imgLinkArray.length]
	  images[i].srcset = imgLinkArray[i % imgLinkArray.length]
	  console.log(images[i].src)
	}
}

 function getTextNodes() {
 // get all html elements
 var elements = document.querySelectorAll("body, body *");
 var results = [];


 //loop through the elements children nodes
 for (var i = 0; i < elements.length; i++) {
   var child = elements[i].childNodes[0];

   // grab everything that's a textNode (nodeType is "3")
   if (elements[i].hasChildNodes() && child.nodeType == 3) {
     results.push(child);
   }
 }

 return results;
}