function say(text){
	var popup = $("<h1></h1>")
	$(popup).addClass("popupText").css({
		display:"none", 
		position:"fixed", 
		top:"20%", 
		left:"30%", 
		width:"auto", 
		"background-color":"hsla(0, 94%, 42%, 0.23)", 
		border: "2px solid red", 
		"border-radius":"8px",
		padding: "10px",
		"font-size": "36px", 
		"z-index":10+$('.popupText').length
	})
	$(popup).text(text)
	$('body').prepend(popup)
	$(popup).fadeIn(400,function(){
		setTimeout(function(){$(popup).fadeOut()},4000)
	})

}
function g(link){
	multiGif(link, false)
}
function g1(){
	multiGif('https://media.giphy.com/media/3o6EQwp2hC6qNMOLD2/giphy.gif', false)
}
function g2(){
	multiGif('https://media.giphy.com/media/bd7L52BISB3Nu/giphy.gif', false)
}
function g3(){
	multiGif('https://media.giphy.com/media/S6BkrjfU6B51S/giphy.gif', true)
}
function g4(){
	multiGif('https://media.giphy.com/media/kyeCYsUNtKwtW/giphy.gif', true)
}
function i(url){
	var img = $("<img />").attr('src', url)
	$(img).addClass("popupImg").css({
		display:"none", 
		position:"fixed", 
		top:"10%", 
		left:"20%", 
		width:"60%", 
		
		"z-index":999
	})
	$('body').prepend(img)
	$(img).fadeIn(400).delay(4000).fadeOut()
}
function i1(){
	i('https://i.ebayimg.com/images/g/PTYAAOSwcUBYGHJU/s-l300.jpg', true)
}
function i2(){
	i('https://i.pinimg.com/474x/97/ea/56/97ea5628c881201dc498c1ffc20ad3b1--fashion-editorials-columbia.jpg', true)
}
function i3(){
	i('https://scontent.fnyc1-1.fna.fbcdn.net/v/t1.0-9/383594_168567876577622_27393130_n.jpg?_nc_cat=104&_nc_oc=AQndjF5UDkY8zJaYyzoUOSnpQkY2AhfS66n9vRn-KgJMmAg0WPnS_A-PM8CnWw-u1pk&_nc_ht=scontent.fnyc1-1.fna&oh=980dc045d1cf0a19e33f2afbf4f9807d&oe=5E817C60', true)
}

function erase(letters){
 var textnodes = getTextNodes();
 var findRE = new RegExp(letters, "gi")
 for (var i = 0; i < textnodes.length; i++) {
   var text = textnodes[i].nodeValue;
   textnodes[i].nodeValue = text.replace(findRE, "");
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