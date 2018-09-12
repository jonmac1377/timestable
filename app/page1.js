const React = require("react");

class Page1 extends React.Component {
	state = { numQuestions: "", tables: [] };

	constructor(props) {
		super(props);
		for (let x = 1; x < 13; x++) {
			this.state.tables.push({ name: x, checked: false });
		}
	}

	nextStep(event){
		event.preventDefault();	
		this.props.onSubmit(this.state);
	}

	setCheckState(checked,table){
		this.setState((prevState)=>{table.checked=checked});
	}

	render() {
		return (
			<form className="Part1" onSubmit={(event)=>this.nextStep(event)}>
				<div>
					<label htmlFor="numQuestions">Number of questions</label>
					<input type="number" value={this.state.numQuestions}
						onChange={(event) => this.setState({ numQuestions: event.target.value })} />
				</div>
				<div>
					tables
					{this.state.tables.map(table => {
						return (
							<span key={table.name}>
								<input id={table.name} type="checkbox" value={table.checked}
							 onChange={
								 (event) => this.setCheckState(event.target.checked, table)
							} />
							<label htmlFor={table.name}  className="btn btn-primary table-select__label">{table.name}</label> 
							
							</span>
						);
					})}
				</div>
				<input type="submit" value="Next" />
			</form>);
	}
}

module.exports = Page1;