import React from 'react';
import GamePiece from './GamePiece'
import Constants from './Constants'

class GameBoard extends React.Component {
    constructor(props) {
        super(props);
        this.state = {playerTurn: 1,
            pieces: this.generatePieces(),
            lastPiece: null,
            boardState: new Array(Constants.BoardSize * Constants.BoardSize),
            ai: Constants.PlayerTwoOptions[0],
            aiMessage: ""
        };
      }

      generatePieces() {
        let pieces = [];
        for (let i = 0; i < Constants.BoardSize; i++) {
            for (let j = Constants.BoardSize; j < Constants.BoardSize * 2; j++) {
            pieces.push([i,j]);
            }
        }
        for (var i = pieces.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var temp = pieces[i];
            pieces[i] = pieces[j];
            pieces[j] = temp;
        }
        return pieces;
      }

      isValidMove(index, boardState, lastPiece) {
          if (boardState[index]) {
              return false;
          }
          else if (lastPiece == null) {
              return true;
          }

          let piece = this.state.pieces[index];
          for (let i = 0; i < piece.length; i++) {
            if (lastPiece.indexOf(piece[i]) >= 0) {
                return true;
            }
          }
          return false;
      }

      checkWinner(boardState, lastIndex) {
        let lastPlayer = boardState[lastIndex];
        // Check horizontal
        for (let i = 0; i < Constants.BoardSize; i++) {
            let samePlayer = boardState[lastIndex - lastIndex % Constants.BoardSize + i] == lastPlayer;
            if (samePlayer) {
                if (i === Constants.BoardSize - 1) {
                    return lastPlayer;
                }
            }
            else
            {
                break;
            }
        }

        // // Check vertical
        for (let i = 0; i < Constants.BoardSize; i++) {
            let samePlayer = boardState[lastIndex % Constants.BoardSize + i * Constants.BoardSize] == lastPlayer;
            if (samePlayer) {
                if (i === Constants.BoardSize - 1) {
                    return lastPlayer;
                }
            }
            else
            {
                break;
            }
        }

        // Check diagnal
        for (let i = 0; i < Constants.BoardSize; i++) {
            let samePlayer = boardState[i*Constants.BoardSize + i] == lastPlayer;
            if (samePlayer) {
                if (i === Constants.BoardSize - 1) {
                    return lastPlayer;
                }
            }
            else
            {
                break;
            }
        }
        
        // Check reverse diagnal
        for (let i = 0; i < Constants.BoardSize; i++) {
            let samePlayer = boardState[(Constants.BoardSize - i - 1)*(Constants.BoardSize) + i] === lastPlayer;
            if (samePlayer) {
                if (i === Constants.BoardSize - 1) {
                    return lastPlayer;
                }
            }
            else
            {
                break;
            }
        }
        
        let squareDimension = Math.sqrt(Constants.BoardSize);
        for (let i = 0; i <= Constants.BoardSize - squareDimension; i++) {
            for (let j = 0; j <= Constants.BoardSize - squareDimension; j++) {
                let samePlayer = true;
                for (let k = 0; k < squareDimension && samePlayer; k++)
                {
                    for (let l = 0; l < squareDimension && samePlayer; l++)
                    {
                        samePlayer = boardState[(i + k)*Constants.BoardSize + j + l] === lastPlayer;
                    }
                }
                if (samePlayer) {
                    return lastPlayer
                }
            }
        }
      }

      minMax = (boardState, lastIndex, player, level, numberOfSpaces, results) => {
        let validMoves = [];
        for (let i = 0; i < this.state.pieces.length; i++) {
            if (this.isValidMove(i, boardState, this.state.pieces[lastIndex])) {
                validMoves.push(i);
            }
        }

        if (validMoves.length == 0 || this.checkWinner(boardState, lastIndex)) {
            if (numberOfSpaces == 0) {
                return {score: 0, index: lastIndex};
            }
            else if (player == 1) {
                return {score: 100 - level*.25, index: lastIndex};
            } else {
                return {score: -100, index: lastIndex};
            }
        }

        var moves = [];
        for (let i = 0; i < validMoves.length; i++) {
            let newBoardState = [...boardState];
            let lastIndex = validMoves[i];
            newBoardState[lastIndex] = player;
            let minMaxResult = null;
            let key = JSON.stringify(newBoardState);
            minMaxResult = results[key];
            if (!minMaxResult) {
                minMaxResult = this.minMax(newBoardState, lastIndex, player == 1 ? 2 : 1, level + 1, numberOfSpaces - 1, results)
                results[key] = minMaxResult;
            }
            moves.push({...minMaxResult, index: lastIndex});
        }

        if (player == 1) {
            let minIndex = -1;
            let opponentWins = 0;
            moves.forEach((x, i) => {
                if (minIndex == -1 || x.score < moves[minIndex].score) {
                    minIndex = i;
                }
                if (x.score > 0) {
                    opponentWins++;
                }
            });

            let move = moves[minIndex];
            if (move.score < 0) {
                move.score += opponentWins;
            }
            return moves[minIndex];
        } else {
            let maxIndex = -1;
            let opponentWins = 0;
            moves.forEach((x, i) => {
                if (maxIndex == -1 || x.score > moves[maxIndex].score) {
                    maxIndex = i;
                }
                if (x.score < 0) {
                    opponentWins++;
                }
            });
            let move = moves[maxIndex];
            if (move.score > 0) {
                move.score -= opponentWins;
            }


            if (level == 0) {
                this.setState({aiMessage: `I explored ${Object.keys(results).length} unique paths.`});
            }
            return move;
        }
      }

