const express = require('express')
const app = express()
const route = require('./routes/route')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

mongoose.connect('mongodb+srv://Lalit:g1b1eD2zYIwUl67Z@cluster0.xmtgwuj.mongodb.net/Lalit-Db', {
    useNewUrlParser: true
})
    .then(() => console.log("MongoDb is connected"))
    .catch(err => console.log(err))

app.use('/', route)

app.listen(process.env.PORT || 5000, function () {
    console.log('Express app running on PORT', process.env.PORT || 5000)
})