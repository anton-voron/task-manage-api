const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URL + '/tast-manager-api', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
});



