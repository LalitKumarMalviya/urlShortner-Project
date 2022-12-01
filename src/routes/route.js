const express = require('express')
const router = express.Router()
const urlController = require('../controller/urlController')


//---------------------------{ url apis }----------------------------//

router.post('/url/shorten', urlController.urlShortner)

router.get('/:urlCode', urlController.redirect)

module.exports = router