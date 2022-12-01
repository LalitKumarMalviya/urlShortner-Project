const urlModel = require('../model/urlModel')
const validUrl = require('valid-url')
const shortId = require('shortid')

const baseUrl = 'localhost:5000'

const urlShortner = async function (req, res) {
    try {
        let data = req.body
        let url = req.body.longUrl

        if (Object.keys(data).length === 0 || !url || typeof url != 'string') {
            return res.status(400).send({ status: false, message: 'Please provide url!' })
        }

        url = url.trim()

        if (!validUrl.isWebUri(url)) {
            return res.status(400).send({ status: false, message: 'Input Url is Invalid!' })
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

        let savedData1 = await urlModel.findById(savedData._id).select({ _id: 0, __v: 0 })

        return res.status(201).send({ status: true, data: savedData1 })
    }

    catch (err) {
        return res.status(500).send({ status: false, error: err.message })
    }
}


const redirect = async function (req, res) {
    try {
        let urlCode = req.params.urlCode

        let urlData = await urlModel.findOne({ urlCode: urlCode })
        if (!urlData) {
            return res.status(404).send({ status: false, message: 'Url Not Found!' })
        }

        let longUrl = urlData.longUrl

        return res.redirect(302, longUrl)
    }

    catch (err) {
        return res.status(500).send({ status: false, error: err.message })
    }
}

module.exports.urlShortner = urlShortner
module.exports.redirect = redirect