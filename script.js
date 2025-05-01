document.addEventListener("DOMContentLoaded", () => {

  let currentSong = new Audio();
  let songs;
  let currFolder;
  
  const playButton = document.getElementById("playing");

  async function getSongs(folder){
    currFolder = folder
      let a = await fetch(`http://127.0.0.1:5500/${folder}/`)
      let res = await a.text()

      let parse = new DOMParser()
      let doc = parse.parseFromString(res, "text/html")

      songs = Array.from(doc.querySelectorAll("a"))
      .map(links => links.getAttribute("href"))
      .filter(href=> href.endsWith(".mp3"))

      let songUL = document.querySelector(".songlist").getElementsByTagName("ul")[0]
      songUL.innerHTML = ""
      

      for (const song of songs) {
      const songName = decodeURIComponent(song.split("/").pop().replace(".mp3", ""));
      
      songUL.innerHTML = songUL.innerHTML + 
      
      `<li>
              <img src="./songImg/${songName}.jpg"/>

              <div class="info">
                <div class="songname">${songName}</div>
                <div class="songartist">iBeatz</div>
              </div>

              <div class="playnow invert">
                <img id="play" src="./svg/play.svg" alt="">
              </div>
      </li>`
      }

      //ATTACH AN EVENT LISTENER TO EACH SONG
      Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach((e, index) => {
        e.addEventListener("click", () => {
          playMusic(songs[index]);
        })
      })
      return songs;
  }


  function secToMin(seconds) {
    if(isNaN(seconds) || seconds < 0) return " 00:00)"
    const minutes = Math.floor(seconds/60)
    const second = Math.floor(seconds % 60)

    const formattedMinutes = String(minutes).padStart(2, '0')
    const formattedSeconds = String(second).padStart(2, '0')
    
    return `${formattedMinutes}:${formattedSeconds}`
  }

  //PLAY MUSIC
  const playMusic = (track, pause = false) => {
    // currentSong.src = track.startsWith(`${currFolder}`) ? track : `${currFolder}/${track}`
    currentSong.src = track;
    if(!pause){
      currentSong.play()
      playButton.src = "./svg/pause.svg";
    }

    const decodedTrackName = decodeURIComponent(track.split("/").pop().replace(".mp3", ""));

    document.querySelector(".songtime").innerHTML = "00:00/00:00"
    currentSong.addEventListener("loadedmetadata", () => {
    document.querySelector(".songtime").innerHTML = 
      `00:00/${secToMin(currentSong.duration)}`;
    }, { once: true });

    document.querySelector(".songinfo").innerHTML = decodedTrackName
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00"
  }

  async function displayAlbums() {
    let a = await fetch(``)  
  }

  async function main() { 
      //get the link of all songs  
      await getSongs("songs/ncs")
      playMusic(songs[1], true)


      //DISPLAY ALL THE ALBUMS ON THE PAGE
      displayAlbums()


      //SHOW ALL SONGS IN PLAYLIST
      let songUL = document.querySelector(".songlist").getElementsByTagName("ul")[0]
          
      //ATTACH EVENT LISTENER TO PLAY, NEXT AND PREVIOUS
      playButton.addEventListener("click", () => {
        if(currentSong.paused) {
          currentSong.play();
          playButton.src = "./svg/pause.svg";
        } else {
          currentSong.pause();
          playButton.src = "./svg/play.svg";
        }
      })

      //TIME UPDATE EVENT
      currentSong.addEventListener("timeupdate", () => {
        // console.log(currentSong.currentTime, currentSong.duration);
        document.querySelector(".songtime").innerHTML = `${secToMin(currentSong.currentTime)}/${secToMin(currentSong.duration)}`

        document.querySelector(".circle").style.left =(currentSong.currentTime / currentSong.duration) * 100 + '%'
      })

      //ADD EVENT LISTENER TO SEEKBAR
      document.querySelector(".seekbar").addEventListener('click', e => {

        let percent = e.offsetX/e.target.getBoundingClientRect().width * 100;

        document.querySelector(".circle").style.left = percent + "%";

        currentSong.currentTime = (currentSong.duration * percent) / 100
      })

      //ADD AN EVENT LISTENER FOR HAMBURGER
      document.querySelector(".hamburger").addEventListener('click', () => {
        document.querySelector(".left").style.left = "0"
      })

      document.querySelector(".close").addEventListener('click', () => {
        document.querySelector(".left").style.left = "-100%"
      })

      //ADD EVENT LISTNER FOR PREVIOUS
      previous.addEventListener('click', () => {
        const path = new URL(currentSong.src).pathname;
        const index = songs.indexOf(path);

        if(index > 0){
          playMusic(songs[index - 1])
        }
      })

      //ADD EVENT LISTNER FOR NEXT
      next.addEventListener('click', () => {
        const path = new URL(currentSong.src).pathname;
        const index = songs.indexOf(path);

        if(index < songs.length - 1){
          playMusic(songs[index + 1])
        } else{
          playMusic(songs[0])
        }
      })


      //ADD EVENT LISTENER FOR VOLUME
      document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
         currentSong.volume = parseInt(e.target.value)/100
      })


      // LOAD PLAYLIST WHEN CARD IS CLICKED
      Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
          songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)
        })
      }) 


  }
  main()
})