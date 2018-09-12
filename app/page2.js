const React = require("react");

class Page2 extends React.Component {
	questionList=[];

	randomise(anArray){
		anArray.forEach(member=>{member.sortKey=Math.random()});

		anArray.sort((a,b)=>{return a.sortKey > b.sortKey ? 1 : a.sortKey===b.sortKey ? 0:-1});

		anArray.forEach(member=>{delete member.sortKey});
	}

	generateQuestionList(){
		const tables = this.shite.tables.map(t=>t.name);
		const list=[];
		tables.forEach(table=>{
			for(let multiplier = 1;multiplier<13;multiplier++){
				const answer= table*multiplier;
				const answers=[answer];
				while(answers.length<4){
					const candidate = answer + Math.floor((Math.random()-0.5)*20);
					if(candidate>2 && answers.indexOf(candidate)==-1){
						answers.push(candidate);
					}
				}

				const scrambler = Math.floor(Math.random()*4);

				const removed = answers.splice(scrambler,4);

				answers.unshift(...removed);

				list.push({table,multiplier,correctAnswer:table*multiplier,answers:answers.map(a=> { return {answer:a}})});
			}
		});

		this.randomise(list);
		this.questionList.push(...list.slice(0,this.shite.numberOfQuestions));	
	}

	constructor(props) {
		super(props);
		this.shite = props.shite;		
		this.generateQuestionList();		
		
		this.state={
			activeQuestion:this.questionList.splice(0,1)[0],
			activeQuestionIndex:1,
			answeredQuestions:[],
			score:0
		};

		this.state.activeQuestion.begin = new Date();		
	}	

	answerQuestion=(a)=>{
		if(this.state.activeQuestion.correctAnswer !== a.answer){
			this.setState((prev,props)=>{
				const activeQuestion = prev.activeQuestion;
				const selectedAnswer = activeQuestion.answers.find(ans=>ans.answer===a.answer);
				selectedAnswer.wrong=true;
				return {activeQuestion};
			});
			return;
		}
		this.setState((p,pr)=>
		 {
			 const activeQuestion=p.activeQuestion;
			 activeQuestion.answer = a.answer;
		})

		

		this.popQuestion();
	}

	popQuestion(){
		this.setState((prev,props)=>{
			const retVal = {};
			if(prev.activeQuestion){
				const answeredQuestions = prev.answeredQuestions;
				answeredQuestions.unshift(prev.activeQuestion);
				retVal.answeredQuestions = answeredQuestions;

				const beginMs =prev.activeQuestion.begin.getTime();

				const totalMs = new Date().getTime() - beginMs;

				const floor = Math.ceil(totalMs/1000) - 2;

				const score = floor <= 1 ? 3 : floor >= 3 ? 1 : 2;

				console.log("score for ", totalMs," = ", score);
				retVal.score = prev.score+=score;
			}

			const [next] = this.questionList.splice(0,1);

			retVal.activeQuestion = next || null;
			if(retVal.activeQuestion){
				retVal.activeQuestion.begin = new Date();
			}
			retVal.activeQuestionIndex = prev.activeQuestionIndex + 1;

			return retVal;
		});
	}

	render() {
		if(this.state.activeQuestion){
			return (
				<div>
					Score: {this.state.score}
					<br/>
					You are on question {this.state.activeQuestionIndex} of {this.shite.numberOfQuestions}
					<br/>
					{this.state.activeQuestion.table} x {this.state.activeQuestion.multiplier} = 
					{
						this.state.activeQuestion.answers.map(a=> <button className={a.wrong?"btn-warning btn answer-button":"btn-primary btn answer-button"} onClick={evt=>{this.answerQuestion(a)}} >{a.answer}</button>)
					}				
					
				</div>);
		}
		return (<div>Goodbye</div>)
		
	}
}

module.exports = Page2;