import chalk from 'chalk';
import mongoose from 'mongoose';
import { log } from '../utils';
import { AreaModel, CallerModel, CallModel, CampaignModel, ClientModel } from '../Models';
import { confirm } from '@inquirer/prompts';

async function destrucDb() {
	const answer = await confirm({
		message: 'Are you want to ' + chalk.red('delete') + ' database ?',
		default: false
	});
	if (answer) {
		log('connecting to database...', 'log');
		const connection = mongoose.createConnection(process.env.defaultURI ?? '');
		log('registering models...', 'log');
		const area = connection.model('Area', AreaModel);
		const call = connection.model('Call', CallModel);
		const caller = connection.model('Caller', CallerModel);
		const campaign = connection.model('Campaign', CampaignModel);
		const client = connection.model('Client', ClientModel);
		let time = Date.now();
		log('deleting data...', 'log');
		await area.deleteMany({});
		await call.deleteMany({});
		await caller.deleteMany({});
		await campaign.deleteMany({});
		await client.deleteMany({});
		log(`data ${chalk.red('deleted')} in ${Date.now() - time}ms`, 'info');
	}
}

export { destrucDb };
