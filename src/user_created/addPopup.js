
function addPopup(text){
	var popup = $("<h1></h1>")
	$(popup).addClass("popupText").css({
		display:"none", 
		position:"fixed", 
		top:"20%", 
		left:"30%", 
		width:"400px", 
		"background-color":"rgba(140,140,255,0.2)", 
		border: "2px solid blue", 
		"border-radius":"15px",
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


function image(url){
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