import { input, select } from '@inquirer/prompts';
import chalk from 'chalk';
import mongoose, { ObjectId, Types } from 'mongoose';
import home from '../../index';
import { end, log } from '../../utils';
import { destrucDb } from '../dbUtils';
import convert2to2_2 from '../V2toV2.2/converter';
import { areaModel1, callerModel1, campaignModel1, clientModel1 } from './V1Models';
import { areaModel2, callerModel2, callModel2, campaignModel2, clientModel2 } from './V2Models';

export default async function converter() {
	const answer = await select({
		message: 'you want to convert the database of ?',
		choices: [
			{
				name: '1 to 2',
				value: '1to2'
			},
			{
				name: '2.0 to 2.2',
				value: '2to2.2'
			},
			{
				name: chalk.greenBright('home'),
				value: 'home'
			},
			{
				name: chalk.redBright('Exit'),
				value: 'exit'
			}
		]
	});

	switch (answer) {
		case '1to2':
			await convert1to2();
			break;
		case '2to2.2':
			await convert2to2_2();
			break;
		case 'home':
			home();
			break;
		case 'exit':
			process.exit(0);
	}
}
async function convert1to2() {
	const URI1 = await input({ message: 'Enter the URI of the origine database:' });
	const URI2 = await input({ message: 'Enter the URI of the destination database:' });
	//create connections
	const connection1 = mongoose.createConnection(URI1);
	const connection2 = mongoose.createConnection(URI2);
	//create models
	const Area2 = connection2.model('area', areaModel2);
	const Call2 = connection2.model('call', callModel2);
	const Caller2 = connection2.model('caller', callerModel2);
	const Campaign2 = connection2.model('campaign', campaignModel2);
	const Client2 = connection2.model('client', clientModel2);
	const Area1 = connection1.model('Area', areaModel1);
	const Caller1 = connection1.model('Caller', callerModel1);
	const Campaign1 = connection1.model('Campaign', campaignModel1);
	const Client1 = connection1.model('Client', clientModel1);

	await destrucDb();

	let startDate = new Date();
	log('converting areas', 'log');
	let i = 0;
	let updated = 0;
	await Area1.find()
		.cursor()
		.eachAsync(async (area1: InstanceType<typeof Area1>) => {
			const area2 = new Area2({
				_id: area1._id,
				name: area1.name,
				password: area1.password,
				campaignList: area1.CampaignList,
				adminPassword: area1.AdminPassword,
				createdAt: area1.createdAt
			});
			try {
				await area2.save();
				i++;
			} catch (error: any) {
				if (error?.code === 11000) {
					const area2 = await Area2.findById(area1._id);
					const newCampaignList = arrayUnique(
						(Array.from(area2?.campaignList as any) as Array<any>).concat(Array.from(area1.CampaignList))
					);
					try {
						await Area2.updateOne({ _id: area1._id }, { campaignList: newCampaignList });
						updated++;
						i++;
					} catch (error: any) {
						log(error, 'error');

						return;
					}
				}
			}
		});
	log(i + ` areas converted in ${new Date().getTime() - startDate.getTime()}ms(${updated} updated)`);
	startDate = new Date();
	i = 0;
	updated = 0;
	log('converting campaigns', 'log');
	await Campaign1.find()
		.cursor()
		.eachAsync(async (campaign1: InstanceType<typeof Campaign1>) => {
			const campaign2 = new Campaign2({
				_id: campaign1._id,
				name: campaign1.name,
				script: campaign1.script.at(-1),
				active: false,
				area: campaign1.area,
				trashUser: campaign1.trashUser,
				password: campaign1.password,
				nbMaxCallCampaign: campaign1.nbMaxCallCampaign,
				timeBetweenCall: campaign1.timeBetweenCall,
				callHoursStart: campaign1.callHoursStart,
				callHoursEnd: campaign1.callHoursEnd,
				callPermited: true,
				createdAt: campaign1.createdAt
			});
			try {
				await campaign2.save();
				i++;
			} catch (error: any) {
				if (error?.code === 11000) {
					const campaign2 = await Campaign2.findById(campaign1._id);
					const newTrashUser = arrayUnique(
						(Array.from(campaign2?.trashUser as any) as Array<any>).concat(Array.from(campaign1.trashUser))
					);
					try {
						await Campaign2.updateOne({ _id: campaign1._id }, { trashUser: newTrashUser });
						updated++;
						i++;
					} catch (error: any) {
						log(error, 'error');

						return;
					}
				}
			}
		});
	log(i + ` campaigns converted in ${new Date().getTime() - startDate.getTime()}ms(${updated} updated)`);
	startDate = new Date();
	i = 0;
	updated = 0;
	log('converting callers', 'log');
	await Caller1.find()
		.cursor()
		.eachAsync(async (caller1: InstanceType<typeof Caller1>) => {
			const caller2 = new Caller2({
				_id: caller1._id,
				name: caller1.name,
				phone: caller1.phone,
				pinCode: caller1.pinCode,
				area: caller1.area,
				campaigns: caller1.campaigns,
				createdAt: caller1.createdAt
			});
			try {
				await caller2.save();
				i++;
			} catch (error: any) {
				if (error?.code === 11000) {
					const caller2 = await Caller2.findById(caller1._id);
					const newCampaigns = arrayUnique(
						(Array.from(caller2?.campaigns as any) as Array<any>).concat(Array.from(caller1.campaigns))
					);
					try {
						await Caller2.updateOne({ _id: caller1._id }, { campaigns: newCampaigns });
						updated++;
						i++;
					} catch (error: any) {
						log(error, 'error');

						return;
					}
				}
			}
		});
	log(i + ` callers converted in ${new Date().getTime() - startDate.getTime()}ms(${updated} updated)`);
	startDate = new Date();
	i = 0;
	updated = 0;
	let calls = 0;
	log('converting clients and calls', 'log');
	await Client1.find()
		.cursor()
		.eachAsync(async (client1: InstanceType<typeof Client1>) => {
			const name = client1.name?.split(' ')[0];
			const firstname = client1.name?.split(' ').slice(1).join(' ');
			const campaignslist: Array<mongoose.mongo.BSON.ObjectId> = Array.from(client1.data.keys()).map(key => {
				return new Types.ObjectId(key);
			});

			client1.data.forEach(async (value, key) => {
				const data = value[0];
				if (!data || data.status == 'not called' || data.status == 'inprogress') return;
				const call2 = new Call2({
					client: client1._id,
					caller: data.caller,
					campaign: new Types.ObjectId(key),
					status: cleanStatus(data.status, data.satisfaction ?? null),
					satisfaction: cleanSatisfaction(data.satisfaction ?? null),
					start: data.startCall,
					duration: (data?.endCall?.getTime() ?? 0) - (data.startCall?.getTime() ?? 0),
					comment: data.comment
				});
				try {
					await call2.save();
					calls++;
				} catch (error: any) {
					log(error, 'error');
				}
			});
			const client2 = new Client2({
				_id: client1._id,
				name,
				firstname,
				phone: client1.phone,
				promotion: client1.promotion,
				campaigns: campaignslist
			});
			try {
				await client2.save();
				i++;
			} catch (error: any) {
				if (error?.code === 11000) {
					const client2 = await Client2.findById(client1._id);
					const newCampaigns = arrayUnique(
						(Array.from(client2?.campaigns as any) as Array<any>).concat(campaignslist)
					);
					try {
						await Client2.updateOne({ _id: client1._id }, { campaigns: newCampaigns });
						updated++;
						i++;
					} catch (error: any) {
						log(error, 'error');
						return;
					}
				}
			}
		});
	log(i + ` clients converted in ${new Date().getTime() - startDate.getTime()}ms(${updated} updated)`);
	log(calls + ` calls converted`);
	end();
}

function arrayUnique(array: Array<ObjectId>) {
	var a = array.concat();
	for (var i = 0; i < a.length; ++i) {
		for (var j = i + 1; j < a.length; ++j) {
			if (a[i].toString() === a[j].toString()) a.splice(j--, 1);
		}
	}

	return a;
}

function cleanStatus(status: 'called' | 'not answered', satisfaction: number | null) {
	if (status == 'called') return 'Done';
	if (status == 'not answered') return 'to recall';
	if (satisfaction == -2) return 'deleted';
	if (satisfaction == 0) return 'to recall';
	else return 'Done';
}

function cleanSatisfaction(satisfaction: number | null) {
	if (satisfaction == -2) return 4;
	if (satisfaction == -1) 1;
	if (satisfaction == 0) 3;
	if (satisfaction == 1) 1;
	if (satisfaction == 2) 0;
	return 0;
}
