# Conway's Game of life
This project is a implementation of [Conway's game of life](https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life) , with an extra rule to handle the edges of grid.

*Cell* - Has 2 states ( Dead / Alive ) <br />
*Grid* - Consists of multiple cells

## Rules 
1. Any live cell with fewer than two live neighbours dies.
2. Any live cell with two or three live neighbours lives.
3. Any live cell with more than three live neighbours dies.
4. Any dead cell with exactly three live neighbours becomes a live cell.
5. Any cell at the edge of grid dies.
