var vw = window.innerWidth

const gameOfLife = {
  width: 10,
  height: 10,
  stepInterval: null,

  // Utility functions
  forEachCell: function(iteratorFunc) {

      Array.from(document.getElementsByTagName('td')).forEach(cell => {
          const coords = this.getCoordsOfCell(cell);
          iteratorFunc(cell, coords[0], coords[1]);
      })
  },
  getCoordsOfCell: function(cell) {
      const idSplit = cell.id.split('-');
      return idSplit.map(str => +str)
  },
  getCellStatus: function(cell) {
      return cell.getAttribute('data-status');
  },
  setCellStatus: function(cell, status) {
      cell.className = status;
      let coords = this.getCoordsOfCell(cell);
      let cube = document.getElementById(`cube${coords[0]}-${coords[1]}`)
      if(status == "alive"){
        cube.classList.remove('is--hidden')
      } else {
        cube.classList.add('is--hidden')
      }
      return cell.setAttribute('data-status', status)
  },
  toggleCellStatus: function(cell) {
      if (this.getCellStatus(cell) == 'dead') {
          this.setCellStatus(cell, "alive");
      } else {
          this.setCellStatus(cell, "dead");
      }
  },
  getNeighbors: function (cell) {
      const neighbors = [];
      const [cellX, cellY] = this.getCoordsOfCell(cell);
      for (let i = cellX - 1; i <= cellX + 1; i++) {
          for (let j = cellY - 1; j <= cellY + 1; j++) {
              if (i === cellX && j === cellY) continue;
              neighbors.push(document.getElementById(`${i}-${j}`));
          }
      }
      return neighbors.filter(neighbor => neighbor);
  },
  getAliveNeighbors: function (cell) {
      var allNeighbors = this.getNeighbors(cell);
      return allNeighbors.filter(neighbor => this.getCellStatus(neighbor) === "alive");
  },

  // Game
  createAndShowBoard: function() {
      const goltable = document.createElement("tbody");
      const board = document.getElementById('board');

      // build Table HTML
      let tablehtml = '';
      for (let h = 0; h < this.height; h++) {

          tablehtml += `<tr id='row+${h}'>`;
          for (let w = 0; w < this.width; w++) {
              tablehtml += `<td data-status='dead' id='${w}-${h}'></td>`;
              buildCube(w, h);
          }
          tablehtml += "</tr>";
      }
      goltable.innerHTML = tablehtml;

      board.appendChild(goltable);

      this.setupBoardEvents();
  },
  setupBoardEvents: function() {
      const onCellClick = e => {
        this.toggleCellStatus(e.target);
      }

      document.getElementById('board').onclick = onCellClick;

      // Buttons
      document.getElementById("step_btn").onclick = () => this.step();
      document.getElementById("clear_btn").onclick= () => this.clearBoard();
      document.getElementById("reset_btn").onclick = () => this.resetRandom();
      document.getElementById("play_btn").onclick = () => this.enableAutoPlay();
      document.getElementById('color_btn').onclick = () => this.toggleColorizeCubes();

  },
  step: function() {

      const cellsToToggle = [];
      this.forEachCell((cell, x, y) => {
          const countLiveNeighbors = this.getAliveNeighbors(cell).length;
          if (this.getCellStatus(cell) === "alive") {
            if (countLiveNeighbors < 2 || countLiveNeighbors > 3) cellsToToggle.push(cell);
          } else if (countLiveNeighbors === 3) cellsToToggle.push(cell);
      })

      cellsToToggle.forEach((cellToToggle) => this.toggleCellStatus(cellToToggle))
  },
  clearBoard: function() {
      this.forEachCell((cell) => this.setCellStatus(cell, "dead"));
      if (this.stepInterval) this.stopAutoPlay();
      this.toggleColorizeCubes(false);
  },
  resetRandom: function() {
      this.forEachCell((cell) => this.setCellStatus(cell, Math.random() > .5 ? 'alive' : 'dead'))
  },
  enableAutoPlay: function() {
      if (this.stepInterval) return this.stopAutoPlay();
      else this.stepInterval = setInterval(this.step.bind(this), 500);
  },
  stopAutoPlay: function() {
      clearInterval(this.stepInterval);
      this.stepInterval = null;
  },
  toggleColorizeCubes: function(colorize = true) {
    let $cubes = Array.from(document.getElementById('cubes').children)
    $cubes.forEach(cube => {
            colorizeCube(cube, colorize)
    })
  },
};

gameOfLife.createAndShowBoard(false);

function buildCube(w, h) {
  var $cubes = document.getElementById('cubes')
  var $cubeModel = document.querySelector('.cube')
  var layer = 0
  var cubeTranslation = 'translate3d(0, 0, 0)'

  var $cube = $cubeModel.cloneNode(true)
  var $face1 = $cube.querySelector('.face-1')
  var $plane = document.getElementById('plane')
  var widthInSpaces = 10
  var heightInSpaces = 10
  var spaceSize = $plane.clientWidth / widthInSpaces
  var totalSpaces = widthInSpaces * heightInSpaces

  $cube.setAttribute('data-layer', layer)
  $cube.setAttribute('id', `cube${w}-${h}`)
  $cube.style.left = `${w * spaceSize}px`
  $cube.style.top = `${h * spaceSize - 500}px`
  $cube.style.transform = cubeTranslation

  $cubes.appendChild($cube)
}


function colorizeCube($cube, colorize) {
    var color = colorize ? getRandomColor() : '#ffaa22'
    var $faces = Array.from($cube.querySelectorAll('.face'))
  $faces.forEach(function($face, i) {
    $face.style.backgroundColor = getColorNeighbor(color, i)
  })
}

function getRandomColor() {
  var chars = '0123456789abcdef'.split('')
  var hex = '#'

  for (var n = 0; n < 6; n++) {
    var rand = Math.round(Math.random() * (chars.length - 1))
    hex += chars[rand]
  }
  return hex
}

function getColorNeighbor(hex, n) {
    var chars = '0123456789abcdef'.split('')
    var hexArr = hex.replace('#', '').split('')

    var big = (n % 3) * 2
    var small = (n % 2) === 0 ? big + 1 : big - 1
    if (small === -1) small = 5

    var neighborBig = hexArr[big] === 'f' ? 'e' : chars[chars.indexOf(hexArr[big]) + 1]
    var neighborSmall = hexArr[big] === 'f' ? 'e' : chars[chars.indexOf(hexArr[big]) + 1]

    hexArr[big] = neighborBig
    hexArr[small] = neighborSmall

    return '#' + hexArr.join('')
  }

function isMobileAt(vw) {
    return vw < 500
}

window.addEventListener('resize', function() {
  if (window.innerWidth === vw) return
  if (isMobileAt(vw) === isMobileAt(window.innerWidth)) return

  vw = window.innerWidth
  var conversion = isMobileAt(vw) ? 3 / 5 : 5 / 3

  var $cubes = Array.from(document.querySelectorAll('.cube'))
  var $spaces = Array.from(document.querySelectorAll('.space'))
  var $nodes = $cubes.concat($spaces)

  $nodes.forEach(function($node) {
    $node.style.left = parseInt($node.style.left) * conversion + 'px'
    $node.style.top = parseInt($node.style.top) * conversion + 'px'
  })
})