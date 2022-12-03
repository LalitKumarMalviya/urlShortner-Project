const urlModel = require('../model/urlModel')
const validUrl = require('valid-url')
const shortId = require('shortid')
const redis = require('redis')
const { promisify } = require('util')

const baseUrl = 'localhost:5000'

//-------------------------------{ connection for Redis }----------------------------------//

//1.Connect to redis
const redisClient = redis.createClient(
    11616,   //port
    "redis-11616.c264.ap-south-1-1.ec2.cloud.redislabs.com",  //public endpoint
    { no_ready_check: true }
);
redisClient.auth("TOatNLwfyiUlzrWAIg9XCYa41Slt46bE", function (err) {  //password
    if (err) throw err;
});


redisClient.on("connect", async function () {
    console.log("Connected to Redis...");
});

//2. Use the Commands

const SET_ASYNC = promisify(redisClient.SETEX).bind(redisClient)
const GET_ASYNC = promisify(redisClient.GET).bind(redisClient)


//--------------------------------{ create Short Url }-------------------------------------//

const urlShortner = async function (req, res) {
    try {
        let data = req.body
        let url = req.body.longUrl

        if (Object.keys(data).length === 0 || !url || typeof url != 'string') {
            return res.status(400).send({ status: false, message: 'Please provide url!' })
        }

        url = url.trim()

        if (!validUrl.isWebUri(url)) {
            return res.status(400).send({ status: false, message: 'Url is Invalid!' })
        }

        let checkedUrl = await urlModel.findOne({ longUrl: url }).select({ _id: 0, __v: 0 })

        if (checkedUrl) {
            return res.status(200).send({ status: true, data: checkedUrl })
        }

        let urlCode = shortId.generate(url).toLowerCase()
        let shortUrl = baseUrl + '/' + urlCode

        let savedData = await urlModel.create({
            longUrl: url,
            shortUrl: shortUrl,
            urlCode: urlCode
        })

        //set the data in redis for 1hr...
        await SET_ASYNC(`${urlCode}`, (60 * 60), JSON.stringify(savedData))
        let savedData1 = await urlModel.findById(savedData._id).select({ _id: 0, __v: 0 })

        return res.status(201).send({ status: true, data: savedData1 })
    }

    catch (err) {
        return res.status(500).send({ status: false, error: err.message })
    }
}

//--------------------------{ Redirect Short Url => Main Url }-----------------------------//

const redirect = async function (req, res) {
    try {
        let urlCode = req.params.urlCode

        let cachedData = await GET_ASYNC(`${urlCode}`)

        if (cachedData) {
            let data = JSON.parse(cachedData)
            return res.redirect(302, data.longUrl)

        } else {
            let urlData = await urlModel.findOne({ urlCode: urlCode })
            if (!urlData) {
                return res.status(404).send({ status: false, message: 'Url Not Found!' })
            }

            await SET_ASYNC(`${urlCode}`, (60 * 60), JSON.stringify(urlData))
            let longUrl = urlData.longUrl
            return res.redirect(302, longUrl)
        }
    }

    catch (err) {
        return res.status(500).send({ status: false, error: err.message })
    }
}

module.exports.urlShortner = urlShortner
module.exports.redirect = redirect