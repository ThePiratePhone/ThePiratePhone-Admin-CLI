export default class Progress {
	private progress: number;
	private steps: number;
	private message: string;
	private dateStart: Date;
	constructor(message: string, steps: number) {
		this.progress = 0;
		this.steps = steps;
		this.message = message;
		this.dateStart = new Date();
	}
	public nextStep(message = this.message) {
		this.clear();
		this.progress++;
		console.log(
			'[' +
				this.progress +
				'/' +
				this.steps +
				'] (' +
				(new Date().getTime() - this.dateStart.getTime()) +
				'ms) ' +
				message
		);
	}

	public addStep(nbStep = 1) {
		this.steps += nbStep;
	}

	public setMessage(message: string) {
		this.message = message;
	}

	public finish(message = this.message) {
		this.clear();
		console.log('[ended] (' + (new Date().getTime() - this.dateStart.getTime()) + 'ms) ' + message);
	}

	public errored(message = this.message) {
		this.clear();
		console.log('[error] (' + (new Date().getTime() - this.dateStart.getTime()) + 'ms) ' + message);
	}

	private clear() {
		process.stdout.moveCursor(0, -1);
		process.stdout.clearLine(1);
	}
}
