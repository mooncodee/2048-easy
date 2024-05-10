function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min);
}

function hexToRgb(hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

const Point = Isomer.Point;
const Path = Isomer.Path;
const Shape = Isomer.Shape;
const Vector = Isomer.Vector;
const Color = Isomer.Color;

const iso = new Isomer(document.getElementById("game3d"));

const red = new Color(160, 60, 50);
const blue = new Color(50, 60, 160);

const BOARD_ROW = 4;
const BOARD_COL = 4;

const COLOR_MAP = {
  2: "#c1d6a7",
  4: "#d3ffce",
  8: "#7fdaf4",
  16: "#fdb924",
  32: "#ded6d8",
  64: "#869c98",
  128: "#fbd4f2",
  256: "#fff85b",
  512: "#ffb300",
  1024: "#ee6363",
  2048: "#ff004c",
};

const ISO_COLOR_MAP = Object.fromEntries(
  Object.entries(COLOR_MAP).map(([num, color]) => [
    num,
    new Color(...(Object.values(hexToRgb(color)) ?? {})),
  ])
);

const INIT_BOARD = [
  [0, 0, 0, 0],
  [0, 0, 0, 0],
  [0, 0, 0, 0],
  [0, 0, 0, 0],
];

let board = structuredClone(INIT_BOARD);

const SIDE_PX = 1;

const addRandomNumTOBoard = (board) => {
  let flag = false;
  const hasFreeSpace = board.some((row) => !!row.some((cell) => !cell));

  while (!flag && hasFreeSpace) {
    const randX = getRandomInt(0, BOARD_COL);
    const randY = getRandomInt(0, BOARD_ROW);

    if (!board[randY][randX]) {
      board[randY][randX] = 2;
      flag = true;
    }
  }
};

const drawCell = (ctx, board, x, y) => {
  const rowPX = y * SIDE_PX;
  const colPX = x * SIDE_PX;

  if (board[y][x]) {
    ctx.fillStyle = COLOR_MAP[board[y][x]];
    ctx.fillRect(colPX, rowPX, SIDE_PX, SIDE_PX);
    iso.add(
      Shape.Prism(new Point(colPX, -rowPX, 0), 0.8, 0.8, 0.1).translate(
        1,
        4,
        0
      ),
      ISO_COLOR_MAP[board[y][x]]
    );

    ctx.fillStyle = "black";

    ctx.fillText(board[y][x], colPX + 25, rowPX + 50);
    return;
  }
  ctx.strokeRect(colPX, rowPX, SIDE_PX, SIDE_PX);
  iso.add(
    Shape.Prism(new Point(colPX, -rowPX, 0), 0.8, 0.8, 0.1).translate(1, 4, 0)
  );
};

const drawBoard = (ctx) => {
  for (let row = 0; row <= board.length - 1; row++) {
    for (let col = 0; col <= board[row].length - 1; col++) {
      drawCell(ctx, board, col, row);
    }
  }
};

const moveLeft = () => {
  for (let row = 0; row <= board.length - 1; row++) {
    for (let col = 0; col <= board[row].length - 1; col++) {
      if (!board[row][col]) continue;
      for (let cellCol = col; cellCol > 0; cellCol--) {
        const leftEmpty = !board[row][cellCol - 1];
        if (board[row][cellCol] !== board[row][cellCol - 1] && !leftEmpty) {
          break;
        }

        if (leftEmpty) {
          board[row][cellCol - 1] = board[row][cellCol];
          board[row][cellCol] = 0;
        }
        const leftSame = board[row][cellCol - 1] === board[row][cellCol];

        if (leftSame) {
          board[row][cellCol - 1] = board[row][cellCol] * 2;
          board[row][cellCol] = 0;
        }
      }
    }
  }
};

const moveRight = () => {
  for (let row = 0; row <= board.length - 1; row++) {
    for (let col = board[row].length - 1; col >= 0; col--) {
      if (!board[row][col]) continue;

      for (let cellCol = col; cellCol < board[row].length - 1; cellCol++) {
        const rightEmpty = !board[row][cellCol + 1];

        if (board[row][cellCol] !== board[row][cellCol + 1] && !rightEmpty) {
          break;
        }

        if (rightEmpty) {
          board[row][cellCol + 1] = board[row][cellCol];
          board[row][cellCol] = 0;
        }
        const rightSame = board[row][cellCol + 1] === board[row][cellCol];

        if (rightSame) {
          board[row][cellCol + 1] = board[row][cellCol] * 2;
          board[row][cellCol] = 0;
        }
      }
    }
  }
};

const moveDown = () => {
  for (let row = board.length - 1; row >= 0; row--) {
    for (let col = 0; col <= board[row].length - 1; col++) {
      if (!board[row][col]) continue;

      for (let rowCell = row; rowCell < board.length - 1; rowCell++) {
        const downEmpty = !board[rowCell + 1][col];

        if (board[rowCell][col] !== board[rowCell + 1][col] && !downEmpty) {
          break;
        }

        if (downEmpty) {
          board[rowCell + 1][col] = board[rowCell][col];
          board[rowCell][col] = 0;
        }
        const downSame =
          board[rowCell + 1][col] === board[rowCell][col] && !downEmpty;

        if (downSame) {
          board[rowCell + 1][col] = board[rowCell][col] * 2;
          board[rowCell][col] = 0;
        }
      }
    }
  }
};

const moveUp = () => {
  for (let row = 0; row <= board.length - 1; row++) {
    for (let col = 0; col <= board[row].length - 1; col++) {
      if (!board[row][col]) continue;

      for (let rowCell = row; rowCell > 0; rowCell--) {
        const upEmpty = !board[rowCell - 1][col];

        if (board[rowCell][col] !== board[rowCell - 1][col] && !upEmpty) {
          break;
        }

        if (upEmpty) {
          board[rowCell - 1][col] = board[rowCell][col];
          board[rowCell][col] = 0;
        }
        const upSame =
          board[rowCell - 1][col] === board[rowCell][col] && !upEmpty;

        if (upSame) {
          board[rowCell - 1][col] = board[rowCell][col] * 2;
          board[rowCell][col] = 0;
        }
      }
    }
  }
};

const moveKeyMap = (key) => {
  return (
    {
      ArrowLeft: moveLeft,
      ArrowRight: moveRight,
      ArrowUp: moveUp,
      ArrowDown: moveDown,
    }[key] ?? undefined
  );
};

const createMove = (ctx) => {
  document.addEventListener("keyup", (event) => {
    const move = moveKeyMap(event.key);
    if (!move) {
      return;
    }
    move();

    ctx.clearRect(0, 0, 1000, 1000);
    addRandomNumTOBoard(board);

    drawBoard(ctx);
    checkGameIsWin();
    if (checkGameIsOver()) {
      setTimeout(() => {
        alert("all");
      }, 0);
    }
  });
};

const checkGameIsOver = () => {
  const hasFreeSpace = board.some((row) => !!row.some((cell) => !cell));

  if (hasFreeSpace) {
    return false;
  }

  for (let row = 0; row <= board.length - 1; row++) {
    for (let col = 0; col <= board[row].length - 1; col++) {
      const cell = board[row][col];
      const cellLeftSame = cell === board[row][col - 1];
      const cellRightSame = cell === board[row][col + 1];
      const cellDownSame = cell === board[row + 1]?.[col];
      const cellUpSame = cell === board[row - 1]?.[col];
      if (cellLeftSame || cellDownSame || cellRightSame || cellUpSame) {
        return false;
      }
    }
  }
  return true;
};

const WIN_CELL = 2048;
let gameAfterEnd = false;
const checkGameIsWin = () => {
  const isWin = board.flat().find((cell) => cell === WIN_CELL);

  if (!isWin || gameAfterEnd) return;
  gameAfterEnd = confirm("WIN! Continue?");

  if (gameAfterEnd) {
    board = structuredClone(INIT_BOARD);
  }
};

const main = () => {
  const canvas = document.querySelector("#game");
  const ctx = canvas.getContext("2d");
  ctx.font = "48px serif";

  addRandomNumTOBoard(board);
  createMove(ctx);
  drawBoard(ctx);
};

main();
