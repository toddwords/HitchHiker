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
function w(link){
	multiGif(link, false)
}
function w1(){
	multiGif('http://giphygifs.s3.amazonaws.com/media/JXHhI4o9NCf8k/giphy.gif', true)
}
function w2(){
	multiGif('https://media.giphy.com/media/r2DZ7c7zrY1jO/giphy.gif', true)
}
function w3(){
	multiGif('https://media.giphy.com/media/r2DZ7c7zrY1jO/giphy.gif', false)
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
	i('https://www.grad-london.com/blog/images/21_my_comunist/soimii-patriei1.jpg', true)
}
function i2(){
	i('https://womenintheworld.com/wp-content/uploads/2019/07/gettyimages-460590986.jpg?w=2000', true)
}
function i3(){
	i('https://codlea-info.ro/wp-content/uploads/2015/10/pionieri-640x475.gif', true)
}
function i4(){
	i('https://pbs.twimg.com/media/EIOzdgAXkAAmzRu.jpg', true)
}
function i5(){
	i('https://1.bp.blogspot.com/-6fKgVkeQ4Yg/V8Gkgf0FcMI/AAAAAAAABd0/PJA0m6abCcgzfpTsCTkU4dGcEfT6yRtpgCLcB/s1600/Romanian%2Bchildren%2Bwith%2Bportraits%2Bof%2BCeausescus.jpg', true)
}