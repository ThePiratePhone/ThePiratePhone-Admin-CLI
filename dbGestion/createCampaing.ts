import { confirm, input, select } from '@inquirer/prompts';
import chalk from 'chalk';
import DatePrompt from 'inquirer-date-prompt';
import mongoose from 'mongoose';
import { AreaModel, CampaignModel } from '../Models';
import { end, log } from '../utils';
import { printArea, printCampaign } from './dbUtils';
const inquirer = require('inquirer');

export default async function createCampaign() {
	inquirer.registerPrompt('date', DatePrompt);
	let corect = false,
		name: string,
		script: string,
		dateStart: Date,
		dateEnd: Date,
		CampaignPassword: string,
		areaId,
		time = Date.now();
	log('connecting to database...', 'log');
	const connection = mongoose.createConnection(process.env.defaultURI ?? '');
	log(`connected in ${Date.now() - time}ms`, 'info');
	log('registering models...', 'log');
	time = Date.now();
	const area = connection.model('Area', AreaModel),
		campaign = connection.model('Campaign', CampaignModel);
	log(`models registered in ${Date.now() - time}ms`, 'info');
	log('this is existing Campaign DB');
	await printCampaign(connection);

	do {
		name = await input({ message: `what is the ${chalk.blueBright('name')} of the new campaing ?` });
		script = await input({ message: `what is the ${chalk.blueBright('script')} of the new campaing ? ` });
		dateStart = (
			await inquirer.prompt({
				name: 'dateStart',
				message: `what is the ${chalk.blueBright('start call hours')} of the campaign ?`,
				type: 'date',
				locale: 'fr-FR'
			})
		).dateStart;
		dateEnd = (
			await inquirer.prompt({
				name: 'dateEnd',
				message: `what is the ${chalk.blueBright('end call hours')} of the campaign ?`,
				type: 'date',
				locale: 'fr-FR'
			})
		).dateEnd;
		CampaignPassword = await input({
			message: `what is the ${chalk.blueBright('password')} for joign the campaign ?`
		});
		await printArea(connection);
		const areas = await area.find({}, ['_id', 'name']).sort({ name: 1 });
		const areaChoices = areas.map((area: any) => {
			return {
				name: area.name,
				value: area._id
			};
		});
		areaId = await select({
			message: 'Select an area',
			choices: areaChoices
		});
		console.log('recapitulatif:');
		console.log('name: ' + name);
		console.log('script: ' + script);
		console.log('dateStart: ' + dateStart);
		console.log('dateEnd: ' + dateEnd);
		console.log('CampaignPassword: ' + CampaignPassword);
		console.log('areaId: ' + areaId);
		corect = await confirm({
			message: 'Is it correct ?',
			default: true
		});
	} while (!corect);

	log('creating campaign...', 'log');
	time = Date.now();
	dateStart.setFullYear(1970);
	dateStart.setMonth(0);
	dateStart.setDate(1);
	dateEnd.setFullYear(1970);
	dateEnd.setMonth(0);
	dateEnd.setDate(1);
	const newCampaign = new campaign({
		name: name,
		script: script,
		dateStart: dateStart,
		dateEnd: dateEnd,
		password: CampaignPassword,
		area: areaId
	});
	try {
		await newCampaign.save();
		log(`campaign created in ${Date.now() - time}ms`, 'info');
	} catch (error: any) {
		log(error, 'error');
	}
	end();
}
