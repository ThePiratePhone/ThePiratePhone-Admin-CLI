import { select } from '@inquirer/prompts';
import chalk from 'chalk';
import createCampaign from './dbGestion/createCampaing';
import dotenv from 'dotenv';
import dbGestion from './dbGestion/dbGestion';
import { simpleFiglet } from './utils';

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
// createCampaign();
export default home;
