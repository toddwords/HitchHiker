console.log('get that bread')
function ease({
  startValue = 0,
  endValue = 1,
  durationMs = 200,
  onStep,
  onComplete = () => {},
}) {
  const raf = window.requestAnimationFrame || (func => window.setTimeout(func, 16));
  
  const stepCount = durationMs / 16;
  const valueIncrement = (endValue - startValue) / stepCount;
  const sinValueIncrement = Math.PI / stepCount;
  
  let currentValue = startValue;
  let currentSinValue = 0;
  
  function step() {
    currentSinValue += sinValueIncrement;
    currentValue += valueIncrement * (Math.sin(currentSinValue) ** 2) * 2;
    
    if (currentSinValue < Math.PI) {
      onStep(currentValue);
      raf(step);
    } else {
      onStep(endValue);
      onComplete();
    }
  }

  raf(step);
}

function inject(css) {
    head = document.getElementsByTagName(`head`)[0],
    style = document.createElement(`style`);

    style.type = `text/css`;
    if (style.styleSheet){
    style.styleSheet.cssText = css;
    } else {
    style.appendChild(document.createTextNode(css));
    }

    //injecting the css to the head
    head.appendChild(style);
}

function flip(time) {
    // time=parseFloat(time)
    end=-1
    start=1
    // time=parseFloat(time)
    console.log(time)
    if (!window.counter) { window.counter = 1;} 
    else  { window.counter ++;
        if (window.counter % 2 == 0) {start=-1; end = 1;}
    };
  // inject(`html {transform: scaleX(${end})}`)
    if(time==NaN){
        console.log('here')
        inject(`html {transform: scaleX(${end})}`)
    } else{
        console.log('else-ed')
        ease({
            startValue: start,
            endValue: end,
            durationMs: time,
            onStep : (value) => {console.log(value); inject(`html {transform: scaleX(${value})}`);},
        })
    }
}

function filters(filterstring){
    if (filterstring==='') {
        filterstring = '0 100 100 0 0'
    }
    if (!window.current) {window.current= {blur: 0, saturate: 100, contrast: 100, invert: 0}} 
    console.log(filterstring)
    vals= filterstring.split(' ')
    blur=parseFloat(vals[0])
    saturate= parseFloat(vals[1])
    contrast = parseFloat(vals[2])
    invert = parseFloat(vals[3])
    time= parseFloat(vals[4])

     if(time === 0) {
        inject(`html {-webkit-filter: blur(${blur}px)saturate(${saturate}%)contrast(${contrast}%)invert(${invert}%);}`)
    } else {
        ease({
            startValue: window.current.blur,
            endValue: blur,
            durationMs: time,
            onStep : (value) => {blur=value},
        })
        ease({
            startValue: window.current.saturate,
            endValue: saturate,
            durationMs: time,
            onStep : (value) => {saturate=value},
        })
        ease({
            startValue: window.current.contrast,
            endValue: contrast,
            durationMs: time,
            onStep : (value) => {contrast=value},
        })
        ease({
            startValue: window.current.invert,
            endValue: invert,
            durationMs: time,
            onStep : (value) => {
                invert=value;
                inject(`html {-webkit-filter: blur(${blur}px)saturate(${saturate}%)contrast(${contrast}%)invert(${invert}%);}`);
                window.current={blur, saturate, contrast, invert}
            },
        })
    }
}

function replacer(replaceString){
    replaceString= replaceString.split('|')
    re = RegExp(replaceString[0], 'gi')
    if (replaceString.length > 2){
        inject(`.replaced { ${replaceString[2]} }`)
    }
    document.body.innerHTML=document.body.innerHTML.replace(re, `<span class=replaced>${replaceString[1]}</span>`)
}

function replacer(replaceString){
    replaceString= replaceString.split('|')
    re = RegExp(replaceString[0], 'gi')
    if (replaceString.length > 2){
        inject(`.replaced { ${replaceString[2]} }`)
    }
    document.body.innerHTML=document.body.innerHTML.replace(re, `<span class=replaced>${replaceString[1]}</span>`)
}

function linker(replaceString){
    replaceString= replaceString.split('|')
    console.log(replaceString[0])
    var anchors = document.getElementsByTagName("a");
        for (var i = 0; i < anchors.length; i++) {
            anchors[i].href = replaceString[0];
            if(anchors[i].innerText && replaceString[1]){anchors[i].innerText = replaceString[1];}
            console.log
        }
    }

function Video(src, append) {
  var v = document.createElement("video");
  if (src != "") {
    v.src = src;
    // v.crossorigin="anonymous"
    v.preload= 'auto'
    v.classList.add('vid');
  }
  if (append == true) {
    document.body.appendChild(v);
  }
  return v;
}


var video = new Video()
var music = new Audio()

function m(arg) {
    music.src=arg;
    music.loop=false;
    console.log('music')
    if(arg !== ''){
        music.play();
    } else {
        music.pause();
    }
}
  
function v(arg) {
    video.src = arg
        if(arg !== ''){
        console.log('vid')
        inject(`.vid {
                  position: fixed;
                  top: 20%;
                  left: 50%;
                  z-index: 300;
                  margin-top: -100px; /* Negative half of height. */
                  margin-left: -250px; /* Negative half of width. */}`)
        document.body.insertBefore(video, document.body.firstChild);
        video.oncanplay = () => { console.log('play'); video.play(); }
    } else {
        video.pause();
        video.currentTime = 0;
        video.remove()
        video.src=''
    }
}



