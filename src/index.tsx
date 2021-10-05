import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

type SquareProps = {
  value: string,
  onClick: () => void,
}
function Square(props: SquareProps) {
  return (
    <button className="square" onClick={props.onClick}>
      {props.value}
    </button>
  );
}

type BoardProps = {
  squares: string[],
  onClick: (i: number) => void,
}
class Board extends React.Component<BoardProps> {
  renderSquare(i: number): JSX.Element {
    return (
      <Square
        value={this.props.squares[i]}
        onClick={() => this.props.onClick(i)}
      />
    );
  }

  render() {
    const squareCol = [];
    for (let i = 0; i < 9; i += 3) {
      const squareRow = [];
      for (let j = 0; j < 3; j++) {
        squareRow.push(this.renderSquare(i + j));
      }
      squareCol.push(<div className="board-row">{squareRow}</div>)
    }
    return (
      <div>{squareCol}</div>
    );
  }
}

type ToggleProps = {
  handleToggle: (isToggleOn: boolean) => void,
}
type ToggleState = {
  isToggleOn: boolean,
}
class Toggle extends React.Component<ToggleProps, ToggleState> {
  constructor(props: ToggleProps) {
    super(props);
    this.state = { isToggleOn: true };

    // This binding is necessary to make `this` work in the callback
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick = (event: any) => {
    event.preventDefault();
    this.setState({
      isToggleOn: !this.state.isToggleOn,
    })
    this.props.handleToggle(this.state.isToggleOn);
  }


  render() {
    return (
      <button onClick={this.handleClick}>
        {this.state.isToggleOn ? '昇順にする' : '降順にする'}
      </button>
    );
  }
}

type GameHistory = {
  squares: ("X" | "O")[],
  col: null | number,
  row: null | number,
  player: null | "X" | "O",
}
type GameState = {
  history: GameHistory[],
  stepNumber: number,
  xIsNext: boolean,
  isToggleOn: boolean,
}
class Game extends React.Component<any, GameState> {
  constructor(props: any) {
    super(props);
    this.state = {
      history: [{
        squares: Array(9).fill(null),
        col: null,
        row: null,
        player: null,
      }],
      stepNumber: 0,
      xIsNext: true,
      isToggleOn: true,
    }
  }

  handleClick(i: number) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();

    let col = i % 3 + 1;

    // switch (i) {
    //   case 0:
    //   case 3:
    //   case 6:
    //     col = 1;
    //     break;
    //   case 1:
    //   case 4:
    //   case 7:
    //     col = 2;
    //     break;
    //   case 2:
    //   case 5:
    //   case 8:
    //     col = 3;
    //     break;
    //   default:
    //     col = null;
    // }

    let row = Math.floor(i / 3) + 1;

    // switch (i) {
    //   case 0:
    //   case 1:
    //   case 2:
    //     row = 1;
    //     break;
    //   case 3:
    //   case 4:
    //   case 5:
    //     row = 2;
    //     break;
    //   case 6:
    //   case 7:
    //   case 8:
    //     row = 3;
    //   default:
    //     row = null;
    // }

    if (calculateWinner(squares) || squares[i]) {
      return;
    }
    squares[i] = this.state.xIsNext ? 'X' : 'O';
    this.setState({
      history: history.concat([{
        squares: squares,
        col: col,
        row: row,
        player: squares[i],
      }]),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext,
    });
  }

  jumpTo(step: number) {
    this.setState({
      stepNumber: step,
      xIsNext: (step % 2) === 0,
    });
  }

  // onClick() {
  //   let isToggleOn = true;
  //   isToggleOn = !isToggleOn;
  // }

  handleToggle = (isToggleOn: boolean): void => {
    this.setState({
      isToggleOn: !isToggleOn,
    });
  }

  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const winner = calculateWinner(current.squares);

    const moves = history.map((step, move) => {
      const desc = move ?     // 三項演算子
        `Go to move # ${move}` :
        `Go to game start`;
      if (!step.col || !step.row) {
        return (
          <li key={move}>
            <button onClick={() => this.jumpTo(move)}>{desc}</button>
            <p></p>
          </li>
        );
      } else if (move === this.state.stepNumber) {
        return (
          <li key={move}>
            <button onClick={() => this.jumpTo(move)}>{desc}</button>
            <p><b>({step.col}, {step.row})</b></p>
            <p><b>打ったのは{step.player}です</b></p>
          </li>
        );
      } else {
        return (
          <li key={move}>
            <button onClick={() => this.jumpTo(move)}>{desc}</button>
            <p>({step.col}, {step.row})</p>
            <p>打ったのは{step.player}です</p>
          </li>
        );
      }
    });

    let status;
    if (winner) {
      status = `Winner: ${winner}`;
    } else {
      status = `Next player: ${this.state.xIsNext ? 'X' : 'O'}`;
    }

    return (
      <div>
        <h1>三目並べゲーム</h1>
        <div className="game">
          <div className="game-board">
            <Board
              squares={current.squares}
              onClick={(i) => this.handleClick(i)}
            />
          </div>
          <div className="game-info">
            <div>{status}</div>
            <Toggle
              handleToggle={this.handleToggle}
            />
            <ol>{this.state.isToggleOn ? moves.reverse() : moves}</ol>
          </div>
        </div>
      </div>
    );
  }
}

// ========================================

ReactDOM.render(
  <Game />,
  document.getElementById('root')
);

function calculateWinner(squares: ("X" | "O")[]) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
}