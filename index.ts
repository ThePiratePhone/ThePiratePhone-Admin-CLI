import { select } from '@inquirer/prompts';
import chalk from 'chalk';
import dotenv from 'dotenv';
import dbGestion from './dbGestion/dbGestion';
import { simpleFiglet } from './utils';
import createArea from './dbGestion/createArea';

dotenv.config({ path: '.env' });
async function home() {
	console.clear();
	console.log('welcome in');
	console.log(simpleFiglet('TPP Admin CLI'));
	console.log(chalk.blueBright('=> Home'));
	const answer = await select({
		message: 'What are you doing ?',
		choices: [
			{
				name: 'Db gestion',
				value: 'db_gestion'
			},
			{
				name: 'SAV',
				value: 'sav'
			},
			{
				name: chalk.redBright('Exit'),
				value: 'exit'
			}
		]
	});
	switch (answer) {
		case 'db_gestion':
			dbGestion();
			break;
		case 'sav':
			// sav();
			break;
		case 'exit':
			process.exit(0);
	}
}
home();
// createArea();
export default home;
