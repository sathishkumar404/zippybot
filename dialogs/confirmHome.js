// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { InputHints, MessageFactory } = require('botbuilder');
const { ConfirmPrompt, WaterfallDialog } = require('botbuilder-dialogs');
const { CancelAndHelpDialog } = require('./cancelAndHelpDialog');
const { homeDialog } = require("./homeDialog");
const CONFIRM_PROMPT = 'ConfirmPrompt';
const WATERFALL_DIALOG = 'waterfallDialog';

const {basicText}   = require('../resources/basicText') 
const HOME_DIALOG  ="HomeDialog"; 

class ConfirmHome extends CancelAndHelpDialog {
    constructor(id) {
        super(id || 'confirmHome');
        this.addDialog(new ConfirmPrompt(CONFIRM_PROMPT ))
            .addDialog(new homeDialog(HOME_DIALOG ))
            .addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
                this.initialStep.bind(this),
                this.finalStep.bind(this)
            ]));

        this.initialDialogId = WATERFALL_DIALOG;
        console.log('cons');
    }

    async initialStep(stepContext) { 

    const messageText = 'Do you need info about Home Insurance';
    const msg = MessageFactory.text(
      messageText,
      messageText,
      InputHints.ExpectingInput
    );

    // Offer a YES/NO prompt.
    return await stepContext.prompt(CONFIRM_PROMPT, { prompt: msg });

           
    }

    async finalStep(stepContext) {  

        const bookingDetails = {};
       
          //Calling Home Dialog   
          if(stepContext.result){ 

             bookingDetails.type = "Home";
             return await stepContext.beginDialog(HOME_DIALOG, {
      bookingDetails
      });
         }else
         { 
            return await stepContext.endDialog(bookingDetails);
         }
           

    }

   
}

module.exports.ConfirmHome = ConfirmHome;
