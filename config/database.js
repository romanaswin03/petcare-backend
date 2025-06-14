const mongoose = require('mongoose');

const connectDatabase = () =>{
    console.log(process.env.MONGO_URI);
    mongoose.connect(process.env.MONGO_URI).then(con =>{
        console.log(`MongoDb is connected to the host: ${con.connection.host}`)
    })
}


module.exports = connectDatabase;