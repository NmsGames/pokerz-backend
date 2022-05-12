 
const matchmaking   = require('./MatchMaking'); 
const socketEvents  = require("./Utility/Constant").gameplayEvents;
const commonVar     = require("./Utility/Constant").commonVar;
const events  = require("./Utility/Constant").Events;
const sendSocket    = require("./Gameplay/Ludo").GetSocket;
const CreatePrivateRoom = require('./PrivateRoom').CreatePrivateRoom;
const JoinPrivateRoom   = require('./PrivateRoom').JoinPrivateRoom;
const SendConnectionRequest = require('./PawnColourAssigner').SendRequestConnection 
const { TournamentEntry } = require("./services/LudoTournament");
/** Import methods  */
const { getTransactionHistory, withdrawRequest } = require('./src/socket/Transactions')
const { 
  sendOtp,
  userLogin,
  userProfile,
  loggedInUser,
  updateUpiID,
  profileUpdate,
  userForceLogin,
  userEmailVerify,
  myAccountDetails,
  bankDetailsUpdate,
  userPhoneVerify} = require('./src/socket/Users') 
const { lobbyCardList ,matchMakingTournaments} = require('./src/socket/LobbyTournament')
const { createUserTickets ,getUserTickets} = require('./src/socket/Ticket')
const Log = require('debug')('server');

/**
 * Desc :Start Socket Server
 * Function :createSocket()
 */
