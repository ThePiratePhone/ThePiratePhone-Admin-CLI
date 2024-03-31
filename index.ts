import inquirer from 'inquirer';
import dotenv from 'dotenv';
import createArea from './function/createArea';
import dropAll from './function/dropAll';
import createCampaign from './function/createCampaign';
import createClients from './function/createClients';
dotenv.config({ path: '.env' });

(async () => {
	const answer = await inquirer.prompt({
		name: 'list',
		message: 'choose a action',
		choices: [
			{
				name: 'drop all',
				value: 'dropAll'
			},
			{
				name: 'Create Area',
				value: 'createArea'
			},
			{
				name: 'Create Campaign',
				value: 'createCampaign'
			},
			{
				name: 'Create Client(s)',
				value: 'createClient'
			}
		],
		type: 'list'
	});
	if (answer.list === 'dropAll') {
		dropAll();
	}
	if (answer.list === 'createArea') {
		createArea();
	}
	if (answer.list === 'createCampaign') {
		createCampaign();
	}
	if (answer.list === 'createClient') {
		const answer = await inquirer.prompt({
			name: 'list',
			message: 'choose a action',
			choices: [
				{
					name: 'Create one Client',
					value: 'createClient'
				},
				{
					name: 'Create many Clients',
					value: 'createClients'
				}
			],
			type: 'list'
		});
		if (answer.list === 'createClient') {
			console.log('not implemented yet');
		}
		if (answer.list === 'createClients') {
			createClients();
		}
	}
})();
