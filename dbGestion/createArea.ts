import { confirm, input } from '@inquirer/prompts';
import chalk from 'chalk';
import mongoose from 'mongoose';
import { AreaModel } from '../Models';
import { end, log } from '../utils';
import { printArea, printCampaign, printTab } from './dbUtils';

export default async function createArea() {
	let corect = false,
		name = '',
		adminPassword = '',
		password = '',
		time = Date.now();
	log('connecting to database...', 'log');
	const connection = mongoose.createConnection(process.env.defaultURI ?? '');
	log(`connected in ${Date.now() - time}ms`, 'info');
	log('registering models...', 'log');
	time = Date.now();
	const area = connection.model('Area', AreaModel);
	log(`models registered in ${Date.now() - time}ms`, 'info');
	log('this is existing Area DB');
	await printArea(connection);

	do {
		name = await input({ message: `what is the ${chalk.blueBright('name')} of the new area ?` });
		adminPassword = await input({ message: `what is the ${chalk.blueBright('admin password')} ?` });
		password = await input({ message: `what is the ${chalk.blueBright('password')} for joign the area ?` });

		console.log('recapitulatif:');
		printTab([
			['name', name],
			['adminPassword', adminPassword],
			['password', password]
		]);

		corect = await confirm({
			message: 'Is it correct ?',
			default: true
		});
	} while (!corect);
	log('creating area...', 'log');
	time = Date.now();
	const newArea = new area({
		name: name,
		adminPassword: adminPassword,
		password: password
	});
	try {
		await newArea.save();
		log(`area created in ${Date.now() - time}ms`, 'info');
	} catch (error: any) {
		log(error, 'error');
	}
	end();
}
