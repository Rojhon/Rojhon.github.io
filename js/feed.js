var video = document.querySelectorAll(".videolist")


video.forEach(play => play.addEventListener("click", ()=>{
    play.classList.toggle('active');
    if(play.paused){
        play.play()
    }else{
        play.pause()
        play.currentTime = 0;
    }

}));