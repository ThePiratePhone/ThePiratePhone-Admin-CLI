import inquirer from 'inquirer';
import chalk from 'chalk';
import { Area } from '../models/area';
import { Caller } from '../models/Caller';
import { Campaign } from '../models/Campaign';
import { Client } from '../models/Client';
import Progress from '../utils/progress';
import mongoose from 'mongoose';

export default async function dropAll() {
	const answer = await inquirer.prompt({
		name: 'confirm',
		message: 'Are you sure you want to ' + chalk.red('drop all') + ' ?',
		type: 'confirm',
		default: false
	});
	if (answer.confirm) {
		const dateStart = new Date();
		const progress = new Progress('drop all', 5);
		await mongoose.connect(process.env.URI ?? '').catch(error => {
			progress.errored();
			console.log('error ' + error);
		});
		progress.nextStep('droping areas');
		await Area.collection.drop();
		progress.nextStep('droping callers');
		await Caller.collection.drop();
		progress.nextStep('droping campaigns');
		await Campaign.collection.drop();
		progress.nextStep('droping clients');
		await Client.collection.drop();
		progress.finish();
	}
}
