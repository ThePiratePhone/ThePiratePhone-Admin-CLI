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
 * @param {function} IColor is color of index
 * @param {function} tColor is color of text
 * @param {function} lColor is color of ligne
 * @default printPassword false
 * @default limit 10
 * @default IColor chalk.blueBright
 * @default tColor chalk.greenBright
 * @default lColor chalk.gray
 */
async function printArea(
	connection: mongoose.Connection,
	printPassword: boolean = false,
	limit: number = 10,
	IColor: Function = chalk.blueBright,
	tColor: Function = chalk.greenBright,
	lColor: Function = chalk.gray
) {
	const area = connection.model('Area', AreaModel),
		areas = await area.find().limit(limit);
	if (areas.length == 0) {
		log('No area found', 'info');
		return;
	}

	const names = areas.map(area => area.name),
		passwords = areas.map(area => area.password),
		adminPasswords = areas.map(area => area.adminPassword);
	names.unshift('Name');
	passwords.unshift('Password');
	adminPasswords.unshift('Admin password');

	//print
	printTab([names, passwords, adminPasswords], IColor, tColor, lColor);
	if (limit < (await area.countDocuments())) {
		console.log(chalk.red(`*${limit} firsts ellements were displayed`));
	}
}
/**
 * print limit first campaign in a beatiful table.
 * @param connection {mongoose.Connection}
 * @param limit number of campaign print
 * @param printPassword {bolean} chose if print the adminPassword
 * @param {function} IColor is color of index
 * @param {function} tColor is color of text
 * @param {function} lColor is color of ligne
 * @default printPassword false
 * @default limit 10
 * @default IColor chalk.blueBright
 * @default tColor chalk.greenBright
 * @default lColor chalk.gray
 */
async function printCampaign(
	connection: mongoose.Connection,
	limit: number = 10,
	IColor: Function = chalk.blueBright,
	tColor: Function = chalk.greenBright,
	lColor: Function = chalk.gray
) {
	const campaign = connection.model('Campaign', CampaignModel),
		area = connection.model('Area', AreaModel),
		campaigns = await campaign.find().limit(limit);
	if (campaigns.length == 0) {
		log('No campaign found', 'info');
		return;
	}

	const names = campaigns.map(campaign => campaign.name);
	names.unshift('Name');
	const scripts = campaigns.map(campaign => campaign.script.substring(0, 3) + '[...]');
	scripts.unshift('Script');
	const actives = campaigns.map(campaign => campaign.active.toString());
	actives.unshift('Active');
	const areas = await Promise.all(
		campaigns.map(async campaign => {
			return (await area.find({ _id: { $eq: campaign.area.toString() } }).limit(1))[0].name;
		})
	);
	areas.unshift('Area');
	const passwords = campaigns.map(campaign => campaign.password);
	passwords.unshift('Password');
	const nbMaxCallCampaign = campaigns.map(campaign => campaign.nbMaxCallCampaign.toString());
	nbMaxCallCampaign.unshift('Max call');
	const timeBetweenCalls = campaigns.map(campaign => campaign.timeBetweenCall.toString());
	timeBetweenCalls.unshift('Betwen call');
	const callHoursStarts = campaigns.map(campaign =>
		campaign.callHoursStart.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
	);
	callHoursStarts.unshift('Call start');
	const callHoursEnds = campaigns.map(campaign =>
		campaign.callHoursStart.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
	);
	callHoursEnds.unshift('Call end');
	const callPermiteds = campaigns.map(campaign => campaign.callPermited.toString());
	callPermiteds.unshift('Call permited');

	//print
	printTab(
		[
			names,
			scripts,
			actives,
			areas,
			passwords,
			nbMaxCallCampaign,
			timeBetweenCalls,
			callHoursStarts,
			callHoursEnds,
			callPermiteds
		],
		IColor,
		tColor,
		lColor
	);

	if (limit < (await campaign.countDocuments())) {
		console.log(chalk.red(`*${limit} firsts ellements were displayed`));
	}
}
/**
 * print content of a table, add one space before and after each value
 * @param values {same length of valueMaxLenght} array of value on each colume: [["val1 column1", "V2C1"],["V1C2"...]]
 * @param {function} IColor is color of index
 * @param {function} tColor is color of text
 * @param {function} lColor is color of ligne
 */
