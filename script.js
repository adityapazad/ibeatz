document.addEventListener("DOMContentLoaded", () => {

  let currentSong = new Audio();

  async function getSongs(){
      let a = await fetch("http://127.0.0.1:5500/songs")
      let res = await a.text()

      let parse = new DOMParser()
      let doc = parse.parseFromString(res, "text/html")

      let links = Array.from(doc.querySelectorAll("a"))

      .map(links => links.getAttribute("href"))
      .filter(href=> href.endsWith(".mp3"))

      return links
  }

  const playMusic = (track) => {
    currentSong.src = "/songs/" + track
    currentSong.play()
  }

  async function main() { 

      //get the link of all songs  
      let songs = await getSongs()

      //SHOW ALL SONGS IN PLAYLIST
      let songUL = document.querySelector(".songlist").getElementsByTagName("ul")[0]

      for (const song of songs) {
          let songFileName = decodeURIComponent(song).replace("/songs/", "")
          let songName = songFileName.replace(".mp3", "")
          songUL.innerHTML = songUL.innerHTML + `<li>
                  <img src="./songImg/${songName}.jpg" alt="" />

                  <div class="info">
                    <div class="songname">${songFileName}</div>
                    <div class="songartist">Pluse</div>
                  </div>

                  <div class="playnow invert">
                    <img id="play" src="./svg/play.svg" alt="">
                  </div>
          </li>`
      }

      //ATTACH AN EVENT LISTENER TO EACH SONG
      Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e => {

        e.addEventListener("click", element => {
          playMusic(e.querySelector(".info").firstElementChild.innerHTML);
          
        })
      })
          
      //ATTACH EVENT LISTENER TO PLAY, NEXT AND PREVIOUS
      
        // Get the correct play button
      const playButton = document.getElementById("playing");

      playButton.addEventListener("click", () => {
        if(currentSong.paused) {
          currentSong.play();
          playButton.src = "./svg/pause.svg";
        } else {
          currentSong.pause();
          playButton.src = "./svg/play.svg";
        }
});
  }
  main()
})