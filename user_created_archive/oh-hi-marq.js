function marq(string, color='red'){

	let parent = $('<div></div>');
  $(parent).css({
  	"position":"fixed",
    "top": "0",
    "left": "0",
    "width":"100vw",
    "height":"100vh",
    "overflow":"hidden",
    "padding":"0px",
    "box-sizing":"border-box"
  });

	for(let i=0;i<10;i++){
    let marquee = $('<marquee></marquee>');
    $(marquee).css({
		"position":"fixed",
    "top": 10 * i + "vh",
    "left": "0",
    "height":"10vh"
    });
    
    $(marquee).attr('direction', ()=>{
    	return i%2===0?'left':'right'
    });
    $(marquee).attr('scrollamount', '20');
    
    let h1 = $('<h1></h1>');

    $(h1).css({
      "font-size": "72pt",
      "font-family":"Arial",
      "text-transform":"uppercase",
      "line-height": "0.1",
      "text-stroke": "3px " + color,
      "color": "rgba(0,0,0,0.0)"
    });

    $(h1).text( (string + ' ').repeat(12));

    $(marquee).append(h1);
    $(parent).append(marquee);
  }
  
	$('body').append(parent);
  
  setTimeout( ()=>{
  	$(parent).remove();
  }, 7000);
}