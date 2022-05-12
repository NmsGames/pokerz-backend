const router = require('express').Router()
//Import auth controller
const Banks = require('../controllers/BankDetailsController') 
//import validation
const check = require('../validation/CheckValidation')

router.get('/',Banks.addUpiId)
router.post('/addBankDetails',check.BankValidator(),Banks.addBankDetails) 
module.exports = router