      makeRandomMove(validMoves) {
        var index = Math.floor(Math.random() * validMoves.length);
        return validMoves[index];
      }
    
      onClickPiece = (index) => {
        let boardState = [...this.state.boardState];
        boardState[index] = this.state.playerTurn;
        let winner = this.checkWinner(boardState, index);
        let validMoves = [];
        let playerTurn = this.state.playerTurn;

        if (!winner) {
            for (let i = 0; i < this.state.pieces.length; i++) {
                if (this.isValidMove(i, boardState, this.state.pieces[index])) {
                    validMoves.push(i);
                }
            }
        }

        let numberOfSpaces = 0;
        for (let i = 0; i < boardState.length; i++) {
            if (!boardState[i]) {
                numberOfSpaces++;
            }
        }

        if (validMoves.length == 0) {
            winner = numberOfSpaces > 0 ? playerTurn : -1;
        }

        if (!winner && this.state.ai !== "Manual") {
            playerTurn = 2;
            if (this.state.ai === "Random")
            {
                index = this.makeRandomMove(validMoves);
            }
            else if (this.state.ai === "Minimax")
            {
                index = this.minMax(boardState, index, playerTurn, 0, numberOfSpaces, {}).index;
            }

            boardState[index] = playerTurn;
            winner = this.checkWinner(boardState, index);
            if (!winner) {
                let hasValidMove = false;
                for (let i = 0; i < this.state.pieces.length && !hasValidMove; i++) {
                    if (this.isValidMove(i, boardState, this.state.pieces[index])) {
                        hasValidMove = true;
                    }
                }
                if (!hasValidMove) {
                    winner = playerTurn;
                }
            }
        }
        this.setState({lastPiece: this.state.pieces[index],
            playerTurn: playerTurn == 1 ? 2 : 1,
            boardState,
            winner
            });        
      }

      restartGame = () => {
        this.setState({
            pieces: this.generatePieces(),
            lastPiece: null,
            boardState: new Array(Constants.BoardSize * Constants.BoardSize),
            winner: null,
            playerTurn: 1
            });
      }

      showWinner() {
          return (
            <div>
                {`Winner is: ${this.state.winner}`}
                <button onClick={this.restartGame}>Play Again</button>
            </div>
          );
      }
      changeAI = (e) => {
          this.setState({ai: e.target.value});
      }
      render() {
        let pieces = [];
        for (let i = 0; i < Constants.BoardSize * Constants.BoardSize; i++) {
            pieces.push(<GamePiece
                isValidMove={this.isValidMove(i, this.state.boardState, this.state.lastPiece)}
                clickPiece={this.onClickPiece.bind(this)}
                piece={this.state.pieces[i]}
                key={i}
                index={i}
                playerMove={this.state.boardState[i]}
            />);
        }
        return (
            <div>
                <div>Current Player Turn: Player { this.state.playerTurn }</div>
                <p>Player 2 options</p>
                <div>
                    {Constants.PlayerTwoOptions.map((x, i) => {
                        return <span><input onClick={this.changeAI} name="aimethod" type="radio" key={i} value={x} checked={this.state.ai == x} />{x}</span>
                    })}
                </div>
                <div className="GridWrapper">Last Piece:{this.state.lastPiece && <GamePiece
                    isValidMove={false}
                    clickPiece={this.onClickPiece.bind(this)}
                    piece={this.state.lastPiece}
                />}
                <div>
                    {this.state.winner && this.showWinner()}
                    {this.state.aiMessage}
                </div></div>
                <div className="GridWrapper">{pieces}</div>
            </div>
        );
    }
}

export default GameBoard;