import { input } from '@inquirer/prompts';
import mongoose from 'mongoose';
import { end } from '../../utils';
import { destrucDb } from '../dbUtils';
import { CallModel22, CampaignModel22, ClientModel22 } from './V2-2Models';
import { callModel2, campaignModel2, clientModel2 } from './V2Models';

export default async function convert2to2_2() {
	let startDate = Date.now(),
		converted = 0,
		updated = 0;

	const URI1 = await input({ message: 'Enter the URI of the origine database:' }),
		URI2 = await input({ message: 'Enter the URI of the destination database:' });
	//create connections
	startDate = Date.now();
	console.log('connecting to databases...');
	const connection1 = mongoose.createConnection(URI1),
		connection2 = mongoose.createConnection(URI2);
	console.log(`connected in ${Date.now() - startDate}ms`);
	//create models
	console.log('registering models...');
	const call2 = connection1.model('call', callModel2),
		Campaign2 = connection1.model('campaign', campaignModel2),
		Client2 = connection1.model('client', clientModel2),
		Call22 = connection2.model('call', CallModel22),
		Campaign22 = connection2.model('campaign', CampaignModel22),
		Client22 = connection2.model('client', ClientModel22);
	console.log(`models registered in ${Date.now() - startDate}ms`);
	await destrucDb(URI2);

	console.log('converting client');
	startDate = Date.now();
	await Client2.find()
		.cursor()
		.eachAsync(async (client: InstanceType<typeof Client2>) => {
			const MClient = new Client22({
				name: client.name,
				firstname: client.firstname,
				institution: client.institution,
				phone: client.phone,
				campaigns: client.campaigns,
				createdAt: client.createdAt,
				delete: false
			});
			try {
				await MClient.save();
				converted++;
			} catch (error: any) {
				if (error?.code === 11000) {
					updated++;
				} else {
					console.log(error);
				}
			}
		});
	console.log(`${converted} clients converting in ${Date.now() - startDate}ms (${updated} updated)`);
	startDate = Date.now();
	converted = 0;
	updated = 0;
	console.log('converting campaigns');
	await Campaign2.find()
		.cursor()
		.eachAsync(async (campaign: InstanceType<typeof Campaign2>) => {
			const MCampaign = new Campaign22({
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
				status: ['voted', 'not interested', 'interested', 'not answered', 'removed']
			});
			try {
				await MCampaign.save();
				converted++;
			} catch (error: any) {
				if (error?.code === 11000) {
					updated++;
				} else {
					console.log(error);
				}
			}
		});
	console.log(`${converted} campaigns converting in ${Date.now() - startDate}ms (${updated} updated)`);
	startDate = Date.now();
	converted = 0;
	updated = 0;
	console.log('converting calls');
	await call2
		.find()
		.cursor()
		.eachAsync(async (call: InstanceType<typeof call2>) => {
			let satisfaction = 'error';
			switch (call.satisfaction) {
				case 0:
					satisfaction = 'voted';
					break;
				case 1:
					satisfaction = 'not interested';
					break;
				case 2:
					satisfaction = 'interested';
					break;
				case 3:
					satisfaction = 'not answered';
					break;
				case 4:
					satisfaction = 'removed';
					break;
			}
			const MCall = new Call22({
				client: call.client,
				caller: call.caller,
				campaign: call.campaign,
				satisfaction: call.status == 'In progress' ? 'In progress' : satisfaction,
				comment: call.comment,
				createAt: call.start,
				status: call.status == 'to recall' ? true : false,
				delete: satisfaction == 'removed' ? true : false
			});
			try {
				await MCall.save();
				converted++;
			} catch (error: any) {
				if (error?.code === 11000) {
					updated++;
				} else {
					console.log(error);
				}
			}
		});

	console.log(`${converted} calls converting in ${Date.now() - startDate}ms (${updated} updated)`);
	end();
}
