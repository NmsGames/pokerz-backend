require('dotenv').config()
require('./config/db') 
const express = require('express');
const cors    = require('cors');
const app     = express();
const http    = require("http").createServer(app);
const port    = process.env.PORT || 5000
const Log     = require('debug')('server');
const io      = require("socket.io")(http);
const path    = require('path');   
const fileupload = require('express-fileupload')
require("./ServerSocket.js").createSocket(io); 
// import routes

const AuthRoute     = require('./src/routes/AuthRoutes')  
const UserRoutes    = require('./src/routes/UserRoutes')
const GameRoutes    = require('./src/routes/GameRoutes') 
const ReferralRoute = require('./src/routes/ReferralRoute') 
const Tickets = require('./src/routes/Tickets')
// const GameRoutes = require('./src/routes/GameRoutes') 
// const CheckoutRoute = require('./src/paymentroutes/CheckoutRoute')
// const ThankYouRoute = require('./src/ThankYouRoute')
// const TransactionsRoutes = require('./src/routes/TransactionsRoutes')
// const KYCRoutes = require('./src/routes/KYCRoutes')
// const BankRoutes = require('./src/routes/BankRoutes') 
app.set('views' , path.join(__dirname,'views'));
app.set('view engine','ejs');
app.set('view options', {layout: 'layout.ejs'});
app.use(fileupload())
app.use(express.static('public'))
app.use(cors())
app.use(express.urlencoded({extended: false}));
app.use(express.json())
app.use('/auth',AuthRoute)
app.use('/get_referrals_code',ReferralRoute)
app.use('/api/users',UserRoutes)
app.use('/games',GameRoutes)
app.use('/raise_tickets',Tickets)
 
//routes
app.get("/servertesting", (req, res) => {
  res.sendFile(path.join(__dirname + '/public/test/index.html'));
});

 //below will not be hit as server is not on https://
app.post('/notify', (req, res, next)=>{
  console.log("notify hit");
  console.log(req.body);
  return res.status(200).send({
      status: "success",
  })
});
app.get('/',(req, res, next)=>{ 
  return res.status(200).send({status:200,message:'default routes Zynga Pocker'});
});
app.get('/payment',(req, res, next)=>{
  console.log("landing page hit"); 
  return res.status(200).render("index");
});
 
app.use((err, req , res , next)=>{
  console.log("error caught");
  console.log(err);
  res.status(500).send({
      status:"fail",
      err: err.message,
  });
})
 
http.listen(port, () => {
  console.log("Server listening on port =>", port);
})

