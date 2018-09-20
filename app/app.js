const React = require("react");
const Page1 = require("./Page1");
const Page2 = require("./Page2");
const Game = require("./Game");


class App extends React.Component {

    state = { activePage: 0 };

    shite = { numberOfQuestions: 0, tables: [] };

    stirShite = (stick) => {
        this.shite.numberOfQuestions = stick.numQuestions;
        this.shite.tables.length = 0;
        this.shite.tables.push(...stick.tables.filter(t => t.checked));
        this.switchPage(1);
    }

    switchPage = (pageNumber) => {
        this.setState({ activePage: pageNumber });
    }

    startGame = (data)=>{
        console.log(data);
        this.bullets = data.score;
        this.perfect = data.perfect;
        this.switchPage(2);
    }

    render() {
        if (this.state.activePage == 0) {
            return <Page1 onSubmit={this.stirShite} />;
        }
        else if (this.state.activePage == 1) {
            return <Page2 shite={this.shite} startGame={this.startGame}/>;
        }
        else {
            return <Game bullets={this.bullets} perfect={this.perfect} />;
        }
    }
}

module.exports = App;