function createSocket(io) {
    sendSocket(io);

    //create connection
    io.on("connection", (socket) => {  
       console.log(' socket ID ',socket.id)
        OnMatchMaking(socket)
        OnPrivateRoomRequest(socket)
        OnJoinPrivateRoomRequested(socket)
        OnDisconnected(socket)
        ReConnected(socket)
        //Game play 
        OnPlayLobby(socket)
        OnLobby(socket)
        TransactionHistory(socket)
        UserProfile(socket)
        SendOtp(socket)
        UserLogin(socket)
        CheckUserLogin(socket)
        BankDetailsUpdate(socket)
        ProfileUpdate(socket)
        MyAccountDetails(socket)
        // MyUpiID(socket)
        UpdateUpi(socket)
        GenerateTicket(socket)
        GetTickets(socket)
        ForceLogin(socket)
        PhoneVerify(socket)
        EmailVerify(socket)
        Withdraw(socket)
    }) 
    /* On Game play Instruction */
    function OnDisconnected(socket){
        socket.on("disconnect", () => {
          let id=socket.username!==undefined?socket.username:socket.id;
          Log("someone disconnect " + id)
        });
      }
      
      function OnMatchMaking(socket) {
        socket.on(socketEvents.OnMatchMaking, (data) => {
          socket.playerId=data[commonVar.playerId];
          socket.username=data[commonVar.username];
          let obj={
            socket:socket,
            data:data
          }  
          matchmaking(obj);
        });
      }
      
      function OnPrivateRoomRequest(socket){
        socket.on(socketEvents.OnPrivateRoomRequest, (data) => {
        //   Log("Private room request");
          socket.playerId=data[commonVar.playerId];
          socket.username=data[commonVar.username];
          let obj={
            socket:socket,
            data:data
          }
          CreatePrivateRoom(obj);
        });
      }
      function OnJoinPrivateRoomRequested(socket){
        socket.on(socketEvents.OnJoinPrivateRoomRequested, (data) => {
          Log("join Private room request");
          socket.playerId=data[commonVar.playerId];
          socket.username=data[commonVar.username];
          let obj={
              socket:socket,
              data:data,
              roomName:data[commonVar.roomName]
          };
         
         JoinPrivateRoom(obj);
        });
      }
      function ReConnected(socket){
        socket.on(socketEvents.OnGameRejoiningRequest, (data) => {
          Log("Got reconnection request "+data[commonVar.username]);
          socket.username=data.username;
          let obj={
            socket:socket,
            playerId:data[commonVar.playerId],
            username:data[commonVar.username],
            roomName:data[commonVar.roomName]
          }
         SendConnectionRequest(obj);
        });
      }
      

     /** User Profile & History of Payment */ 
    function OnLobby(socket) { 
      socket.on(events.OnLobbyCardList, async (data) => { 
          const responseData = await lobbyCardList(data ,socket);         
          socket.emit(events.OnLobbyCardList,responseData) 
      })
    }

    //With draw request
    function Withdraw(socket){
      socket.on(events.OnWithdrawRequest, async (data) => { 
          const responseData = await withdrawRequest(data); 
          socket.emit(events.OnWithdrawRequest,responseData)
      })
    }
    //User Profile
    function OnPlayLobby(socket){
      socket.on(events.OnPlayTournament, async (data) => {  
        const responseData = await matchMakingTournaments(data);  
        socket.emit(events.OnPlayTournament,responseData); 
      })
     }
      //Transaction History
     function TransactionHistory(socket){
      socket.on(events.OnTransactionHistoy, async (data) => { 
        const responseData = await getTransactionHistory(data);
        socket.emit(events.OnTransactionHistoy,responseData);  
      })
     }

     //User Profile
     function UserProfile(socket){
      socket.on(events.OnUserProfile, async (data) => { 
        const responseData = await userProfile(data);  
        console.log(socket.handshake);
        console.log(socket.handshake.url);
        socket.emit(events.OnUserProfile,responseData);  
      })
     }

     function SendOtp(socket){
      socket.on(events.OnSendOtp, async(data) =>{
        let result = await sendOtp(data); 
          socket.emit(events.OnSendOtp,result);
        })
    }
    //Check user Logged in or not
    function CheckUserLogin(socket){
      socket.on(events.OnLoggedIn, async(data) =>{ 
        let result = await loggedInUser(data); 
          socket.emit(events.OnLoggedIn,result);
        })
    }
    //  user login 
    function UserLogin(socket){
      socket.on(events.OnLogin, async(data) =>{ 
        let result = await userLogin(data);  
          socket.emit(events.OnLogin,result);
        })
    }
     //  user profile update 
     function ProfileUpdate(socket){
      socket.on(events.OnUpdateProfile, async(data) =>{
        let result = await profileUpdate(data);  
          socket.emit(events.OnUpdateProfile,result);
        })
    }
     //  user bank details update
     function BankDetailsUpdate(socket){
      socket.on(events.OnUpdateBankDetail, async(data) =>{
        let result = await bankDetailsUpdate(data);  
          socket.emit(events.OnUpdateBankDetail,result);
        })
    }
    //  user bank details update
    function MyAccountDetails(socket){
      socket.on(events.OnBankDetails, async(data) =>{
        let result = await myAccountDetails(data);  
          socket.emit(events.OnBankDetails,result);
        })
    }
    function UpdateUpi(socket){
      socket.on(events.OnUpdateUpiID, async(data) =>{
        let result = await updateUpiID(data);  
          socket.emit(events.OnUpdateUpiID,result);
        })
    }
    // function MyUpiID(socket){
    //   socket.on(events.OnUpiID, async(data) =>{
    //     let result = await upiID(data);  
    //       socket.emit(events.OnUpiID,result);
    //     })
    // }
    //CREATE tickets
    function GenerateTicket(socket){
      socket.on(events.OnUserCreateTicket, async(data) =>{
        let result = await createUserTickets(data);  
          socket.emit(events.OnUserCreateTicket,result);
        })
    }
    function GetTickets(socket){
      socket.on(events.OnUserTickets, async(data) =>{
        let result = await getUserTickets(data);  
          socket.emit(events.OnUserTickets,result);
        })
    }
    function ForceLogin(socket){
      socket.on(events.OnUserForceLogin, async(data) =>{
        let result = await userForceLogin(data);  
          socket.emit(events.OnUserForceLogin,result);
        })
    }
    //Email Verify
    function EmailVerify(socket){
      socket.on(events.OnUserEmailVerify, async(data) =>{
        let result = await userEmailVerify(data);  
          socket.emit(events.OnUserEmailVerify,result);
        })
    }
    //Phone Verify
    function PhoneVerify(socket){
      socket.on(events.OnUserPhoneVerify, async(data) =>{
        let result = await userPhoneVerify(data);  
          socket.emit(events.OnUserPhoneVerify,result);
        })
    }
}

module.exports.createSocket = createSocket;