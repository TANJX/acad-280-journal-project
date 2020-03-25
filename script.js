const DEBUG = true;
const BACKEND_URL = 'https://api.marstanjx.com/acad280';

let mouseLocation = {};

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
  const xmlhttp = new XMLHttpRequest();
  xmlhttp.onreadystatechange = function () {
    if (this.readyState === 4 && this.status === 200) {
      mouseLocation = JSON.parse(this.responseText);
      // TODO update left col

      state = 1;
    }
  };
  xmlhttp.open("GET", `${BACKEND_URL}/list`, true);
  xmlhttp.send();
}

function setup() {
  // load front end
  fetch();
}

function drawLoading() {

}

function drawGraph() {

}

function drawLoadFailed() {

}

function switchApp(newApp) {
  selectedApp = newApp;
}

function draw() {
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
