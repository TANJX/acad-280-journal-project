const BACKEND_URL = document.domain === 'localhost' ?
  'http://localhost:8080/acad280' :
  'https://api.marstanjx.com/acad280';
const BACKGROUND_COLOR = '#363636';

let mouseLocation = [];
let location_dimension = [2560, 1400];
let process = {};

/**
 * sample object
 [
 {
    icon: '/img/ai.png',
    name: 'Adobe Illustrator',
    locations: [
      [1580281103.5818355, 603, 1183],
      [1580281103.5818355, 603, 1183],
      [1580281103.5818355, 603, 1183],
      [1580281103.5818355, 603, 1183],
    ]
  },
 {
    icon: '/img/ae.png',
    name: 'Adobe After Effects',
    locations: [
      [1580281103.5818355, 603, 1183],
      [1580281103.5818355, 603, 1183],
      [1580281103.5818355, 603, 1183],
      [1580281103.5818355, 603, 1183],
    ]
  }
 ];

 */

/**
 * loading state
 * @type {number}
 * 0 -> loading.
 * 1 -> loaded.
 * -1 -> failed.
 */
let state = 0;

let selectedApp = 0;


function fetch() {
  state = 0;
  const req1 = new XMLHttpRequest();
  req1.onreadystatechange = function () {
    if (this.readyState === 4) {
      if (this.status === 200) {
        mouseLocation = JSON.parse(this.responseText).locations;
        req3.send(JSON.stringify({
          apps: mouseLocation.map(a => a.icon.replace('.png', '')),
        }));

        const apps_div = document.querySelector('.app-list');

        // remove all children
        let child = apps_div.lastElementChild;
        while (child) {
          apps_div.removeChild(child);
          child = apps_div.lastElementChild;
        }
        let count = 0;

        mouseLocation.forEach((app) => {

          const app_div_wrapper = document.createElement('div');
          app_div_wrapper.classList.add('app-card-wrapper');

          const app_div = document.createElement('div');
          app_div.classList.add('app-card');


          const img_div = document.createElement('div');
          img_div.classList.add('app-img-div');
          img_div.style.backgroundColor = '#363636';

          const info_div = document.createElement('div');
          info_div.classList.add('app-info-div');

          const img = document.createElement('img');
          img.setAttribute('src', `app-icon/${app.icon}`);
          img.onerror = function () {
            img.src = "app-icon/default.png";
          };
          const p = document.createElement('p');
          p.textContent = app.name;
          p.classList.add('app-name');
          info_div.appendChild(img);
          info_div.appendChild(p);

          app_div.appendChild(img_div);
          app_div.appendChild(info_div);
          app_div.setAttribute('data-id', '' + count);
          count++;

          app_div.addEventListener('click', (ev) => {
            let ele = ev.target;
            while (!ele.classList.contains('app-card')) {
              ele = ele.parentElement;
            }
            if (!ele.classList.contains('selected')) {
              switchApp(parseInt(ele.getAttribute('data-id')));
              ele.classList.add('selected');
            }
          });

          app_div_wrapper.appendChild(app_div);
          apps_div.appendChild(app_div_wrapper);
        });
        switchApp(0);
        document.querySelector(`.app-list-wrapper`).classList.add('fadeIn');
        loading_complete_count = 100; // ready to go to state 1
        point_count.style.opacity = '1';
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

  const req3 = new XMLHttpRequest();
  req3.onreadystatechange = function () {
    if (this.readyState === 4) {
      if (this.status === 200) {
        document.querySelectorAll('.app-card').forEach((card) => {
          const index = parseInt(card.getAttribute('data-id'));
          const app_name = mouseLocation[index].icon.replace('.png', '');
          const img = document.createElement('img');
          img.onload = function (e) {
            e.path[1].style.opacity = '1';
          };
          img.src = `${BACKEND_URL}/thumbnail/${app_name}`;
          img.alt = app_name;
          card.querySelector('.app-img-div').appendChild(img);
        });
      }
    }
  };
  req3.open("POST", `${BACKEND_URL}/update_thumbnail`, true);
  req3.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
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

const sketch_div = document.getElementById('sketch');
const ui_overlay_div = document.querySelector('.ui-overlay');
const controls_div = document.querySelector('.controls');
const controls_wrapper_div = document.querySelector('.controls-wrapper');
const date_left = document.querySelector('.date-left');
const date_right = document.querySelector('.date-right');
const point_count = document.querySelector('.point-info');
const point_count_num = document.querySelector('.point-info span');

function windowResized() {
  const _w = document.body.clientWidth - 400;
  const _h = document.body.clientHeight - 330;

  width = _w;
  height = _w / 64 * 35;

  if (height > _h) {
    height = _h;
    width = _h * 64 / 35;
  }

  sketch_div.style.height = `${height}px`;
  sketch_div.style.width = `${width}px`;
  ui_overlay_div.style.height = `${height}px`;
  ui_overlay_div.style.width = `${width}px`;
  ui_overlay_div.style.left = `${(document.body.clientWidth - width - 100) / 2}px`;

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

  if (!container_offset_direction) {
    const ui_img = ui_overlay_div.querySelector(`img[data-app="${selectedApp}"]`);
    if (ui_img)
      ui_img.style.left = `${container_offset}px`;
  }

  // progress bar
  controls_wrapper_div.style.width = `${width}px`;
  controls_div.style.width = `${width - 100}px`;

  drawComplete = false;
  needRedrawBackground = true;
  resizeCanvas(width, height);
}

let locationLength = 0;
let date_start = 0;
let date_end = 0;

function switchApp(i) {
  // app card highlight
  if (document.querySelector('.app-card.selected'))
    document.querySelector('.app-card.selected').classList.remove('selected');
  document.querySelector(`.app-card[data-id="${i}"]`).classList.add('selected');

  drawGraphCounter = 0;
  const old_img = ui_overlay_div.querySelector(` img[data-app="${selectedApp}"]`);
  if (old_img) {
    old_img.style.opacity = '0';
  }
  selectedApp = i;
  location_dimension[0] = mouseLocation[selectedApp].width || 2560;
  location_dimension[1] = mouseLocation[selectedApp].height || 1400;
  windowResized();
  drawComplete = false;
  needRedrawBackground = true;
  locationLength = mouseLocation[selectedApp].locations.length;

  // progress bar date
  date_start = mouseLocation[selectedApp].locations[0].flat()[0];
  date_end = mouseLocation[selectedApp].locations[locationLength - 1].flat()[0];
  date_left.textContent = moment(date_start * 1000).format('M/D/Y');
  date_right.textContent = moment(date_end * 1000).format('M/D/Y');

  const img = ui_overlay_div.querySelector(` img[data-app="${i}"]`);
  if (img) {
    img.style.opacity = '1';
  } else {
    const ui_img = document.createElement('img');
    ui_img.style.opacity = '0';
    ui_img.src = `ui/${mouseLocation[selectedApp].icon}`;
    ui_img.setAttribute('data-app', i);
    ui_img.onload = (e) => {
      ui_img.style.opacity = '1';
    };
    if (container_offset_direction) {
      ui_img.style.width = '100%';
    } else {
      ui_img.style.height = '100%';
      ui_img.style.left = `${container_offset}px`;
    }
    ui_overlay_div.appendChild(ui_img);
  }
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

  // count down from 100 to 0, then state 1
  if (loading_complete_count === 0) {
    state = 1;
    controls_wrapper_div.classList.remove('hide');
  } else if (loading_complete_count > 0) {
    loading_complete_count--;
  }
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

let drawGraphCounter = 0;
let speed = 0;
let drawComplete = false;
let needRedrawBackground = true;

const pointer = document.querySelector('.pointer');

function drawGraph() {
  if (drawComplete) {
    return;
  }
  const last_index = drawGraphCounter;
  if (drawGraphCounter === 0) {
    // default speed
    speed = Math.min(5, Math.max((Math.floor(locationLength / 50)), 1));
  }
  drawGraphCounter += speed;

  for (let i = needRedrawBackground ? 0 : last_index; i < drawGraphCounter; i++)
    if (i < locationLength) drawLine(i);

  // update progress bar
  let currentIndex = Math.min(drawGraphCounter, locationLength - 1);
  let currentTime = mouseLocation[selectedApp].locations[currentIndex].flat()[0];

  let percent = (currentTime - date_start) / (date_end - date_start);
  pointer.style.left = `${(width - 100) * percent}px`;

  needRedrawBackground = false;

  fill(BACKGROUND_COLOR);
  noStroke();
  if (container_offset_direction) {
    rect(0, 0, container_width, container_offset);
    rect(0, container_offset + container_height, container_width, container_offset);
  } else {
    rect(0, 0, container_offset, container_height);
    rect(container_offset + container_width, 0, container_offset, container_height);
  }

  point_count_num.textContent = drawGraphCounter;

  if (drawGraphCounter >= locationLength) {
    point_count_num.textContent = drawGraphCounter;
    drawGraphCounter = locationLength;
    drawComplete = true;
    return;
  }
  drawComplete = false;
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
  if (show_points) {
    noStroke();
    fill('#fff');
    circle(x, y, 1.1);
  }
  if (last_time && location[0] - last_time < 0.5) {
    if (show_lines) {
      strokeWeight(1);
      stroke(`hsla(0, 0%, 100%, .2)`);
      line(x, y, last_x, last_y);
    }
    if (show_glow) {
      strokeWeight(70);
      stroke(`hsla(${i % 360},70%,60%,0.002)`);
      line(x, y, last_x, last_y);
    }
  }
}

function draw() {
  if (!drawComplete && needRedrawBackground) {
    fill(BACKGROUND_COLOR);
    noStroke();
    rect(0, 0, width, height);
    fill(BACKGROUND_COLOR);
    noStroke();
    if (container_offset_direction)
      rect(0, container_offset, container_width, container_height);
    else
      rect(container_offset, 0, container_width, container_height);
  }
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

function replay() {
  drawGraphCounter = 0;
  needRedrawBackground = true;
  drawComplete = false;
}

function slower() {
  speed -= 5;
  if (speed < 1) {
    speed = 1;
  }
}

function faster() {
  speed += 5;
  if (speed > 100) {
    speed = 100;
  }
}

function toEnd() {
  drawGraphCounter = locationLength - 1;
  needRedrawBackground = true;
  drawComplete = false;
}

let show_lines = true;
let show_glow = true;
let show_points = true;

/**
 * @param id
 * 1: ui
 * 2: lines
 * 3: glows
 * 4: points
 */
function toggle(id) {
  const el = document.querySelector(`.toggle:nth-of-type(${id})`);
  let state = true;
  if (el.classList.contains('on')) {
    el.classList.remove('on');
    // to turn off
    state = false;
  } else {
    el.classList.add('on');
    // to turn on
  }
  switch (id) {
    case 1:
      ui_overlay_div.style.opacity = state ? '0.5' : '0';
      break;
    case 2:
      show_lines = state;
      break;
    case 3:
      show_glow = state;
      break;
    case 4:
      show_points = state;
      break;
  }
  // toggle ui does not need redraw
  if (id > 1) {
    drawComplete = false;
    needRedrawBackground = true;
  }
}

function showHelp() {

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
