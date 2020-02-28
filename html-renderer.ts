import { gameSize } from './constants';
import { Player, Ball, GameObject } from './interfaces';

const empty = 0;
const plyer = 1;
const bll = 2;
const brick = 3;

const createElem = col => {
  const elem = document.createElement('div');
  elem.classList.add('board');
  elem.style.display = 'inline-block';
  elem.style.marginLeft = '10px';
  elem.style.height = '6px';
  elem.style.width = '6px';
  elem.style['background-color'] = 
    col === empty
      ? 'white'
      : (col === plyer
        ? 'cornflowerblue'
        : col === bll
          ? 'gray'
          : 'silver');
  elem.style['border-radius'] = col === bll ? '100%' : '0%';
  return elem;
}

export const render = ([player, ball, bricks]: [Player, Ball, GameObject[]]) => {
  const game = Array(gameSize).fill(0).map(e => Array(gameSize).fill(0));
  game[player.x][player.y] = plyer;
  game[ball.x][ball.y] = bll;
  bricks.forEach(b => game[b.x][b.y] = brick);

  document.body.innerHTML = `Score: ${player.score} Lives: ${player.lives} <br/>`;
  game.forEach(r => {
    const rowContainer = document.createElement('div');
    r.forEach(c => rowContainer.appendChild(createElem(c)));
    document.body.appendChild(rowContainer);
  });
};