import { input, confirm } from '@inquirer/prompts';
import mongoose from 'mongoose';
import { end, log } from '../utils';
import { AreaModel } from '../Models';
import { printArea } from './dbUtils';

export default async function createArea() {
	let corect = false;
	let name = '';
	let adminPassword = '';
	let password = '';
	let time = Date.now();
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
		name = await input({ message: 'what is the name of the new area ?' });
		adminPassword = await input({ message: 'what is the admin password ?' });
		password = await input({ message: 'what is the password for joign the area ?' });

		console.log('recapitulatif:');
		console.log('name: ' + name);
		console.log('adminPassword: ' + adminPassword);
		console.log('password: ' + password);

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
