class Music {
  constructor(img, difficulty, level) {
    this.img = img;
    this.difficulty = difficulty;
    this.level = level;
  }

  difficultyColor() {
    if (this.difficulty.includes("BSC")) return "skyblue";
    if (this.difficulty.includes("ADV")) return "yellow";
    if (this.difficulty.includes("EXT")) return "red";
    if (this.difficulty.includes("MAS")) return "purple";
    return "black";
  };

  difficultyText() {
    let text = "";
    if (this.difficulty != "") text += this.difficulty + " ";
    if (this.level != "") text += this.level;
    return text;
  }
}

let selectedMusics = [];
let baseImg = new Image();

function setMusics(title = "", artist = "", version = "") {
  var select = document.getElementById('itemSelect');

  // 要素を全部消す
  while (select.firstChild) {
    select.removeChild(select.firstChild);
  }

  let titles = title.split(',');
  let artists = artist.split(",");
  let versions = version.split(",");

  musics.sort((a, b) => a[2].localeCompare(b[2]));
  if (artist != "") {
    musics.sort((a, b) => a[4].localeCompare(b[4]));
  }

  for (var i = 0; i < musics.length; i++) {
    let music = musics[i];
    if (title != "" && !titles.some(title => music[2].startsWith(title))) continue;
    if (artist != "" && !artists.some(artist => music[4].startsWith(artist))) continue;
    if (version != "" && !versions.some(version => music[5].includes(version))) continue;
    var option = document.createElement('option');
    option.text = toViewTitle(music);
    option.value = music[0];
    select.appendChild(option);
  }
}

function toViewTitle(music) {
  let title = music[1];
  let artist = music[3];
  if (artist == "") return title;
  return `${title} (${artist})`;
}

function drawImage() {
  loadImage();
}

function loadImage() {
  let imagesToLoad = selectedMusics.length + 1;
  baseImg.onload = () => {
    imagesToLoad--;
    drawImpl();
  }
  baseImg.onerror = () => {
    imagesToLoad--;
    console("Failed to load image");
  }
  baseImg.src = `images/select_music.png`;
  selectedMusics.forEach((music) => {
    music.img.onload = () => {
      imagesToLoad--;
      drawImpl();
    };
    music.img.onerror = () => {
      imagesToLoad--;
      console("Failed to load image");
    }
  });
};

function getTextOption(bingoSize) {
  switch (bingoSize) {
    case 1:
      return { font: '200px Arial', x: 0, y: 0 };
    case 2:
      return { font: '100px Arial', x: 0, y: 0 };
    case 3:
      return { font: '50px Arial', x: 0, y: 0 };
    case 4:
      return { font: '45px Arial', x: 0, y: 0 };
    case 5:
      return { font: '30px Arial', x: 0, y: 0 };
    case 6:
      return { font: '25px Arial', x: -2, y: 2 };
    case 7:
      return { font: '25px Arial', x: -3, y: 3 };
    case 8:
      return { font: '20px Arial', x: -5, y: 5 };
    case 9:
      return { font: '20px Arial', x: -6, y: 6 };
  }
  return { font: '20px Arial' };
}

function drawImpl() {
  let canvas = document.getElementById('canvas');
  let context = canvas.getContext('2d');
  const bingoSizeElement = document.getElementById('bingoSize');
  const bingoSize = parseInt(bingoSizeElement.value, 10);
  baseSize = canvas.width / bingoSize;
  context.clearRect(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < bingoSize * bingoSize; i++) {
    let x = baseSize * (i % bingoSize);
    let y = baseSize * Math.floor(i / bingoSize);
    if (i < selectedMusics.length) {
      context.drawImage(selectedMusics[i].img, x, y, baseSize, baseSize);
      let difficultyText = selectedMusics[i].difficultyText();
      if (difficultyText != "") {
        let opt = getTextOption(bingoSize);
        context.font = opt.font;
        context.fillStyle = selectedMusics[i].difficultyColor();
        context.strokeStyle = 'white';
        context.lineWidth = 5;
        let textX = x + 10 + opt.x;
        let textY = y + baseSize - 10 + opt.y;
        context.strokeText(difficultyText, textX, textY);
        context.fillText(difficultyText, textX, textY);
      }
    } else {
      context.drawImage(baseImg, x, y, baseSize, baseSize);
    }
  }
}

function addImage() {
  const itemSelectElement = document.getElementById('itemSelect');
  const itemSelectValue = parseInt(itemSelectElement.value, 10);
  let image = new Image();
  image.src = `https://melchamoon.github.io/my-gitadoradon/images/${("00000" + itemSelectValue).slice(-5)}.png`;

  let difficulty = document.getElementById('difficulty')
  let level = document.getElementById('level')
  selectedMusics.push(new Music(image, difficulty.value, level.value));
  drawImage();
}

function removeImage() {
  selectedMusics.pop();
  drawImage();
}

function handleSelectChange() {
  drawImage();
}

window.onload = function () {
  setMusics();
  drawImage();

  let select = document.getElementById('bingoSize')
  select.addEventListener('change', handleSelectChange);
  new TomSelect('#itemSelect', {});
};
