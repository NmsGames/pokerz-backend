const router = require('express').Router()
// import auth controller
const UsersController = require('../controllers/UsersController')
 
//import validation
const check = require('../validation/CheckValidation')
router.post('/getProfile',UsersController.getProfiles)
router.post('/updateProfile',check.updValidator(),UsersController.updateProfile)
// router.get('/',UsersController.getUsers)
// router.post('/profileUpload',UsersController.uploadProfilePic)

// router.get('/:id/avatar',UsersController.retrieveProfilePic)
router.post('/friend_request',check.frientValidator(),UsersController.friendRequest)
router.get('/find',UsersController.searchPlayers)
router.get('/friend_req_notification/:user_id', UsersController.getFriendReqNotify)
router.post('/friend_req_status_update', UsersController.updateFriendReqStatus)

router.get('/friend_list/:user_id', UsersController.getFriendList)

//Update Coins
router.post('/updateWallet',UsersController.updatePoints)
router.get("/test", (req, res) => {
    res.send('sdfdfdfd')
  });
module.exports = router