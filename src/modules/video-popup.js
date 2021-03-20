let USER;
let broadcastId;
chrome.storage.local.get(function(data){
    USER = data;
    broadcastId = USER.room;
    startStream();
})

// recording is disabled because it is resulting for browser-crash
// if you enable below line, please also uncomment above "RecordRTC.js"
var enableRecordings = false;

var connection = new RTCMultiConnection();

// https://www.rtcmulticonnection.org/docs/iceServers/
// use your own TURN-server here!
connection.iceServers = [{
    'urls': [
        'stun:stun.l.google.com:19302',
        'stun:stun1.l.google.com:19302',
        'stun:stun2.l.google.com:19302',
        'stun:stun.l.google.com:19302?transport=udp',
    ]
}];

// its mandatory in v3
connection.enableScalableBroadcast = true;

// each relaying-user should serve only 1 users
connection.maxRelayLimitPerUser = 1;

// we don't need to keep room-opened
// scalable-broadcast.js will handle stuff itself.
connection.autoCloseEntireSession = true;

// by default, socket.io server is assumed to be deployed on your own URL
connection.socketURL = 'https://hitchhiker-server.herokuapp.com/';

// comment-out below line if you do not have your own socket.io server
// connection.socketURL = 'https://rtcmulticonnection.herokuapp.com:443/';

connection.socketMessageEvent = 'scalable-media-broadcast-demo';

// document.getElementById('broadcast-id').value = connection.userid;

// user need to connect server, so that others can reach him.
connection.connectSocket(function(socket) {
    socket.on('logs', function(log) {
        console.log(log)
    });

    // this event is emitted when a broadcast is already created.
    socket.on('join-broadcaster', function(hintsToJoinBroadcast) {
        console.log('join-broadcaster', hintsToJoinBroadcast);

        connection.session = hintsToJoinBroadcast.typeOfStreams;
        connection.sdpConstraints.mandatory = {
            OfferToReceiveVideo: !!connection.session.video,
            OfferToReceiveAudio: !!connection.session.audio
        };
        connection.broadcastId = hintsToJoinBroadcast.broadcastId;
        connection.join(hintsToJoinBroadcast.userid);
    });

    socket.on('rejoin-broadcast', function(broadcastId) {
        console.log('rejoin-broadcast', broadcastId);

        connection.attachStreams = [];
        socket.emit('check-broadcast-presence', broadcastId, function(isBroadcastExists) {
            if (!isBroadcastExists) {
                // the first person (i.e. real-broadcaster) MUST set his user-id
                connection.userid = USER.room;
            }

            socket.emit('join-broadcast', {
                broadcastId: broadcastId,
                userid: connection.userid,
                typeOfStreams: connection.session
            });
        });
    });

    socket.on('broadcast-stopped', function(broadcastId) {
        // alert('Broadcast has been stopped.');
        // location.reload();
        console.error('broadcast-stopped', broadcastId);
        // alert('This broadcast has been stopped.');
    });

    // this event is emitted when a broadcast is absent.
    socket.on('start-broadcasting', function(typeOfStreams) {
        console.log('start-broadcasting', typeOfStreams);

        // host i.e. sender should always use this!
        connection.sdpConstraints.mandatory = {
            OfferToReceiveVideo: false,
            OfferToReceiveAudio: false
        };
        connection.session = typeOfStreams;

        // "open" method here will capture media-stream
        // we can skip this function always; it is totally optional here.
        // we can use "connection.getUserMediaHandler" instead
        connection.open(connection.sessionid);
    });
});

window.onbeforeunload = function() {
    // Firefox is ugly.
    document.getElementById('open-or-join').disabled = false;
};

var videoPreview = document.getElementById('video-preview');

connection.onstream = function(event) {
    if (connection.isInitiator && event.type !== 'local') {
        return;
    }

    connection.isUpperUserLeft = false;
    videoPreview.srcObject = event.stream;
    videoPreview.play();

    videoPreview.userid = event.userid;

    if (event.type === 'local') {
        videoPreview.muted = true;
    }

    if (connection.isInitiator == false && event.type === 'remote') {
        // he is merely relaying the media
        connection.dontCaptureUserMedia = true;
        connection.attachStreams = [event.stream];
        connection.sdpConstraints.mandatory = {
            OfferToReceiveAudio: false,
            OfferToReceiveVideo: false
        };

        connection.getSocket(function(socket) {
            socket.emit('can-relay-broadcast');

            if (connection.DetectRTC.browser.name === 'Chrome') {
                connection.getAllParticipants().forEach(function(p) {
                    if (p + '' != event.userid + '') {
                        var peer = connection.peers[p].peer;
                        peer.getLocalStreams().forEach(function(localStream) {
                            peer.removeStream(localStream);
                        });
                        event.stream.getTracks().forEach(function(track) {
                            peer.addTrack(track, event.stream);
                        });
                        connection.dontAttachStream = true;
                        connection.renegotiate(p);
                        connection.dontAttachStream = false;
                    }
                });
            }

    

        });
    }

    // to keep room-id in cache
    localStorage.setItem(connection.socketMessageEvent, connection.sessionid);
};

// ask node.js server to look for a broadcast
// if broadcast is available, simply join it. i.e. "join-broadcaster" event should be emitted.
// if broadcast is absent, simply create it. i.e. "start-broadcasting" event should be fired.
let startStream = function() {
    var broadcastId = USER.room;
    if (broadcastId.replace(/^\s+|\s+$/g, '').length <= 0) {
        alert('Please enter broadcast-id');
        return;
    }


    connection.extra.broadcastId = broadcastId;

    connection.session = {
        audio: true,
        video: true,
        oneway: true
    };

    connection.getSocket(function(socket) {
        socket.emit('check-broadcast-presence', broadcastId, function(isBroadcastExists) {
            if (!isBroadcastExists && USER.role == "guide") {
                // the first person (i.e. real-broadcaster) MUST set his user-id
                connection.userid = USER.room;
            }

            console.log('check-broadcast-presence', broadcastId, isBroadcastExists);

            socket.emit('join-broadcast', {
                broadcastId: broadcastId,
                userid: connection.userid,
                typeOfStreams: connection.session
            });
        });
    });
};

connection.onstreamended = function() {};

connection.onleave = function(event) {
    if (event.userid !== videoPreview.userid) return;

    connection.getSocket(function(socket) {
        socket.emit('can-not-relay-broadcast');
        connection.isUpperUserLeft = true;
    });
};





// ......................................................
// ......................Handling broadcast-id................
// ......................................................





// below section detects how many users are viewing your broadcast

connection.onNumberOfBroadcastViewersUpdated = function(event) {
    if (!connection.isInitiator) return;

    document.getElementById('broadcast-viewers-counter').innerHTML = 'Number of broadcast viewers: <b>' + event.numberOfBroadcastViewers + '</b>';
};