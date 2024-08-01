import { confirm, input, select } from '@inquirer/prompts';
import chalk from 'chalk';
import mongoose, { mongo } from 'mongoose';
import { AreaModel, CallerModel, CampaignModel } from '../Models';
import { end, log } from '../utils';
import { printArea, printCampaign, printTab } from './dbUtils';

export default async function createCaller() {
	let corect = false,
		name: string,
		phone: string,
		pinCode: string,
		campaignId: mongo.ObjectId,
		areaId: mongo.ObjectId,
		time = Date.now();
	log('connecting to database...', 'log');
	const connection = mongoose.createConnection(process.env.defaultURI ?? '');
	log(`connected in ${Date.now() - time}ms`, 'info');
	log('registering models...', 'log');
	time = Date.now();
	const area = connection.model('Area', AreaModel),
		campaign = connection.model('Campaign', CampaignModel),
		caller = connection.model('Caller', CallerModel);
	log(`models registered in ${Date.now() - time}ms`, 'info');
	do {
		name = await input({ message: `what is the ${chalk.blueBright('name')} of the new caller ?` });
		phone = await input({ message: `what is the ${chalk.blueBright('phone')} of the new caller ? ` });
		pinCode = await input({
			message: `what is the ${chalk.blueBright('pin code')} of the new caller (4number)? `,
			validate: value => value.length === 4 && !isNaN(Number(value))
		});
		console.log('this is existing Campaign DB');
		await printCampaign(connection);
		const campaigns = await campaign.find({}, ['_id', 'name']).sort({ name: 1 });
		const campaignChoices = campaigns.map((campaign: any) => {
			return {
				name: campaign.name,
				value: campaign._id
			};
		});
		campaignId = await select({
			message: `what is the ${chalk.blueBright('campaign')} of the new caller ?`,
			choices: campaignChoices
		});
		console.log('this is existing Area DB');
		await printArea(connection);
		const areas = await area.find({}, ['_id', 'name']).sort({ name: 1 });
		const areaChoices = areas.map((area: any) => {
			return { name: area.name, value: area._id };
		});
		areaId = await select({
			message: `what is the ${chalk.blueBright('area')} of the new caller ?`,
			choices: areaChoices
		});

		console.log('recapitulatif:');
		printTab([
			['name', name],
			['phone', phone],
			['pin code:', pinCode]
		]);
		corect = await confirm({
			message: 'Is it correct ?',
			default: true
		});
	} while (!corect);
	log('creating caller...', 'log');
	time = Date.now();
	const newCaller = new caller({
		name,
		phone,
		pinCode,
		campaigns: [campaignId],
		area: areaId
	});
	try {
		await newCaller.save();
		log(`caller created in ${Date.now() - time}ms`, 'info');
	} catch (error: any) {
		log(error, 'error');
	}
	end();
}
