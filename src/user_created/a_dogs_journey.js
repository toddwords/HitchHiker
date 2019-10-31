console.log('woof');

var music = new Array(2);

music[0] = new Audio();
music[0].src = 'https://cdn.glitch.com/8a6055ea-f733-4e3d-8b12-b4a304842271%2Fdire_dire_docks.mp3?v=1572504789864';
music[0].loop = false;

music[1] = new Audio();
music[1].src = 'https://cdn.glitch.com/8a6055ea-f733-4e3d-8b12-b4a304842271%2Fkickstart_my_heart.mp3?v=1572504788311';
music[1].loop = false;

function d(arg) {
	if(arg == ''){
		music[0].play();
	} else {
		music[0].pause();
	}
}

function k(arg) {
	if(arg == ''){
		music[1].play();
	} else {
		music[1].pause();
	}
}