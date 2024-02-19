import mongoose from 'mongoose';
import inquirer from 'inquirer';
import { Area } from '../models/area';
export default async function createArea() {
	let corect = false;
	let name: string, adminPassword: string, password: string, adminPhone: string;
	do {
		const answer = await inquirer.prompt([
			{
				name: 'name',
				message: 'what is the name of the area ?',
				type: 'input'
			},
			{
				name: 'adminPassword',
				message: 'what is the admin password ?',
				type: 'input'
			},
			{
				name: 'adminPhone',
				message: 'what is the admin phone number ?',
				type: 'input'
			},
			{
				name: 'password',
				message: 'what is the password for joign the area ?',
				type: 'input'
			}
		]);
		name = answer.name;
		adminPassword = answer.adminPassword;
		password = answer.password;
		adminPhone = answer.adminPhone;

		console.log('recapitulatif:');
		console.log('name: ' + name);
		console.log('adminPassword: ' + adminPassword);
		console.log('adminPhone: ' + adminPhone);
		console.log('password: ' + password);

		const answer2 = await inquirer.prompt({
			name: 'correct',
			message: 'Is it correct ?',
			type: 'confirm'
		});
		corect = answer2.correct;
	} while (!corect);

	if (adminPhone.startsWith('0')) {
		adminPhone = '+33' + adminPhone.slice(1);
	}

	await mongoose
		.connect(process.env.URI ?? '')
		.then(() => {
			console.log('creating area...');
			new Area({
				name: name,
				CampaignList: [],
				AdminPassword: adminPassword,
				adminPhone: adminPhone,
				password: password
			})
				.save()
				.then(() => {
					process.stdout.moveCursor(0, -1);
					process.stdout.clearLine(1);
					console.log('area created');
				});
		})
		.catch(error => {
			console.log('error ' + error);
		});
}