function printTab(
	values: Array<Array<string>>,
	IColor: Function = chalk.blueBright,
	tColor: Function = chalk.greenBright,
	lColor: Function = chalk.gray,
	rightCut: boolean = false,
	leftCut: boolean = false
) {
	const valueMaxLenght = values.map(el => Math.max(...el.map(el => el.length)));

	let tabSize = valueMaxLenght.reduce((acc, el) => acc + el + 3, 4);

	if (tabSize > process.stdout.columns) {
		let secondaryMaxLenght = [],
			secondaryValues = [];

		while (tabSize > process.stdout.columns) {
			secondaryMaxLenght.push(valueMaxLenght.pop() ?? 0);
			secondaryValues.push(values.pop() ?? ['']);
			tabSize = valueMaxLenght.reduce((acc, el) => acc + el + 3, 4);
		}
		printTab(values, IColor, tColor, lColor, true, leftCut);
		printTab(secondaryValues, IColor, tColor, lColor, rightCut, true);
		return;
	}

	printHeader(
		valueMaxLenght,
		values.map(el => el.shift() ?? 'error'),
		IColor,
		lColor,
		rightCut,
		leftCut
	);
	printRow(valueMaxLenght, values, tColor, lColor, rightCut, leftCut);
}

function printHeader(
	valueMaxLenght: Array<number>,
	values: Array<string>,
	Icol: Function,
	lCol: Function,
	rightCut: boolean = false,
	leftCut: boolean = false
) {
	let header: String = leftCut ? '═╦' : '╔';
	//if array is empty maths max return -Infinity
	if (valueMaxLenght.length != values.length) {
		throw new Error('valueMaxLenght and values must have the same length');
	}

	for (let i = 0; i < valueMaxLenght.length; i++) {
		header += '═'.repeat(valueMaxLenght[i] + 2);

		if (i < valueMaxLenght.length - 1) {
			header += '╦';
		}
	}
	header += rightCut ? '╦═' : '╗';
	//print first ligne
	console.log(lCol(header));

	header = lCol(leftCut ? '·║' : '║');
	for (let i = 0; i < valueMaxLenght.length; i++) {
		let space = (valueMaxLenght[i] + 2 - values[i].length) / 2;

		header += ' '.repeat(space);
		header += Icol(Number.isInteger(space) ? values[i] : ' ' + values[i]);
		header += ' '.repeat(space);
		header += lCol(rightCut && i == valueMaxLenght.length - 1 ? '║·' : '║');
	}
	//print value L1
	console.log(header);
	header = leftCut ? '═╬' : '╠';
	for (let i = 0; i < valueMaxLenght.length; i++) {
		header += '═'.repeat(valueMaxLenght[i] + 2);
		if (i < valueMaxLenght.length - 1) {
			header += '╬';
		}
	}
	header += rightCut ? '╬═' : '╣';
	//print L3
	console.log(lCol(header));
}

function printRow(
	valueMaxLenght: Array<number>,
	values: Array<Array<string>>,
	tCol: Function,
	lCol: Function,
	rightCut: boolean = false,
	leftCut: boolean = false
) {
	if (valueMaxLenght.length != values.length) {
		throw new Error('valueMaxLenght and values must have the same length');
	}

	for (let i = 0; i < values[0].length; i++) {
		let row = lCol(leftCut ? '·║' : '║');
		for (let j = 0; j < values.length; j++) {
			let space = (valueMaxLenght[j] + 2 - values[j][i].length) / 2;
			row += ' '.repeat(space);
			row += tCol(Number.isInteger(space) ? values[j][i] : ' ' + values[j][i]);
			row += ' '.repeat(space);
			row += lCol(rightCut && j == valueMaxLenght.length - 1 ? '║·' : '║');
		}
		console.log(row);
		if (i < values[0].length - 1) {
			row = leftCut ? '─╫' : '╟';
			for (let j = 0; j < values.length; j++) {
				row += '─'.repeat(valueMaxLenght[j] + 2);
				if (j < values.length - 1) {
					row += '╫';
				} else {
					row += rightCut ? '╫─' : '╢';
				}
			}
		} else {
			row = leftCut ? '═╩' : '╚';
			for (let j = 0; j < values.length; j++) {
				row += '═'.repeat(valueMaxLenght[j] + 2);
				if (j < values.length - 1) {
					row += '╩';
				} else {
					row += rightCut ? '╩═' : '╝';
				}
			}
		}
		console.log(lCol(row));
	}
}
export { destrucDb, printArea, printCampaign, printTab };
