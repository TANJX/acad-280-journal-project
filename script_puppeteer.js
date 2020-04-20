const BACKEND_URL = document.domain === 'localhost' ?
  'http://localhost:8080/acad280' :
  'https://api.marstanjx.com/acad280';
const BACKGROUND_COLOR = '#363636';

let mouseLocation = [];
let location_dimension = [2560, 1400];
let process = {};

let selectedApp = 0;

function fetch() {
  state = 0;
  const req1 = new XMLHttpRequest();
  req1.onreadystatechange = function () {
    if (this.readyState === 4) {
      if (this.status === 200) {
        mouseLocation = JSON.parse(this.responseText).locations;
        let canvas = createCanvas(width, height);
        canvas.parent("sketch");
        windowResized();
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
      }
    }
  };
  req2.open("GET", `${BACKEND_URL}/processes`, true);
  req2.send();
}

function switchApp(app) {
  for (let i = 0; i < mouseLocation.length; i++) {
    if (mouseLocation[i].icon === `${app}.png`) {
      selectedApp = i;
      locationLength = mouseLocation[selectedApp].locations.length;
      location_dimension[0] = mouseLocation[selectedApp].locations.width || 2560;
      location_dimension[1] = mouseLocation[selectedApp].locations.height || 1400;
      drawGraph();
      break;
    }
  }
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
}

function windowResized() {
  width = element_sketch.clientWidth;
  height = element_sketch.clientHeight;

  const ratio = location_dimension[0] / location_dimension[1];
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
}

let locationLength = 0;

function drawGraph() {
  fill(BACKGROUND_COLOR);
  noStroke();
  rect(0, 0, width, height);
  fill(BACKGROUND_COLOR);
  noStroke();
  if (container_offset_direction)
    rect(0, container_offset, container_width, container_height);
  else
    rect(container_offset, 0, container_width, container_height);
  for (let i = 0; i < locationLength; i++)
    if (i < locationLength) drawLine(i);

  fill(BACKGROUND_COLOR);
  noStroke();
  if (container_offset_direction) {
    rect(0, 0, container_width, container_offset);
    rect(0, container_offset + container_height, container_width, container_offset);
  } else {
    rect(0, 0, container_offset, container_height);
    rect(container_offset + container_width, 0, container_offset, container_height);
  }
}

function drawLine(i) {
  let last_time = 0, last_x, last_y;
  if (i > 1) {
    last_time = mouseLocation[selectedApp].locations[i - 1].flat()[0];
    last_x = mouseLocation[selectedApp].locations[i - 1][1] / location_dimension[0] * container_width
      + (container_offset_direction ? 0 : container_offset);
    last_y = mouseLocation[selectedApp].locations[i - 1][2] / location_dimension[1] * container_height
      + (container_offset_direction ? container_offset : 0);
  }
  const location = mouseLocation[selectedApp].locations[i];
  const x = location[1] / location_dimension[0] * container_width
    + (container_offset_direction ? 0 : container_offset);
  const y = location[2] / location_dimension[1] * container_height
    + (container_offset_direction ? container_offset : 0);
  noStroke();
  fill('#fff');
  circle(x, y, 1.1);
  if (last_time && location[0] - last_time < 0.5) {
    strokeWeight(1);
    stroke(`hsla(0, 0%, 100%, .2)`);
    line(x, y, last_x, last_y);
    strokeWeight(100);
    stroke(`hsla(${i % 360},70%,60%,0.005)`);
    line(x, y, last_x, last_y);
  }
}
