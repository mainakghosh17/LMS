const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book' },
    movie: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie' },
    issue_date: { type: Date, default: Date.now },
    return_date: { type: Date },
    status: { type: String, enum: ['issued', 'returned'], default: 'issued' }
});

module.exports = mongoose.model('Transaction', transactionSchema);