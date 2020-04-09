const DEBUG = true;
// const BACKEND_URL = 'https://api.marstanjx.com/acad280';
const BACKEND_URL = 'http://localhost/acad280';
const BACKGROUND_COLOR = '#393939';
const MOUSELOCATION_DIMENSION = [2560, 1440];

let mouseLocation = [];
let process = {};

/**
 * sample object
 {
  illustrator: {
    icon: '/img/ai.png',
    name: 'Adobe Illustrator',
    locations: [
      [1580281103.5818355, 603, 1183],
      [1580281103.5818355, 603, 1183],
      [1580281103.5818355, 603, 1183],
      [1580281103.5818355, 603, 1183],
    ]
  },
  aftereffects: {
    icon: '/img/ae.png',
    name: 'Adobe After Effects',
    locations: [
      [1580281103.5818355, 603, 1183],
      [1580281103.5818355, 603, 1183],
      [1580281103.5818355, 603, 1183],
      [1580281103.5818355, 603, 1183],
    ]
  }
};

 */

/**
 * loading state
 * @type {number}
 * 0 -> loading.
 * 1 -> loaded.
 * -1 -> failed.
 */
let state = 0;

let selectedApp;


function fetch() {
  state = 0;
  const req1 = new XMLHttpRequest();
  req1.onreadystatechange = function () {
    if (this.readyState === 4) {
      if (this.status === 200) {
        mouseLocation = JSON.parse(this.responseText).locations.filter(l => l.processId === 0);
        // TODO update left col. The app list


        loading_complete_count = 100; // ready to go to state 1
      } else {
        state = -1;
      }
    }
  };
  req1.open("GET", `${BACKEND_URL}/locations`, true);

  const req2 = new XMLHttpRequest();
  req2.onreadystatechange = function () {
    if (this.readyState === 4) {
      if (this.status === 200) {
        process = JSON.parse(this.responseText);
        req1.send();
      } else {
        state = -1;
      }
    }
  };
  req2.open("GET", `${BACKEND_URL}/processes`, true);
  req2.send();

}

const element_sketch = document.querySelector('#sketch');
let width = element_sketch.clientWidth;
let height = element_sketch.clientHeight;
let container_width;
let container_height;
let container_offset;
let container_offset_direction;

function setup() {
  // load front end
  fetch();
  let canvas = createCanvas(width, height);
  canvas.parent("sketch");
  windowResized();
}

function windowResized() {
  width = element_sketch.clientWidth;
  height = element_sketch.clientHeight;

  const ratio = MOUSELOCATION_DIMENSION[0] / MOUSELOCATION_DIMENSION[1];
  // full width
  container_width = width;
  container_height = width / ratio;
  container_offset = (height - container_height) / 2;
  container_offset_direction = true;

  if (container_height > height) {
    // full height
    container_height = height;
    container_width = height * ratio;
    container_offset = (width - container_width) / 2;
    container_offset_direction = false;
  }

  resizeCanvas(width, height);
}

let loading_count = 0;
let loading_flip = true;
/**
 * -1 -> still loading
 * Loading complete -> 100 to 0: opacity fade out
 */
let loading_complete_count = -1;
const textWidth = 145;

function updateLoadingBar() {
  // loading bar
  const percent = Ease.easeInOutQuint(loading_count, 0, 100, 100);

  if (loading_flip)
    rect(width / 2 - textWidth / 2, height / 2 + 15, textWidth * percent / 100, 3);
  else {
    rect(width / 2 - textWidth / 2, height / 2 + 15, textWidth, 3);
    fill(BACKGROUND_COLOR);
    rect(width / 2 - textWidth / 2, height / 2 + 15, textWidth * percent / 100, 3);
  }
  // loading bar speed
  loading_count += 1.7;
  if (loading_count >= 100) {
    loading_count %= 100;
    loading_flip = !loading_flip;
  }
}

function drawLoading() {
  const opacity = loading_complete_count >= 0 ? loading_complete_count / 100 : 1;
  fill(`rgba(178,178,178,${opacity})`);
  textSize(20);
  textAlign(CENTER);
  text('L O A D I N G ...', width / 2, height / 2);
  updateLoadingBar();
}

function drawLoadFailed() {
  fill(`rgb(178, 178, 178)`);
  textSize(20);
  textAlign(CENTER);
  text('L O A D I N G   F A I L E D', width / 2, height / 2);

  if (loading_flip && loading_count + 1.7 >= 100) {
    rect(width / 2 - textWidth / 2, height / 2 + 15, textWidth, 3);
  } else {
    updateLoadingBar();
  }
}

function drawGraph() {
  let last_location;
  // assume in the order of time

  for (const location of mouseLocation) {
    const x = location.positionX / MOUSELOCATION_DIMENSION[0] * container_width
      + (container_offset_direction ? 0 : container_offset);
    const y = location.positionY / MOUSELOCATION_DIMENSION[1] * container_height
      + (container_offset_direction ? container_offset : 0);
    noStroke();
    fill('#fff');
    circle(x, y, 2);
    stroke('#989898');

    if (last_location && location.time - last_location[2] < 0.5) {
      line(x, y, last_location[0], last_location[1]);
    }
    last_location = [x, y, location.time];
  }
}

function switchApp(newApp) {
  selectedApp = newApp;
}

function draw() {
  fill('#333');
  noStroke();
  rect(0, 0, width, height);
  fill(BACKGROUND_COLOR);
  noStroke();
  if (container_offset_direction)
    rect(0, container_offset, container_width, container_height);
  else
    rect(container_offset, 0, container_width, container_height);
  switch (state) {
    case 0:
      drawLoading();
      break;
    case 1:
      drawGraph();
      break;
    case -1:
      drawLoadFailed();
      break;
  }
}

/**
 * Modified from:
 * https://github.com/danro/jquery-easing/blob/master/jquery.easing.js
 */
const Ease = {
  /**
   * @param t{Number} current time
   * @param b{Number} beginning value
   * @param c{Number} change in value
   * @param d{Number} duration
   * @return Number
   */
  easeInOutQuint(t, b, c, d) {
    if ((t /= d / 2) < 1) return c / 2 * t * t * t * t * t + b;
    return c / 2 * ((t -= 2) * t * t * t * t + 2) + b;
  }
};
