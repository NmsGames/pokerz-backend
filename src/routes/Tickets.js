const router = require('express').Router()
//Import auth controller
const Tickets = require('../controllers/TicketControllers') 
//import validation
const check = require('../validation/CheckValidation')

router.get('/',Tickets.getRaiseTickets)
router.get('/:ticketId',Tickets.getTicketById)
router.post('/',Tickets.replyTickets)
router.get('/status/:status',Tickets.getTicketsByStatus)
module.exports = router
 