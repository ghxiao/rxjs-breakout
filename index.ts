console.clear();
import { fromEvent, of, interval, combineLatest, generate, noop } from 'rxjs';
import { map, mergeMap, pluck, startWith, scan, toArray, takeWhile, tap } from 'rxjs/operators';
import { gameSize } from './constants';
import { Player, Ball, GameObject } from './interfaces';
import { render } from './html-renderer';

const createGameObject = (x, y) => ({ x, y });

const player$ = combineLatest(
  of({ ...createGameObject(gameSize - 2, (gameSize / 2) - 1), score: 0, lives: 3 }),
  fromEvent(document, 'keyup').pipe(startWith({ code: '' }), pluck('code'))
).pipe(
  map(([player, key]) => (
    key === 'ArrowLeft'
      ? player.y -= 1
      : key === 'ArrowRight'
        ? player.y += 1
        : noop
    , player)
  )
)

const ball$ = combineLatest(
  of({ ...createGameObject(gameSize / 2, (gameSize - 3)), dirX: 1, dirY: 1 }),
  interval(150)
).pipe(
  map(([ball, _]: [Ball, number]) => (
    ball.dirX *= ball.x > 0 ? 1 : -1,
    ball.dirY *= (ball.y > 0 && ball.y < gameSize - 1) ? 1 : -1,
    ball.x += 1 * ball.dirX,
    ball.y -= 1 * ball.dirY,
    ball)
  )
)

const bricks$ = generate(1, x => x < 8, x => x + 1)
  .pipe(
    mergeMap(r => generate(r % 2 === 0 ? 1 : 0, x => x < gameSize, x => x + 2)
      .pipe(map(c => createGameObject(r, c)))
    ),
    toArray()
  )

const processGameCollisions = (_, [player, ball, bricks]: [Player, Ball, GameObject[]])
  : [Player, Ball, GameObject[]] => (
    (collidingBrickIndex => collidingBrickIndex > -1
      ? (bricks.splice(collidingBrickIndex, 1), ball.dirX *= -1, player.score++)
      : noop
    )(bricks.findIndex(e => e.x === ball.x && e.y === ball.y)),
    ball.dirX *= player.x === ball.x && player.y === ball.y ? -1 : 1,
    ball.x > player.x ? (player.lives-- , ball.x = (gameSize / 2) - 3) : noop,
    [player, ball, bricks]
  )

combineLatest(player$, ball$, bricks$)
  .pipe(
    scan<[Player, Ball, GameObject[]], [Player, Ball, GameObject[]]>(processGameCollisions),
    tap(render),
    takeWhile(([player]: [Player, Ball, GameObject[]]) => player.lives > 0)
  ).subscribe()