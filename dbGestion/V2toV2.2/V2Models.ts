import mongoose from 'mongoose';

const callModel2 = new mongoose.Schema({
	client: {
		type: mongoose.Schema.ObjectId,
		ref: 'client',
		required: true
	},
	caller: {
		type: mongoose.Schema.ObjectId,
		ref: 'caller',
		required: true
	},
	campaign: {
		type: mongoose.Schema.ObjectId,
		ref: 'campaign',
		required: true
	},
	satisfaction: {
		type: Number,
		required: false,
		//[voted, not interested, interested, not answered, removed]
		enum: [0, 1, 2, 3, 4]
	},
	comment: {
		type: String,
		required: false
	},
	status: {
		type: String,
		required: true,
		enum: ['In progress', 'to recall', 'Done', 'deleted']
	},
	start: {
		type: Date,
		default: Date.now()
	},
	duration: {
		type: Number,
		required: false
	},
	lastInteraction: {
		type: Date,
		default: Date.now()
	}
});

const campaignModel2 = new mongoose.Schema({
	name: {
		type: String,
		required: true,
		index: true
	},
	script: {
		type: String,
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
	},
	callPermited: {
		type: Boolean,
		require: true,
		default: true
	}
});

const clientModel2 = new mongoose.Schema({
	name: {
		type: String,
		index: 'text',
		required: false
	},
	firstname: {
		type: String,
		index: 'text',
		require: false
	},
	institution: {
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

export { callModel2, campaignModel2, clientModel2 };
