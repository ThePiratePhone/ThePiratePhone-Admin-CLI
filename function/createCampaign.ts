import inquirer from 'inquirer';
import axios from 'axios';
import DatePrompt from 'inquirer-date-prompt';
export default async function createCampaign() {
	inquirer.registerPrompt('date', DatePrompt as any);
	let corect = false;
	let name: string,
		script: string,
		dateStart: string,
		dateEnd: string,
		adminCode: string,
		password: string,
		areaId: string;
	do {
		const answer = await inquirer.prompt([
			{
				name: 'name',
				message: 'what is the name of the campaign ?',
				type: 'input'
			},
			{
				name: 'script',
				message: 'what is the script of the campaign ?',
				type: 'input'
			},
			{
				name: 'dateStart',
				message: 'what is the start date of the campaign ?',
				type: 'date',
				locale: 'fr-FR'
			},
			{
				name: 'dateEnd',
				message: 'what is the end date of the campaign ?',
				type: 'date',
				locale: 'fr-FR'
			},
			{
				name: 'password',
				message: 'what is the password for joign the campaign ?',
				type: 'input'
			},
			{
				name: 'areaId',
				message: 'what is the id of the area ?',
				type: 'input'
			},
			{
				name: 'adminCode',
				message: 'what is the admin code of the area ?',
				type: 'password'
			}
		]);
		name = answer.name;
		script = answer.script;
		dateStart = answer.dateStart;
		dateEnd = answer.dateEnd;
		password = answer.password;
		adminCode = answer.adminCode;
		areaId = answer.areaId;

		console.log('recapitulatif:');
		console.log('name: ' + name);
		console.log('script: ' + script);
		console.log('dateStart: ' + dateStart);
		console.log('dateEnd: ' + dateEnd);
		console.log('areaId: ' + areaId);
		const answer2 = await inquirer.prompt({
			name: 'correct',
			message: 'Is it correct ?',
			type: 'confirm'
		});
		corect = answer2.correct;
	} while (!corect);

	try {
		const res = axios.post('http://127.0.0.1:7000/api/admin/createCampaign', {
			name: name,
			script: script,
			dateStart: dateStart,
			dateEnd: dateEnd,
			adminCode: adminCode,
			password: password,
			area: areaId
		});

		if ((await res).status != 200) {
			console.log('error while creating the campaign' + (await res).status);
		}
	} catch (e) {
		console.log('error while creating the campaign' + e);
	}
}
