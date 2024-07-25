import mongoose from 'mongoose';

const areaModel1 = new mongoose.Schema({
	name: {
		type: String,
		required: true,
		index: true
	},
	password: {
		type: String,
		required: true,
		index: true
	},
	CampaignList: {
		type: Array<typeof mongoose.Schema.ObjectId>(),
		ref: 'Campaign',
		required: true
	},
	AdminPassword: {
		type: String,
		required: true
	},
	adminPhone: {
		type: String,
		required: true,
		minlength: 12,
		maxlength: 13,
		unique: true
	},
	campaignInProgress: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Campaign',
		default: null,
		required: false
	},
	createdAt: {
		type: Date,
		default: Date.now()
	}
});

const callerModel1 = new mongoose.Schema({
	name: {
		type: String,
		required: true,
		index: true,
		unique: false
	},
	phone: {
		type: String,
		required: true,
		unique: true,
		minlength: 12,
		maxlength: 13
	},
	pinCode: {
		type: String,
		required: true,
		length: 4
	},
	timeInCall: {
		required: true,
		type: [
			{
				date: { type: Date, require: true },
				client: { type: mongoose.Schema.ObjectId, ref: 'Client', required: true },
				time: { type: Number, required: true },
				campaign: { type: mongoose.Schema.ObjectId, ref: 'Campaign', required: true }
			}
		]
	},
	currentCall: {
		campaign: {
			type: mongoose.Schema.ObjectId,
			ref: 'Campaign',
			required: false
		},
		client: {
			type: mongoose.Schema.ObjectId,
			ref: 'Client',
			required: false
		}
	},
	area: {
		type: mongoose.Schema.ObjectId,
		ref: 'Area',
		required: true
	},
	campaigns: {
		type: [mongoose.Schema.ObjectId],
		ref: 'Campaign',
		required: true,
		default: []
	},
	createdAt: {
		type: Date,
		default: Date.now()
	}
});

const campaignModel1 = new mongoose.Schema({
	name: {
		type: String,
		required: true,
		index: true
	},
	script: {
		type: Array<String>(),
		required: true
	},
	active: {
		type: Boolean,
		required: true,
		default: false
	},
	area: {
		type: mongoose.Schema.ObjectId,
		ref: 'Area',
		required: true,
		index: true
	},
	createdAt: {
		type: Date,
		default: Date.now()
	},
	trashUser: {
		type: [mongoose.Schema.Types.ObjectId],
		ref: 'Client',
		required: true
	},
	password: {
		type: String,
		required: true
	},
	//personalisation
	nbMaxCallCampaign: {
		type: Number,
		required: true,
		default: 4
	},
	timeBetweenCall: {
		type: Number,
		required: true,
		default: 10_800_000
	},
	callHoursStart: {
		type: Date,
		required: true,
		default: new Date(0)
	},
	callHoursEnd: {
		type: Date,
		required: true,
		default: new Date(0)
	}
});

const clientModel1 = new mongoose.Schema({
	name: {
		type: String,
		index: 'text',
		required: false
	},
	institution: {
		type: String,
		required: false
	},
	promotion: {
		type: String,
		required: false
	},
	phone: {
		type: String,
		required: true,
		unique: true,
		minlength: 12,
		maxlength: 13
	},
	data: {
		required: true,
		type: Map,
		of: [
			{
				status: {
					type: String,
					enum: ['called', 'not called', 'not answered', 'inprogress'],
					required: true
				},
				caller: {
					type: mongoose.Schema.ObjectId,
					ref: 'Caller',
					required: false
				},
				scriptVersion: {
					type: Number,
					required: false
				},
				startCall: {
					type: Date,
					required: false
				},
				endCall: {
					type: Date,
					required: false
				},
				satisfaction: {
					type: Number,
					min: -2,
					max: 2,
					required: false
				},
				comment: {
					type: String,
					required: false
				}
			}
		]
	},
	area: {
		type: mongoose.Schema.ObjectId,
		ref: 'Area',
		required: true
	},
	createdAt: {
		type: Date,
		default: Date.now()
	}
});

export { areaModel1, callerModel1, campaignModel1, clientModel1 };
