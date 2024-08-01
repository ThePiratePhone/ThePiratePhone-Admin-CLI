import { select } from '@inquirer/prompts';
import chalk from 'chalk';
import home from '../index';
import { end, simpleFiglet } from '../utils';
import createArea from './createArea';
import createCaller from './createCaller';
import createCampaign from './createCampaing';
import createClient from './createClient';
import { destrucDb } from './dbUtils';
import converter from './V1toV2/converter';
import moveData from './mover';

async function dbGestion() {
	console.clear();
	console.log(simpleFiglet('TPP Admin CLI'));
	console.log(chalk.blueBright('=> DB Gestion'));
	console.log(
		'your default database is :',
		chalk.greenBright(process.env.defaultURI?.split('/').at(-1)?.split('?').at(0))
	);
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
				name: 'Create Area',
				value: 'create_area'
			},
			{
				name: 'Create Campaign',
				value: 'create_campaign'
			},
			{
				name: 'Create Client(s)',
				value: 'create_client'
			},
			{
				name: 'Create caller',
				value: 'create_caller'
			},
			{
				name: 'move data',
				value: 'move_data'
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
		case 'create_area':
			await createArea();
			break;
		case 'create_campaign':
			await createCampaign();
			break;
		case 'create_client':
			await createClient();
			break;
		case 'create_caller':
			await createCaller();
			break;
		case 'move_data':
			moveData();
			break;
		case 'home':
			home();
			break;
		case 'exit':
			process.exit(0);
	}
}
export default dbGestion;
