const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const RoomSchema = new Schema({
    name: {type:String, require: true},
    devices: {type: Object},
    user: {type: Schema.Types.ObjectId, ref: 'Users'}
});

module.exports = mongoose.model('Rooms', RoomSchema);