import { select } from '@inquirer/prompts';
import chalk from 'chalk';
import home from '../index';
import { end, simpleFiglet } from '../utils';
import { destrucDb } from './dbUtils';
import converter from './V1toV2/converter';

async function dbGestion() {
	console.clear();
	console.log(simpleFiglet('TPP Admin CLI'));
	console.log(chalk.blueBright('=> DB Gestion'));
	const answer = await select({
		message: 'witch action on database ?',
		choices: [
			{
				name: 'Drop db',
				value: 'drop_db'
			},
			{
				name: 'Convert db',
				value: 'convert_db'
			},
			{
				name: chalk.greenBright('Home'),
				value: 'home'
			},
			{
				name: chalk.redBright('Exit'),
				value: 'exit'
			}
		]
	});
	switch (answer) {
		case 'drop_db':
			await destrucDb();
			end();
			break;
		case 'convert_db':
			await converter();
			break;
		case 'home':
			home();
			break;
		case 'exit':
			process.exit(0);
	}
}
export default dbGestion;
