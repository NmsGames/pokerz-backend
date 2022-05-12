const router = require('express').Router()
//Import auth controller
const Games = require('../controllers/GameControllers') 
const GameChallenge = require('../controllers/GameChallenges') 
const Notification = require('../controllers/NotificationController') 
//import validation
const check = require('../validation/CheckValidation')

router.get('/roundTableList',GameChallenge.roundTablesList)
router.get('/challenges',GameChallenge.getChallenges)
router.post('/registerPlayer',Games.gameRegister)

router.get('/recentPlayers/:user_id',GameChallenge.recentPlayers)

router.get('/notification/:user_id',Notification.getNotification)
router.get('/category',Games.getGameCategory)
router.get('/bid_amounts',Games.getGameBidAmounts)
router.get('/:categoryID',Games.getRanksByID)


// router.get('/status/:status',Games.getGamesByStatus)
module.exports = router
 