const mongoose = require('mongoose');

const membershipSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    start_date: { type: Date, default: Date.now },
    end_date: { type: Date },
    active: { type: Boolean, default: true }
});

module.exports = mongoose.model('Membership', membershipSchema);