import { confirm } from '@inquirer/prompts';
import chalk from 'chalk';
import figlet from 'figlet';
import home from './index';

function simpleFiglet(text: string, font: figlet.Fonts = 'Standard'): string {
	return figlet.textSync(text, { width: process.stdout.columns, font: font });
}

function clearligne() {
	process.stdout.moveCursor(0, -1);
	process.stdout.clearLine(1);
}

function log(text: string, level: 'log' | 'info' | 'warn' | 'error' = 'info') {
	switch (level) {
		case 'log':
			console.log(chalk.gray(text));
			break;
		case 'info':
			console.log(text);
			break;
		case 'warn':
			console.log(chalk.yellow(text));
			break;
		case 'error':
			console.log(chalk.red(text));
			break;
	}
}

async function end() {
	const answer = await confirm({
		message: 'do you want to exit ?',
		default: false
	});
	if (answer) {
		process.exit(0);
	} else {
		home();
	}
}

function generateRandomPhoneNumber() {
	return '+33' + (Math.floor(Math.random() * (9_99_99_99_99 - 1_00_00_00_00)) + 1_00_00_00_00);
}
export { clearligne, end, log, simpleFiglet, generateRandomPhoneNumber };
