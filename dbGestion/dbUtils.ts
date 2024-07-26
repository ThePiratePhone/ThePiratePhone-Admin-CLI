import chalk from 'chalk';
import mongoose from 'mongoose';
import { log } from '../utils';
import { AreaModel, CallerModel, CallModel, CampaignModel, ClientModel } from '../Models';
import { confirm, number } from '@inquirer/prompts';

async function destrucDb() {
	const answer = await confirm({
		message: 'Are you want to ' + chalk.red('delete') + ' database ?',
		default: false
	});
	if (answer) {
		let time = Date.now();
		log('connecting to database...', 'log');
		const connection = mongoose.createConnection(process.env.defaultURI ?? '');
		log(`connected in ${Date.now() - time}ms`, 'info');
		log('registering models...', 'log');
		time = Date.now();
		const area = connection.model('Area', AreaModel);
		const call = connection.model('Call', CallModel);
		const caller = connection.model('Caller', CallerModel);
		const campaign = connection.model('Campaign', CampaignModel);
		const client = connection.model('Client', ClientModel);
		log(`models registered in ${Date.now() - time}ms`, 'info');
		time = Date.now();
		log('deleting data...', 'log');
		await area.deleteMany({});
		await call.deleteMany({});
		await caller.deleteMany({});
		await campaign.deleteMany({});
		await client.deleteMany({});
		log(`data ${chalk.red('deleted')} in ${Date.now() - time}ms`, 'info');
	}
}

/**
 * print limit first area in a beatiful table.
 * @param connection {mongoose.Connection}
 * @param limit number of area print
 * @param printPassword {bolean} chose if print the adminPassword
 * @default printPassword false
 * @default limit 10
 */
async function printArea(connection: mongoose.Connection, limit: number = 10, printPassword: boolean = false) {
	const area = connection.model('Area', AreaModel);
	const areas = await area.find().limit(limit);
	if (areas.length == 0) {
		log('No area found', 'info');
		return;
	}

	const names = areas.map(area => area.name);
	names.unshift('Names');

	const passwords = areas.map(area => area.password);
	passwords.unshift('Passwords');

	let adminPasswords: Array<string> = [];
	if (printPassword) {
		adminPasswords = areas.map(area => area.adminPassword);
		adminPasswords.unshift('Admin passwords');
	}

	//calcul size
	let maxNameLength = Math.max(...names.map(name => name.length));
	let maxPasswordLength = Math.max(...passwords.map(password => password.length));
	let maxAdminPasswordLength = Math.max(...adminPasswords.map(adminPasswords => adminPasswords.length));

	//print
	printHeader(
		[maxNameLength, maxPasswordLength, maxAdminPasswordLength],
		[names.shift() ?? 'error', passwords.shift() ?? 'error', adminPasswords.shift() ?? 'error']
	);
	printRow([maxNameLength, maxPasswordLength, maxAdminPasswordLength], [names, passwords, adminPasswords]);
	if (limit < (await area.countDocuments())) {
		console.log(chalk.red(`*${limit} firsts ellements were displayed`));
	}
}

/**
 * print first ligne for a table, add one space before and after each value
 * @param valueMaxLenght {same length of values} array of max length of each value
 * @param values {same length of valueMaxLenght} array of name for each column
 */
function printHeader(valueMaxLenght: Array<number>, values: Array<string>) {
	let header: String = '╔';
	//if array is empty maths max return -Infinity
	if (valueMaxLenght.length != values.length) {
		throw new Error('valueMaxLenght and values must have the same length');
	}

	//if array is empty maths max return -Infinity
	valueMaxLenght.forEach((el, i) => {
		if (el == 0 || el == -Infinity) {
			valueMaxLenght.splice(i);
			values.splice(i);
		}
	});

	for (let i = 0; i < valueMaxLenght.length; i++) {
		header += '═'.repeat(valueMaxLenght[i] + 2);

		if (i < valueMaxLenght.length - 1) {
			header += '╦';
		}
	}
	header += '╗';
	//print first ligne
	console.log(header);

	header = '║';
	for (let i = 0; i < valueMaxLenght.length; i++) {
		let space = (valueMaxLenght[i] + 2 - values[i].length) / 2;

		header += ' '.repeat(space);
		header += Number.isInteger(space) ? chalk.blueBright(values[i]) : ' ' + chalk.blueBright(values[i]);
		header += ' '.repeat(space);
		header += '║';
	}
	//print value L1
	console.log(header);
	header = '╠';
	for (let i = 0; i < valueMaxLenght.length; i++) {
		header += '═'.repeat(valueMaxLenght[i] + 2);
		if (i < valueMaxLenght.length - 1) {
			header += '╬';
		}
	}
	header += '╣';
	//print L3
	console.log(header);
}

/**
 * print content of a table, add one space before and after each value
 * @param valueMaxLenght {same length of values} array of max length of each value
 * @param values {same length of valueMaxLenght} array of value on each colume: [["val1 column1", "V2C1"],["V1C2"...]]
 */
function printRow(valueMaxLenght: Array<number>, values: Array<Array<string>>) {
	if (valueMaxLenght.length != values.length) {
		throw new Error('valueMaxLenght and values must have the same length');
	}

	//if array is empty maths max return -Infinity
	valueMaxLenght.forEach((el, i) => {
		if (el == 0 || el == -Infinity) {
			valueMaxLenght.splice(i);
			values.splice(i);
		}
	});

	for (let i = 0; i < values[0].length; i++) {
		let row = '║';
		for (let j = 0; j < values.length; j++) {
			let space = (valueMaxLenght[j] + 2 - values[j][i].length) / 2;
			row += ' '.repeat(space);
			row += Number.isInteger(space) ? values[j][i] : ' ' + values[j][i];
			row += ' '.repeat(space);
			row += '║';
		}
		console.log(row);
		if (i < values[0].length - 1) {
			row = '╟';
			for (let j = 0; j < values.length; j++) {
				row += '─'.repeat(valueMaxLenght[j] + 2);
				if (j < values.length - 1) {
					row += '╫';
				} else {
					row += '╢';
				}
			}
		} else {
			row = '╚';
			for (let j = 0; j < values.length; j++) {
				row += '═'.repeat(valueMaxLenght[j] + 2);
				if (j < values.length - 1) {
					row += '╩';
				} else {
					row += '╝';
				}
			}
		}
		console.log(row);
	}
}
export { destrucDb, printArea };
