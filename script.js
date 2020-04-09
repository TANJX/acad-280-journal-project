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
    if (this.readyState === 4 && this.status === 200) {
      mouseLocation = JSON.parse(this.responseText).locations.filter(l => l.processId === 0);
      // TODO update left col. The app list


      loading_complete_count = 100; // ready to go to state 1
    }
  };
  req1.open("GET", `${BACKEND_URL}/locations`, true);

  const req2 = new XMLHttpRequest();
  req2.onreadystatechange = function () {
    if (this.readyState === 4 && this.status === 200) {
      process = JSON.parse(this.responseText);
      req1.send();
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

function drawLoading() {
  const opacity = loading_complete_count >= 0 ? loading_complete_count / 100 : 1;
  fill(`rgba(178,178,178,${opacity})`);
  textSize(20);
  textAlign(CENTER);
  text('L O A D I N G ...', width / 2, height / 2);

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

  // count down from 100 to 0, then state 1
  if (loading_complete_count === 0) {
    state = 1;
  } else if (loading_complete_count > 0) {
    loading_complete_count--;
  }
}

function drawGraph() {
  let last_location;
  // assume in the order of time
  const test_data = [[1210, 766],
    [1049, 1039],
    [920, 1071],
    [785, 1093],
    [680, 1102],
    [591, 1087],
    [528, 1061],
    [477, 1016],
    [448, 957],
    [435, 872],
    [458, 725],
    [496, 673],
    [561, 625],
    [647, 589],
    [746, 565],
    [853, 547],
    [956, 537],
    [1179, 559],
    [1304, 595],
    [1388, 638],
    [1441, 681],
    [1476, 735],
    [1491, 785],
    [1471, 859],
    [1446, 887],
    [1405, 921],
    [1369, 956],
    [1343, 977],
    [1317, 956],
    [1289, 901],
    [1229, 806],
    [1137, 701],
    [1005, 590],
    [885, 502],
    [768, 442],
    [675, 415],
    [551, 447],
    [509, 485],
    [480, 548],
    [458, 616],
    [440, 683],
    [479, 830],
    [560, 895],
    [639, 945],
    [699, 993],
    [725, 1027],
    [681, 1077],
    [601, 1093],
    [361, 1081],
    [317, 1060],
    [277, 1023],
    [257, 984],
    [278, 829],
    [310, 765],
    [361, 707],
    [436, 649],
    [541, 576],
    [640, 501],
    [705, 435],
    [735, 369],
    [725, 293],
    [682, 269],
    [618, 257],
    [519, 284],
    [485, 329],
    [465, 391],
    [479, 516],
    [533, 571],
    [601, 619],
    [700, 673],
    [789, 723],
    [851, 764],
    [905, 816],
    [942, 877],
    [927, 1063],
    [879, 1118],
    [815, 1149],
    [733, 1160],
    [647, 1149],
    [544, 1123],
    [445, 1085],
    [392, 1055],
    [383, 1039],
    [427, 979],
    [489, 931],
    [570, 875],
    [667, 808],
    [773, 723],
    [847, 654],
    [893, 597],
    [917, 544],
    [930, 486],
    [911, 385],
    [872, 351],
    [817, 330],
    [748, 315],
    [669, 307],
    [519, 336],
    [477, 381],
    [443, 448],
    [431, 516],
    [441, 571],
    [472, 623],
    [525, 673],
    [617, 729],
    [695, 771],
    [769, 807],
    [829, 841],
    [867, 878],
    [882, 932],
    [869, 1071],
    [841, 1128],
    [805, 1157],
    [766, 1175],
    [637, 1167],
    [549, 1140],
    [465, 1105],
    [421, 1072],
    [409, 1038],
    [417, 1007],
    [449, 972],
    [509, 932],
    [593, 887],
    [692, 828],
    [772, 755],
    [843, 670],
    [897, 593],
    [920, 537],
    [899, 392],
    [864, 357],
    [810, 329],
    [731, 308],
    [506, 349],
    [468, 406],
    [442, 495],
    [474, 618],
    [513, 646],
    [573, 671],
    [667, 697],
    [750, 717],
    [827, 737],
    [900, 762],
    [961, 791],
    [1003, 826],
    [1022, 867],
    [989, 1063],
    [925, 1135],
    [853, 1185],
    [787, 1209],
    [657, 1197],
    [592, 1173],
    [547, 1139],
    [528, 1094],
    [546, 1003],
    [585, 961],
    [658, 919],
    [735, 880],
    [812, 826],
    [897, 750],
    [957, 679],
    [990, 617],
    [1000, 560],
    [977, 465],
    [939, 429],
    [877, 395],
    [802, 366],
    [715, 351],
    [579, 394],
    [536, 453],
    [517, 537],
    [530, 605],
    [576, 649],
    [656, 691],
    [737, 729],
    [813, 770],
    [885, 821],
    [947, 899],
    [976, 999],
    [952, 1183],
    [901, 1209],
    [848, 1217],
    [719, 1199],
    [653, 1177],
    [597, 1139],
    [557, 1102],
    [543, 1072],
    [561, 979],
    [587, 907],
    [626, 835],
    [689, 757],
    [763, 689],
    [851, 613],
    [921, 546],
    [967, 493],
    [988, 455],
    [966, 397],
    [925, 371],
    [865, 349],
    [787, 331],
    [712, 322],
    [624, 345],
    [589, 375],
    [563, 413],
    [595, 574],
    [631, 645],
    [680, 693],
    [748, 723],
    [812, 743],
    [867, 761],
    [914, 775],];


  for (const location of test_data) {
    const x = location[0] / MOUSELOCATION_DIMENSION[0] * container_width
      + (container_offset_direction ? 0 : container_offset);
    const y = location[1] / MOUSELOCATION_DIMENSION[1] * container_height
      + (container_offset_direction ? container_offset : 0);
    noStroke();
    fill('#fff');
    circle(x, y, 2);
    stroke('#989898');
    if (last_location) {
      line(x, y, last_location[0], last_location[1]);
    }
    last_location = [x, y];
  }
  /*
  for (const location of mouseLocation) {
    const x = location.positionX / MOUSELOCATION_DIMENSION[0] * container_width
      + (container_offset_direction ? 0 : container_offset);
    const y = location.positionY / MOUSELOCATION_DIMENSION[1] * container_height
      + (container_offset_direction ? container_offset : 0);
    noStroke();
    fill('#fff');
    circle(x, y, 2);
    stroke('#989898');

    if (last_location) {
      if (last_location[2] > location.time) {
        console.error('????');
      }
    }

    if (last_location && location.time - last_location[2] < 0.5) {
      line(x, y, last_location[0], last_location[1]);
    }
    last_location = [x, y, location.time];
  }
  */
}

function drawLoadFailed() {

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
   * @param b{Number} begInnIng value
   * @param c{Number} change In value
   * @param d{Number} duration
   * @return Number
   */
  easeInOutQuint(t, b, c, d) {
    if ((t /= d / 2) < 1) return c / 2 * t * t * t * t * t + b;
    return c / 2 * ((t -= 2) * t * t * t * t + 2) + b;
  }
};
