// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { InputHints, MessageFactory } = require('botbuilder');
const { ConfirmPrompt, WaterfallDialog } = require('botbuilder-dialogs');
const { CancelAndHelpDialog } = require('./cancelAndHelpDialog');
const { claimDialog } = require("./claimDialog");
const CONFIRM_PROMPT = 'ConfirmPrompt';
const WATERFALL_DIALOG = 'waterfallDialog';

const {basicText}   = require('../resources/basicText') 
const CLAIM_DIALOG  ="ClaimDialog"; 

class ConfirmClaim extends CancelAndHelpDialog {
    constructor(id) {
        super(id || 'confirmAuto');
        this.addDialog(new ConfirmPrompt(CONFIRM_PROMPT ))
            .addDialog(new claimDialog(CLAIM_DIALOG ))
            .addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
                this.initialStep.bind(this),
                this.finalStep.bind(this)
            ]));

        this.initialDialogId = WATERFALL_DIALOG;
        console.log('cons');
    }

    async initialStep(stepContext) { 

    const messageText = 'Do you want Claim Related Details?';
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

        bookingDetails.type = "Claim";
             return await stepContext.beginDialog(CLAIM_DIALOG, {
      bookingDetails
      });
         }else
         { 
            return await stepContext.endDialog(bookingDetails);
         }
           

    }

   
}

module.exports.ConfirmClaim = ConfirmClaim;
