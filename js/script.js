document.addEventListener("DOMContentLoaded", () => {
  let currentSong = new Audio();
  let songs;
  let currFolder;

  const playButton = document.getElementById("playing");

  async function getSongs(folder) {
    currFolder = folder;
    let a = await fetch(`http://127.0.0.1:5500/${folder}/`);
    let res = await a.text();

    let parse = new DOMParser();
    let doc = parse.parseFromString(res, "text/html");

    songs = Array.from(doc.querySelectorAll("a"))
      .map((links) => links.getAttribute("href"))
      .filter((href) => href.endsWith(".mp3"));

    let songUL = document
      .querySelector(".songlist")
      .getElementsByTagName("ul")[0];
    songUL.innerHTML = "";

    for (const song of songs) {
      const songName = decodeURIComponent(
        song.split("/").pop().replace(".mp3", "")
      );

      songUL.innerHTML =
        songUL.innerHTML +
        `<li>
              <img src="./songImg/${songName}.jpg"/>

              <div class="info">
                <div class="songname">${songName}</div>
                <div class="songartist">iBeatz</div>
              </div>

              <div class="playnow invert">
                <img id="play" src="./svg/play.svg" alt="">
              </div>
      </li>`;
    }

    //ATTACH AN EVENT LISTENER TO EACH SONG
    Array.from(
      document.querySelector(".songlist").getElementsByTagName("li")
    ).forEach((e, index) => {
      e.addEventListener("click", () => {
        playMusic(songs[index]);
      });
    });
    return songs;
  }

  function secToMin(seconds) {
    if (isNaN(seconds) || seconds < 0) return " 00:00)";
    const minutes = Math.floor(seconds / 60);
    const second = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, "0");
    const formattedSeconds = String(second).padStart(2, "0");

    return `${formattedMinutes}:${formattedSeconds}`;
  }

  //PLAY MUSIC
  const playMusic = (track, pause = false) => {
    // currentSong.src = track.startsWith(`${currFolder}`) ? track : `${currFolder}/${track}`
    currentSong.src = track;
    if (!pause) {
      currentSong.play();
      playButton.src = "./svg/pause.svg";
    }

    const decodedTrackName = decodeURIComponent(
      track.split("/").pop().replace(".mp3", "")
    );

    document.querySelector(".songtime").innerHTML = "00:00/00:00";
    currentSong.addEventListener(
      "loadedmetadata",
      () => {
        document.querySelector(".songtime").innerHTML = `00:00/${secToMin(
          currentSong.duration
        )}`;
      },
      { once: true }
    );

    document.querySelector(".songinfo").innerHTML = decodedTrackName;
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
  };

  async function displayAlbums() {
    let a = await fetch(`http://127.0.0.1:5500/songs/`);
    let res = await a.text();
    let div = document.createElement("div");
    div.innerHTML = res;
    let anchors = div.getElementsByTagName("a");
    let cardContainer = document.querySelector(".cardContainer");

    Array.from(anchors).forEach(async (e) => {
      let array = Array.from(anchors);

      for (let i = 0; i < array.length; i++) {
        const e = array[i];
      }
      const path = new URL(e.href).pathname;
      const folder = path.split("/songs/")[1]?.replace("/", "");

      // Skip if folder is empty (e.g., link is just "/songs/")
      if (!folder || folder === "") return;

      try {
        let a = await fetch(`/songs/${folder}/info.json`);
        if (!a.ok) {
          console.error(`Missing info.json for folder: ${folder}`);
          return;
        }

        let response = await a.json();
        //console.log(response); // { title: ..., description: ... }

        cardContainer.innerHTML =
          cardContainer.innerHTML +
          `<div data-folder="${folder}" class="card">
        <div class="play">
          <div>
            <img src="./svg/play.svg" alt="">
          </div>
        </div>
        <img src="/songs/${folder}/cover.jpg">
        <h2>${response.title}</h2>
        <p>${response.description}</p>
      </div>`;

        // LOAD PLAYLIST WHEN CARD IS CLICKED
        Array.from(document.getElementsByClassName("card")).forEach((e) => {
          e.addEventListener("click", async (item) => {
            songs = await getSongs(
              `songs/${item.currentTarget.dataset.folder}`
            );
            playMusic(songs[0])
          });
        });

        // (Optional) If you want to show albums as cards, do it here.
        // Example:
        /*
      let albumContainer = document.querySelector(".albums");
      albumContainer.innerHTML += `
        <div class="card" data-folder="${folder}">
          <h3>${response.title}</h3>
          <p>${response.description}</p>
        </div>`;
      */
      } catch (err) {
        console.error(`Error reading info.json from ${folder}`, err);
      }
    });
  }

  async function main() {
    //get the link of all songs
    await getSongs("songs/ncs");
    playMusic(songs[1], true);

    //DISPLAY ALL THE ALBUMS ON THE PAGE
    displayAlbums();

    //SHOW ALL SONGS IN PLAYLIST
    let songUL = document
      .querySelector(".songlist")
      .getElementsByTagName("ul")[0];

    //ATTACH EVENT LISTENER TO PLAY, NEXT AND PREVIOUS
    playButton.addEventListener("click", () => {
      if (currentSong.paused) {
        currentSong.play();
        playButton.src = "./svg/pause.svg";
      } else {
        currentSong.pause();
        playButton.src = "./svg/play.svg";
      }
    });

    //TIME UPDATE EVENT
    currentSong.addEventListener("timeupdate", () => {
      // console.log(currentSong.currentTime, currentSong.duration);
      document.querySelector(".songtime").innerHTML = `${secToMin(
        currentSong.currentTime
      )}/${secToMin(currentSong.duration)}`;

      document.querySelector(".circle").style.left =
        (currentSong.currentTime / currentSong.duration) * 100 + "%";
    });

    //ADD EVENT LISTENER TO SEEKBAR
    document.querySelector(".seekbar").addEventListener("click", (e) => {
      let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;

      document.querySelector(".circle").style.left = percent + "%";

      currentSong.currentTime = (currentSong.duration * percent) / 100;
    });

    //ADD AN EVENT LISTENER FOR HAMBURGER
    document.querySelector(".hamburger").addEventListener("click", () => {
      document.querySelector(".left").style.left = "0";
    });

    document.querySelector(".close").addEventListener("click", () => {
      document.querySelector(".left").style.left = "-100%";
    });

    //ADD EVENT LISTNER FOR PREVIOUS
    previous.addEventListener("click", () => {
      const path = new URL(currentSong.src).pathname;
      const index = songs.indexOf(path);

      if (index > 0) {
        playMusic(songs[index - 1]);
      }
    });

    //ADD EVENT LISTNER FOR NEXT
    next.addEventListener("click", () => {
      const path = new URL(currentSong.src).pathname;
      const index = songs.indexOf(path);

      if (index < songs.length - 1) {
        playMusic(songs[index + 1]);
      } else {
        playMusic(songs[0]);
      }
    });

    //ADD EVENT LISTENER FOR VOLUME
    document
      .querySelector(".range")
      .getElementsByTagName("input")[0]
      .addEventListener("change", (e) => {
        currentSong.volume = parseInt(e.target.value) / 100;
      });

    //ADD EVENT LISTNER TO MUTE THE TRACK
    document.querySelector(".volume>img").addEventListener("click", (e) =>{
      console.log("hi");
      if(e.target.src.includes("volume.svg")){
        e.target.src = e.target.src.replace("volume.svg", "mute.svg")
        currentSong.volume = 0;
        document.querySelector(".range").getElementsByTagName("input")[0].value = 0;

      } else {
        e.target.src = e.target.src.replace("mute.svg", "volume.svg");
        currentSong.volume = .10;
        document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
      }
    })
  }
  main();
});
