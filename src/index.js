let canvas = document.querySelector("canvas");
let canvasBorder = 12;
canvas.width = 0.8 * window.innerWidth - 2 * canvasBorder;
canvas.height = 0.85 * window.innerHeight - 2 * canvasBorder;
let ctx = canvas.getContext("2d");
ctx.fillStyle = "#050313";
ctx.rect(0, 0, canvas.width, canvas.height);
ctx.fill();
const cw = 5,
  ch = 5;

// CELL start
function Cell({ x, y }, { width, height }, state = false) {
  //state false is dead and true alive
  this.props = { x, y, width, height };
  this.state = state;
  this.nextState = false;
  this.draw = () => {
    const { x, y, width, height } = this.props;
    ctx.clearRect(x, y, width, height);
    ctx.beginPath();
    ctx.strokeStyle = "#050313";
    if (this.state) ctx.fillStyle = "pink";
    else ctx.fillStyle = "#050313";
    ctx.rect(x, y, width, height);
    ctx.stroke();
    ctx.fill();
  };

  // @for future
  this.updateState = () => {
    this.state = this.nextState;
    this.draw();
  };

  // this will flip state
  this.flipState = () => {
    this.state = !this.state;
    this.draw();
  };

  this.setState = (state) => {
    this.state = state;
    this.draw();
  };
}
// CELL end

//Grid start
function Grid(position, dimension, count) {
  this.props = { position, dimension, count };
  this.props.position.endx = position.posx + dimension.width * count.row;
  this.props.position.endy = position.posy + dimension.height * count.column;
  // stores the cells
  this.grid = [];
  for (let i = 0; i < count.row; i++) {
    this.grid[i] = [];
    for (let j = 0; j < count.column; j++) {
      this.grid[i].push(
        new Cell(
          {
            x: position.posx + dimension.width * i,
            y: position.posy + dimension.height * j,
          },
          dimension
        )
      );
    }
  }

  // draw based on current state
  this.draw = () => {
    const { row, column } = this.props.count;
    for (let i = 0; i < row; i++) {
      for (let j = 0; j < column; j++) {
        this.grid[i][j].draw();
      }
    }
  };

  // flipstate on click
  this.onClickHandler = ({ x, y }) => {
    // find x and y position for cell
    const { posx, posy, endx, endy } = this.props.position;

    if (x > endx || x < posx || y > endy || y < posy) {
      // outside grid
      return false;
    }

    // dont loop through everthing , use maths O(n^n2)bad , O(1)good
    const { width: cellWidth, height: cellHeight } = this.props.dimension,
      cellX = ~~((x - posx) / cellWidth),
      cellY = ~~((y - posy) / cellHeight);

    this.grid[cellX][cellY].flipState();
    return true;
  };

  // we can customize this too
  this.neighbours = [
    [0, 1],
    [0, -1],
    [1, 0],
    [-1, 0],
    [1, 1],
    [-1, -1],
    [1, -1],
    [-1, 1],
  ];
  // update grid's state
  this.updateState = () => {
    const { row, column } = this.props.count;
    let toUpdate = [];
    for (let i = 0; i < row; i++) {
      for (let j = 0; j < column; j++) {
        let aliveCount = 0;
        for (let k = 0; k < this.neighbours.length; k++) {
          const nx = i + this.neighbours[k][0],
            ny = j + this.neighbours[k][1];
          //if neighbour exists , increase count
          if (
            nx >= 0 &&
            nx < row &&
            ny >= 0 &&
            ny < column &&
            this.grid[nx][ny].state
          ) {
            ++aliveCount;
          }
        }

        // check conway's rules
        // added a extra rule for edges
        if (
          (this.grid[i][j].state &&
            (aliveCount < 2 ||
              aliveCount > 3 ||
              i === 0 ||
              j === 0 ||
              i === row - 1 ||
              j === column - 1)) ||
          (!this.grid[i][j].state && aliveCount === 3)
        ) {
          toUpdate.push(this.grid[i][j]);
        }
      }
    }
    toUpdate.forEach((cell) => cell.flipState());
  };

  // to make shapes from given cordinates
  this.makeShape = (aliveStates) => {
    const { row, column } = this.props.count;
    for (let i = 0; i < aliveStates.length; i++) {
      this.grid[aliveStates[i][0]][aliveStates[i][1]].setState(true);
    }
  };

  // clear the grid
  this.clearGrid = () => {
    const { row, column } = this.props.count;
    for (let i = 0; i < row; i++) {
      for (let j = 0; j < column; j++) {
        if (this.grid[i][j].state) this.grid[i][j].flipState();
      }
    }
  };
}
//Grid end

// create new grid
let grid = new Grid(
  { posx: (canvas.width - ~~(canvas.width / cw) * cw) / 2, posy: 0 },
  { width: cw, height: ch },
  { row: ~~(canvas.width / cw), column: ~~(canvas.height / ch) }
);
grid.draw();

// click to state alive
canvas.addEventListener("click", (mouseE) => {
  grid.onClickHandler({
    x: mouseE.layerX - canvasBorder,
    y: mouseE.layerY - canvasBorder,
  });
});

// adjust on resize
window.addEventListener("resize", () => {
  canvas.width = 0.8 * window.innerWidth - 2 * canvasBorder;
  canvas.height = 0.85 * window.innerHeight - 2 * canvasBorder;
});

let anim = undefined;
let fps = 10;
let st = undefined;
function animateGrid() {
  st = setTimeout(() => {
    anim = requestAnimationFrame(animateGrid);
  }, 1000 / fps);

  grid.updateState();
}
function stopAnimation() {
  clearTimeout(st);
  cancelAnimationFrame(anim);
}
function clearGrid() {
  clearTimeout(st);
  grid.clearGrid();
}

// cordinates for gosper gun
let shapes = {
  gosper: [
    [13, 13],
    [13, 14],
    [14, 13],
    [14, 14],
    [22, 14],
    [23, 14],
    [24, 14],
    [23, 13],
    [24, 13],
    [23, 15],
    [24, 15],
    [24, 12],
    [24, 16],
    [25, 16],
    [25, 12],
    [25, 17],
    [25, 11],
    [29, 15],
    [30, 15],
    [29, 14],
    [30, 14],
    [29, 13],
    [30, 13],
    [32, 12],
    [33, 11],
    [34, 10],
    [33, 13],
    [34, 14],
    [35, 11],
    [35, 12],
    [35, 13],
    [36, 10],
    [36, 9],
    [36, 14],
    [36, 15],
    [47, 11],
    [47, 12],
    [48, 11],
    [48, 12],
  ],
};
function makeShape(shape = "gosper") {
  stopAnimation();
  grid.makeShape(shapes[shape]);
}

// TODO --> add custom shapes (local storage)
// TODO --> add frames control
// TODO --> custom skins
// TODO --> light mode
