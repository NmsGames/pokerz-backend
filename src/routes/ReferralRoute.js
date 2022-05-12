const router = require('express').Router()
// import auth controller
const ReferralController = require('../controllers/ReferralController')
 
//import validation
// const check = require('../validation/CheckValidation')
// router.post('/getProfile',UsersController.getProfiles)
// router.get('/',UsersController.getUsers)
// router.post('/profileUpload',UsersController.uploadProfilePic)
router.get('/:id',ReferralController.retrievePromoCode)

router.get("/test", (req, res) => {
    res.send('sdfdfdfd')
  });
module.exports = router