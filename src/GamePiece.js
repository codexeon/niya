import React from 'react';
import Constants from './Constants'

function GamePiece(props) {
    let clickPiece = () => {
        if (props.isValidMove) {
            props.clickPiece(props.index);
        }
    }
    let text;
    let style = {};

    if (!props.playerMove) {
        let piece = props.piece;
        let color1 = Constants.Colors[piece[0]];
        let color2 = Constants.Colors[piece[1]];
        style["background"] = `linear-gradient(180deg, ${color1} 50%, ${color2} 50%)`

    } else {
        style["backgroundColor"] = props.playerMove == 1 ? "red" : "black";
        style["borderRadius"] = "50%";
    }

    if (props.isValidMove) {
        style["cursor"] = "pointer";
    }
   
    
    return (
    <span style={style} className="GamePiece" onClick={clickPiece}>
        {text}
    </span>
    );
}

export default GamePiece;
