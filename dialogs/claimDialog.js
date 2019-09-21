// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { TimexProperty } = require('@microsoft/recognizers-text-data-types-timex-expression');
const { InputHints, MessageFactory,ActivityHandler } = require('botbuilder');
const { ConfirmPrompt, TextPrompt, WaterfallDialog,AttachmentPrompt } = require('botbuilder-dialogs');
const { CancelAndHelpDialog } = require('./cancelAndHelpDialog');
const { DateResolverDialog } = require('./dateResolverDialog');

const {basicText}   = require('../resources/basicText') 
const CONFIRM_PROMPT = 'confirmPrompt';
const DATE_RESOLVER_DIALOG = 'dateResolverDialog';
const TEXT_PROMPT = 'textPrompt';
const ATTACHMENT_PROMPT = 'attachmentprompt';
const WATERFALL_DIALOG = 'waterfallDialog';

class claimDialog extends  CancelAndHelpDialog {
    constructor(id) {
        super(id || 'claimDialog'); 
          global.currentState='AUTO';

        this.addDialog(new TextPrompt(TEXT_PROMPT))
            .addDialog(new ConfirmPrompt(CONFIRM_PROMPT))
            .addDialog(new AttachmentPrompt(ATTACHMENT_PROMPT))
            .addDialog(new DateResolverDialog(DATE_RESOLVER_DIALOG))
            .addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
                this.policyNo.bind(this), 
                this.getDOB.bind(this),
                  this.confirmStep.bind(this),
                this.incidentDetail.bind(this),
                this.incidentImage.bind(this),
                this.getLocation.bind(this),
                 this.incidentHappen.bind(this),
                this.finalStep1.bind(this)
            ]));

        this.initialDialogId = WATERFALL_DIALOG;
    }

    /**
     * If a destination city has not been provided, prompt for one.
     */   
      async policyNo(stepContext) {  
        console.log('policy no   step');
        const bookingDetails = stepContext.options;

        // Capture the response to the previous step's prompt
        bookingDetails.travelDate = stepContext.result;
        if (!bookingDetails.claimPolicyNo) {
            const messageText = basicText.policyNo;
            const msg = MessageFactory.text(messageText, messageText, InputHints.ExpectingInput);
            return await stepContext.prompt(TEXT_PROMPT, { prompt: msg });
        }
        return await stepContext.next(bookingDetails.claimPolicyNo);
    }  





     async getDOB(stepContext) { 
        console.log('auto init');
        const bookingDetails = stepContext.options; 
 
 

        // Capture the results of the previous step
        bookingDetails.claimPolicyNo = stepContext.result;
            if (!bookingDetails.claimDOB) {
            const messageText = basicText.dob;
            const msg = MessageFactory.text(messageText, messageText, InputHints.ExpectingInput);
            return await stepContext.prompt(TEXT_PROMPT, { prompt: msg });
        }

        return await stepContext.next(bookingDetails.claimDOB);
    } 
       



         async confirmStep(stepContext) {
        const bookingDetails = stepContext.options;
 
        // Capture the results of the previous step
        bookingDetails.claimDOB = stepContext.result;
        const messageText = 'Thanks for verifying. Is this for your Ford Model T ?';
        const msg = MessageFactory.text(messageText, messageText, InputHints.ExpectingInput);
        // Offer a YES/NO prompt.
        return await stepContext.prompt(CONFIRM_PROMPT, { prompt: msg });
    }  


        async incidentDetail(stepContext) { 
        console.log('get incident detail');
        const bookingDetails = stepContext.options;

        bookingDetails.isItCar = stepContext.result;
        if (!bookingDetails.claimIncidentDetail) {
            const messageText = basicText.incidentDetail;
            const msg = MessageFactory.text(messageText, messageText, InputHints.ExpectingInput);
            return await stepContext.prompt(TEXT_PROMPT, { prompt: msg });
        } 
      
        return await stepContext.next(bookingDetails.claimIncidentDetail);
    }  


      async incidentImage(stepContext) { 
        console.log('incident image  type');
        const bookingDetails = stepContext.options; 

        console.log(bookingDetails.claimPolicyNo);

        bookingDetails.claimIncidentDetail = stepContext.result;
        if (!bookingDetails.claimIncidentImage) {
            const messageText = basicText.incidentImage;
            const msg = MessageFactory.text(messageText, messageText, InputHints.ExpectingInput);
            return await stepContext.prompt(ATTACHMENT_PROMPT, { prompt: msg });
        }  

        console.log(stepContext.result);
      
        return await stepContext.next(bookingDetails.claimIncidentImage);
    }



 async getLocation(stepContext) {  
        console.log('policy no   step');
        const bookingDetails = stepContext.options;

        // Capture the response to the previous step's prompt
        bookingDetails.claimIncidentImage = stepContext.result;
        if (!bookingDetails.claimLocation) {
            const messageText = basicText.incidentLocation;
            const msg = MessageFactory.text(messageText, messageText, InputHints.ExpectingInput);
            return await stepContext.prompt(TEXT_PROMPT, { prompt: msg });
        }
        return await stepContext.next(bookingDetails.claimLocation);
    } 



     



          async incidentHappen(stepContext) {  

        console.log('incident date   step');
        const bookingDetails = stepContext.options; 
        console.log(bookingDetails);
 
        // Capture the response to the previous step's prompt
        bookingDetails.claimLocation = stepContext.result;
        if (!bookingDetails.claimIncidentHappen) {
            const messageText = basicText.incidentHappen;
            const msg = MessageFactory.text(messageText, messageText, InputHints.ExpectingInput);
            return await stepContext.prompt(TEXT_PROMPT, { prompt: msg });
        }
        return await stepContext.next(bookingDetails.claimIncidentHappen);
    }



   

 


   


    /**
     * Complete the interaction and end the dialog.
     */
    async finalStep1(stepContext) {  
         console.log('final cliam step');
        await stepContext.context.sendActivity(basicText.record); 

        const bookingDetails = stepContext.options;
        bookingDetails.claimIncidentHappen = stepContext.result;
    
            return await stepContext.endDialog(bookingDetails);
     
    }

    isAmbiguous(timex) {
        const timexPropery = new TimexProperty(timex);
        return !timexPropery.types.has('definite');
    }
}

module.exports.claimDialog = claimDialog;
