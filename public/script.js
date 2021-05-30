if(ROOMH_ID){
  console.log(ROOMH_ID);console.log("not null");
}

const socket = io("/");
const peer = new Peer(undefined, {
  secure: true,
  host: "spanion-video-chat-peer.herokuapp.com",
});
const peers = {};
const videoGrid = document.getElementById("video-grid");
const videoss = document.getElementById("videoss");
const mediaConfig = {
  video: true,
  audio: true,
};

peer.on("open", (id) => {
  socket.emit("join-room", ROOM_ID, id);
  navigator.mediaDevices
    .getUserMedia(mediaConfig)
    .then((stream) => {
      if(ROOMH_ID){
        const newVideo = document.createElement("video");
        newVideo.muted = true;
        newVideo.style.width = "350px";
        newVideoStream(newVideo, stream, id);
      }else{
        const myVideo = document.createElement("video");
        myVideo.muted = true;
        myVideo.style.width = "500px";
        myVideoStream(myVideo, stream, id);
      }
      peer.on("call", (call) => {
        call.answer(stream);
        const video = document.createElement("video");
        if(ROOMH_ID){
          call.on("stream", (userStream) => {
            const userId = call.peer;
            if(userId==ROOMH_ID){
              addVideoStreams(video, userStream,userId);
            }
          });
        }
      });
      if(ROOMH_ID==!id){
        socket.on("user-connected", (id) => {                
          connectToNewUser( id, stream);
        });
      }
    })
    .catch((err) => {
      document.write(err);
    });
});

socket.on("user-disconnected", (id) => {
  const video = document.getElementById(id);
  if (video) {
    video.parentElement.remove();
  }
  if (peers[id]) peers[id].close();
});

function connectToNewUser( id, stream) {
  const call = peer.call(id, stream);
  const video = document.createElement("video");
      call.on("stream", (userStream) => {
        addVideoStreams(video, userStream, id);
      });
  call.on("close", () => {
    video.remove();
  });
  peers[id] = call;
}

if(ROOMH_ID){
  function newVideoStream(newVideo,stream ,id) {
    newVideo.srcObject = stream;
    newVideo.addEventListener("loadedmetadata", () => {
      newVideo.play();
    });
    videoGrid.append(newVideo)   
  }
}else{
  function myVideoStream(myVideo,stream ,id) {
    myVideo.srcObject = stream;
    myVideo.addEventListener("loadedmetadata", () => {
      myVideo.play();
    });
    videoGrid.append(myVideo)    
  }
}


function addVideoStreams(video, stream) {
  video.srcObject = stream;
  video.addEventListener("loadedmetadata", () => {
    video.play();
  });
  videoss.append(video)
}