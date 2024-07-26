import { confirm, input, number, select } from '@inquirer/prompts';
import chalk from 'chalk';
import mongoose from 'mongoose';
import { CampaignModel, ClientModel } from '../Models';
import { end, generateRandomPhoneNumber, log } from '../utils';
import { printCampaign, printTab } from './dbUtils';

export default async function createClient() {
	const random = await confirm({
		message: 'Are you want to create ' + chalk.blueBright('random') + ' users ?',
		default: true
	});
	if (random) {
		const many = await confirm({
			message: 'Are you want to create ' + chalk.blueBright('many') + ' users ?',
			default: true
		});
		if (many) await createManyRandomClients();
		else await createRandomClient();
	} else {
		await createCustomClient();
	}
}

async function createCustomClient() {
	let corect = false,
		name = '',
		firstname = '',
		institution = '',
		phone = '',
		mCampaign = '',
		time = Date.now();

	log('connecting to database...', 'log');
	const connection = mongoose.createConnection(process.env.defaultURI ?? '');
	log(`connected in ${Date.now() - time}ms`, 'info');
	log('registering models...', 'log');
	time = Date.now();
	const client = connection.model('Client', ClientModel),
		campaign = connection.model('Campaign', CampaignModel);
	log(`models registered in ${Date.now() - time}ms`, 'info');

	do {
		name = await input({ message: `what is the ${chalk.blueBright('name')} of the new client ?` });
		firstname = await input({ message: `what is the ${chalk.blueBright('firstname')} of the new client ?` });
		institution = await input({ message: `what is the ${chalk.blueBright('institution')} of the new client ?` });
		phone = await input({ message: `what is the ${chalk.blueBright('phone')} of the new client ?` });
		await printCampaign(connection);
		const campaigns = await campaign.find({}, ['_id', 'name']).sort({ name: 1 });
		const campaignChoices = campaigns.map((campaign: any) => {
			return {
				name: campaign.name,
				value: campaign._id.toString()
			};
		});
		mCampaign = await select({
			message: `what is the ${chalk.blueBright('campaign')} of the new client ?`,
			choices: campaignChoices
		});

		console.log('recapitulatif:');
		printTab([
			['name', name],
			['firstname', firstname],
			['institution', institution],
			['phone', phone],
			['campaign', mCampaign]
		]);

		corect = await confirm({
			message: 'Is it correct ?',
			default: true
		});
	} while (!corect);
	log('creating client...', 'log');
	time = Date.now();
	const newClient = new client({
		name: name,
		firstname: firstname,
		institution: institution,
		phone: phone,
		campaigns: [mCampaign]
	});
	try {
		await newClient.save();
		log(`client created in ${Date.now() - time}ms`, 'info');
	} catch (error: any) {
		log(error, 'error');
	}
	end();
}

async function createManyRandomClients() {
	let corect = false,
		mCampaign = '',
		time = Date.now();
	log('connecting to database...', 'log');
	const connection = mongoose.createConnection(process.env.defaultURI ?? ''),
		clients = [],
		client = connection.model('Client', ClientModel),
		campaign = connection.model('Campaign', CampaignModel);
	log(`connected in ${Date.now() - time}ms`, 'info');
	log('registering models...', 'log');
	time = Date.now();
	log(`models registered in ${Date.now() - time}ms`, 'info');
	do {
		const nb = (await number({ message: 'how many client do you want to create ?', default: 10 })) ?? 10;

		await printCampaign(connection);
		const campaigns = await campaign.find({}, ['_id', 'name']).sort({ name: 1 });
		const campaignChoices = campaigns.map((campaign: any) => {
			return {
				name: campaign.name,
				value: campaign._id.toString()
			};
		});
		mCampaign = await select({
			message: `what is the ${chalk.blueBright('campaign')} of the new client ?`,
			choices: campaignChoices
		});
		const phoneNumbers: Array<String> = [];
		for (let i = 0; i < nb; i++) {
			let newPhone;
			do {
				newPhone = generateRandomPhoneNumber();
			} while (phoneNumbers.includes(newPhone));
			phoneNumbers.push(newPhone);
			const newClient = new client({
				name: 'clients',
				firstname: i,
				phone: newPhone,
				campaigns: [mCampaign]
			});
			clients.push(newClient);
		}
		console.log('recapitulatif:');
		printTab([
			['name', ...clients.map(client => client.name ?? '')],
			['firstname', ...clients.map(client => client.firstname ?? '')],
			['phone', ...clients.map(client => client.phone)],
			['campaign', ...clients.map(client => client.campaigns[0].toString())]
		]);
		corect = await confirm({
			message: 'Is it correct ?',
			default: true
		});
	} while (!corect);
	log('creating client...', 'log');
	time = Date.now();
	try {
		await client.insertMany(clients);
		log(`client created in ${Date.now() - time}ms`, 'info');
	} catch (error: any) {
		log(error, 'error');
	}
	end();
}
async function createRandomClient() {
	let corect = false,
		name = '',
		firstname = '',
		institution = '',
		phone = '',
		mCampaign = '',
		time = Date.now();

	log('connecting to database...', 'log');
	const connection = mongoose.createConnection(process.env.defaultURI ?? '');
	log(`connected in ${Date.now() - time}ms`, 'info');
	log('registering models...', 'log');
	time = Date.now();
	const client = connection.model('Client', ClientModel),
		campaign = connection.model('Campaign', CampaignModel);
	log(`models registered in ${Date.now() - time}ms`, 'info');

	do {
		name = 'clients';
		firstname = 'random';
		institution = 'random';
		phone = generateRandomPhoneNumber();
		await printCampaign(connection);
		const campaigns = await campaign.find({}, ['_id', 'name']).sort({ name: 1 });
		const campaignChoices = campaigns.map((campaign: any) => {
			return {
				name: campaign.name,
				value: campaign._id.toString()
			};
		});
		mCampaign = await select({
			message: `what is the ${chalk.blueBright('campaign')} of the new client ?`,
			choices: campaignChoices
		});

		console.log('recapitulatif:');
		printTab([
			['name', name],
			['firstname', firstname],
			['institution', institution],
			['phone', phone],
			['campaign', mCampaign]
		]);

		corect = await confirm({
			message: 'Is it correct ?',
			default: true
		});
	} while (!corect);
	log('creating client...', 'log');
	time = Date.now();
	const newClient = new client({
		name: name,
		firstname: firstname,
		institution: institution,
		phone: phone,
		campaigns: [mCampaign]
	});
	try {
		await newClient.save();
		log(`client created in ${Date.now() - time}ms`, 'info');
	} catch (error: any) {
		log(error, 'error');
	}
	end();
}
