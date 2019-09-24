
const { BotFrameworkAdapter, MemoryStorage, ConversationState, UserState } = require('botbuilder');



var inMemoryStorage = new builder.MemoryBotStorage();

// This bot enables users to either make a dinner reservation or order dinner.
var bot = new builder.UniversalBot(connector, function(session){
    var msg = "Welcome to the reservation bot. Please say `Dinner Reservation` or `Order Dinner`";
    session.send(msg);
}).set('storage', inMemoryStorage); // Register in-memory storage


// This dialog helps the user make a dinner reservation.
bot.dialog('dinnerReservation', [
    function (session) {
        session.send("Welcome to the dinner reservation.");
        session.beginDialog('askForDateTime');
    },
    function (session, results) {
        session.dialogData.reservationDate = builder.EntityRecognizer.resolveTime([results.response]);
        session.beginDialog('askForPartySize');
    },
    function (session, results) {
        session.dialogData.partySize = results.response;
        session.beginDialog('askForReserverName');
    },
    function (session, results) {
        session.dialogData.reservationName = results.response;

        // Process request and display reservation details
        session.send(`Reservation confirmed. Reservation details: <br/>Date/Time: ${session.dialogData.reservationDate} <br/>Party size: ${session.dialogData.partySize} <br/>Reservation name: ${session.dialogData.reservationName}`);
        session.endDialog();
    }
])
.triggerAction({
    matches: /^dinner reservation$/i,
    confirmPrompt: "This will cancel your current request. Are you sure?"
});

