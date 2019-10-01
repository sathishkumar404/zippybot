// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { InputHints, MessageFactory } = require('botbuilder');
const { ConfirmPrompt, WaterfallDialog,DialogSet,ComponentDialog,DialogTurnStatus } = require('botbuilder-dialogs');
const { CancelAndHelpDialog } = require('./cancelAndHelpDialog');
const { autoDialog } = require("./autoDialog");
const CONFIRM_PROMPT = 'ConfirmPrompt';
const WATERFALL_DIALOG = 'waterfallDialog';

const {basicText}   = require('../resources/basicText') 
const AUTO_DIALOG  ="autoDialog"; 

class confirmAuto extends ComponentDialog {
    constructor(id) { 
      console.log('auto confirm');
        super(id || 'confirmAuto');
        this.addDialog(new ConfirmPrompt(CONFIRM_PROMPT ))
            .addDialog(new autoDialog(AUTO_DIALOG ))
            .addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
                this.initialStep.bind(this),
                this.finalStep.bind(this)
            ]));

        this.confirmDialogAuto = WATERFALL_DIALOG;
        
    } 


   async run(turnContext, accessor) {
   

    const dialogSet = new DialogSet(accessor);
    dialogSet.add(this);

    const dialogContext = await dialogSet.createContext(turnContext);
  
      await dialogContext.beginDialog('confirmAuto');
    
  }

    async initialStep(stepContext) { 
    console.log('inital');
    const messageText = 'Do you need info about Auto Insurance';
    const msg = MessageFactory.text(
      messageText,
      messageText,
      InputHints.ExpectingInput
    );

    // Offer a YES/NO prompt.
    return await stepContext.prompt(CONFIRM_PROMPT, { prompt: msg });

           
    }

    async finalStep(stepContext) {  
 console.log('final');
        const bookingDetails = {};
          //Calling Home Dialog   
          if(stepContext.result){ 

        bookingDetails.type = "Auto";
             return await stepContext.beginDialog(AUTO_DIALOG, {
      bookingDetails
      });
         }else
         { 
            return await stepContext.endDialog(bookingDetails);
         }
           

    }

   
}

module.exports.confirmAuto = confirmAuto;
