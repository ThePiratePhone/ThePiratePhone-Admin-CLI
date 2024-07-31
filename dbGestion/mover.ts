import { confirm, input } from '@inquirer/prompts';
import chalk from 'chalk';
import mongoose from 'mongoose';
import { AreaModel, CallerModel, CallModel, CampaignModel, ClientModel } from '../Models';
import { end } from '../utils';

/**
 * this function is used to move data from one database to another.
 */
export default async function moveData() {
	let moved = 0,
		total = 0,
		startDate = Date.now();

	const answer = await confirm({
		message: `Warning: this action will ${chalk.redBright(
			'remove all data'
		)} from the destination database. Are you sure you want to continue?`,
		default: false
	});
	if (!answer) end();
	const URI1 = await input({ message: 'Enter the URI of the origine database:' }),
		URI2 = await input({ message: 'Enter the URI of the destination database:' });

	startDate = Date.now();
	//create connections
	const connection1 = mongoose.createConnection(URI1),
		connection2 = mongoose.createConnection(URI2);
	console.log(`connected in ${Date.now() - startDate}ms`);
	//create models
	console.log('registering models...');
	startDate = Date.now();
	const Area = connection1.model('Area', AreaModel),
		Call = connection1.model('Call', CallModel),
		Caller = connection1.model('Caller', CallerModel),
		Campaign = connection1.model('Campaign', CampaignModel),
		Client = connection1.model('Client', ClientModel),
		Area2 = connection2.model('Area', AreaModel),
		Call2 = connection2.model('Call', CallModel),
		Caller2 = connection2.model('Caller', CallerModel),
		Campaign2 = connection2.model('Campaign', CampaignModel),
		Client2 = connection2.model('Client', ClientModel);
	console.log(`models registered in ${Date.now() - startDate}ms`);
	//delete data
	console.log('deleting data...');
	startDate = Date.now();
	await Area2.deleteMany({});
	await Call2.deleteMany({});
	await Caller2.deleteMany({});
	await Campaign2.deleteMany({});
	await Client2.deleteMany({});
	console.log(`data deleted in ${Date.now() - startDate}ms`);
	//move data
	console.log('moving data...');
	startDate = Date.now();
	await Area.find()
		.cursor()
		.eachAsync(async (area: InstanceType<typeof Area>) => {
			total++;
			const MArea = new Area2({
				name: area.name,
				password: area.password,
				campaignList: area.campaignList,
				adminPassword: area.adminPassword,
				createdAt: area.createdAt
			});
			try {
				moved++;
				await MArea.save();
			} catch (error: any) {
				console.log(error);
			}
		});
	console.log(`${moved}/${total} areas moved in ${Date.now() - startDate}ms`);
	moved = 0;
	total = 0;
	await Call.find()
		.cursor()
		.eachAsync(async (call: InstanceType<typeof Call>) => {
			total++;
			const MCall = new Call2({
				client: call.client,
				caller: call.caller,
				campaign: call.campaign,
				satisfaction: call.satisfaction,
				comment: call.comment,
				status: call.status,
				start: call.start,
				duration: call.duration,
				lastInteraction: call.lastInteraction
			});
			try {
				moved++;
				await MCall.save();
			} catch (error: any) {
				console.log(error);
			}
		});
	console.log(`${moved}/${total} calls moved in ${Date.now() - startDate}ms`);
	moved = 0;
	total = 0;
	await Caller.find()
		.cursor()
		.eachAsync(async (caller: InstanceType<typeof Caller>) => {
			total++;
			const MCaller = new Caller2({
				name: caller.name,
				phone: caller.phone,
				pinCode: caller.pinCode,
				campaigns: caller.campaigns,
				area: caller.area,
				createdAt: caller.createdAt
			});
			try {
				moved++;
				await MCaller.save();
			} catch (error: any) {
				console.log(error);
			}
		});
	console.log(`${moved}/${total} callers moved in ${Date.now() - startDate}ms`);
	moved = 0;
	total = 0;
	await Campaign.find()
		.cursor()
		.eachAsync(async (campaign: InstanceType<typeof Campaign>) => {
			total++;
			const MCampaign = new Campaign2({
				name: campaign.name,
				script: campaign.script,
				active: campaign.active,
				area: campaign.area,
				createdAt: campaign.createdAt,
				password: campaign.password,
				nbMaxCallCampaign: campaign.nbMaxCallCampaign,
				timeBetweenCall: campaign.timeBetweenCall,
				callHoursStart: campaign.callHoursStart,
				callHoursEnd: campaign.callHoursEnd,
				callPermited: campaign.callPermited,
				status: campaign.status
			});
			try {
				moved++;
				await MCampaign.save();
			} catch (error: any) {
				console.log(error);
			}
		});
	console.log(`${moved}/${total} campaigns moved in ${Date.now() - startDate}ms`);
	moved = 0;
	total = 0;
	await Client.find()
		.cursor()
		.eachAsync(async (client: InstanceType<typeof Client>) => {
			total++;
			const MClient = new Client2({
				name: client.name,
				firstname: client.firstname,
				institution: client.institution,
				phone: client.phone,
				campaigns: client.campaigns,
				createdAt: client.createdAt,
				delete: client.delete
			});
			try {
				moved++;
				await MClient.save();
			} catch (error: any) {
				console.log(error);
			}
		});
	console.log(`${moved}/${total} clients moved in ${Date.now() - startDate}ms`);

	end();
}
