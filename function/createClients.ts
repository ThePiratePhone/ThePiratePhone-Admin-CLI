import axios from 'axios';
import inquirer from 'inquirer';

async function createClients() {
	const answer = await inquirer.prompt({
		name: 'number',
		message: 'How many clients you want to create?',
		type: 'number'
	});

	const adminCode = await inquirer.prompt({
		name: 'adminCode',
		message: 'What is the admin code?',
		type: 'password'
	});

	const areaId = await inquirer.prompt({
		name: 'areaId',
		message: 'What is the area id?',
		type: 'input'
	});

	for (let i = 0; i <= answer.number / 500; i++) {
		const phoneNumbers: Array<[string, string]> = [];
		for (let j = 0; j < 500; j++) {
			let phone = generateRandomPhoneNumber();
			phoneNumbers.push(['client ' + i, '0' + phone.toString()]);
		}
		await axios.post('http://localhost:3000/api/admin/client/createClients'),
			{
				adminCode: adminCode.adminCode,
				areaId: areaId.areaId,
				phoneNumbers: phoneNumbers
			};
	}
}

function generateRandomPhoneNumber() {
	return Math.floor(Math.random() * (9_99_99_99_99 - 1_00_00_00_00)) + 1_00_00_00_00;
}

export default createClients;
