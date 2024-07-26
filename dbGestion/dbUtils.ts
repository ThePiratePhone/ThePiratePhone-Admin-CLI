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

	const names = areas.map(area => area.name);
	names.unshift('Name');

	const passwords = areas.map(area => area.password);
	passwords.unshift('Password');

	let adminPasswords: Array<string> = [];
	if (printPassword) {
		adminPasswords = areas.map(area => area.adminPassword);
		adminPasswords.unshift('Admin password');
	}

	//calcul size
	const maxNameLength = Math.max(...names.map(name => name.length)),
		maxPasswordLength = Math.max(...passwords.map(password => password.length)),
		maxAdminPasswordLength = Math.max(...adminPasswords.map(adminPasswords => adminPasswords.length));

	//print
	printHeader(
		[maxNameLength, maxPasswordLength, maxAdminPasswordLength],
		[names.shift() ?? 'error', passwords.shift() ?? 'error', adminPasswords.shift() ?? 'error'],
		IColor,
		lColor
	);
	printRow(
		[maxNameLength, maxPasswordLength, maxAdminPasswordLength],
		[names, passwords, adminPasswords],
		tColor,
		lColor
	);
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
	printPassword: boolean = false,
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

	const maxNameLength = Math.max(...names.map(name => name.length)),
		maxScriptLength = Math.max(...scripts.map(script => script.length)),
		maxActiveLength = Math.max(...actives.map(active => active.length)),
		maxAreaLength = Math.max(...areas.map(area => area.length)),
		maxPasswordLength = Math.max(...passwords.map(password => password.length)),
		maxNbMaxCallCampaignLength = Math.max(...nbMaxCallCampaign.map(nbMaxCallCampaign => nbMaxCallCampaign.length)),
		maxTimeBetweenCallsLength = Math.max(...timeBetweenCalls.map(timeBetweenCalls => timeBetweenCalls.length)),
		maxCallHoursStartsLength = Math.max(...callHoursStarts.map(callHoursStarts => callHoursStarts.length)),
		maxCallHoursEndsLength = Math.max(...callHoursEnds.map(callHoursEnds => callHoursEnds.length)),
		maxCallPermitedsLength = Math.max(...callPermiteds.map(callPermiteds => callPermiteds.length));

	//print
	printHeader(
		[
			maxNameLength,
			maxScriptLength,
			maxActiveLength,
			maxAreaLength,
			maxPasswordLength,
			maxNbMaxCallCampaignLength,
			maxTimeBetweenCallsLength,
			maxCallHoursStartsLength,
			maxCallHoursEndsLength,
			maxCallPermitedsLength
		],
		[
			names.shift() ?? 'error',
			scripts.shift() ?? 'error',
			actives.shift() ?? 'error',
			areas.shift() ?? 'error',
			passwords.shift() ?? 'error',
			nbMaxCallCampaign.shift() ?? 'error',
			timeBetweenCalls.shift() ?? 'error',
			callHoursStarts.shift() ?? 'error',
			callHoursEnds.shift() ?? 'error',
			callPermiteds.shift() ?? 'error'
		],
		IColor,
		lColor
	);
	printRow(
		[
			maxNameLength,
			maxScriptLength,
			maxActiveLength,
			maxAreaLength,
			maxPasswordLength,
			maxNbMaxCallCampaignLength,
			maxTimeBetweenCallsLength,
			maxCallHoursStartsLength,
			maxCallHoursEndsLength,
			maxCallPermitedsLength
		],
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
		tColor,
		lColor
	);
	if (limit < (await campaign.countDocuments())) {
		console.log(chalk.red(`*${limit} firsts ellements were displayed`));
	}
}

function printTab(
	valueMaxLenght: Array<number>,
	values: Array<Array<string>>,
	IColor: Function = chalk.blueBright,
	tColor: Function = chalk.greenBright,
	lColor: Function = chalk.gray
) {
	printHeader(
		valueMaxLenght,
		values.map(el => el.shift() ?? 'error'),
		IColor,
		lColor
	);
	printRow(valueMaxLenght, values, tColor, lColor);
}

/**
 * print first ligne for a table, add one space before and after each value
 * @param valueMaxLenght {same length of values} array of max length of each value
 * @param values {same length of valueMaxLenght} array of name for each column
 */
function printHeader(valueMaxLenght: Array<number>, values: Array<string>, Icol: Function, lCol: Function) {
	let header: String = lCol('╔');
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
	console.log(lCol(header));

	header = lCol('║');
	for (let i = 0; i < valueMaxLenght.length; i++) {
		let space = (valueMaxLenght[i] + 2 - values[i].length) / 2;

		header += ' '.repeat(space);
		header += Icol(Number.isInteger(space) ? values[i] : ' ' + values[i]);
		header += ' '.repeat(space);
		header += lCol('║');
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
	console.log(lCol(header));
}

/**
 * print content of a table, add one space before and after each value
 * @param valueMaxLenght {same length of values} array of max length of each value
 * @param values {same length of valueMaxLenght} array of value on each colume: [["val1 column1", "V2C1"],["V1C2"...]]
 */
function printRow(valueMaxLenght: Array<number>, values: Array<Array<string>>, tCol: Function, lCol: Function) {
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
		let row = lCol('║');
		for (let j = 0; j < values.length; j++) {
			let space = (valueMaxLenght[j] + 2 - values[j][i].length) / 2;
			row += ' '.repeat(space);
			row += tCol(Number.isInteger(space) ? values[j][i] : ' ' + values[j][i]);
			row += ' '.repeat(space);
			row += lCol('║');
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
		console.log(lCol(row));
	}
}
export { destrucDb, printArea, printCampaign };
