// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { TimexProperty } = require('@microsoft/recognizers-text-data-types-timex-expression');
const { InputHints, MessageFactory,ActivityHandler,CardFactory } = require('botbuilder');
const { ConfirmPrompt, TextPrompt, WaterfallDialog } = require('botbuilder-dialogs');
const { CancelAndHelpDialog } = require('./cancelAndHelpDialog');
const { DateResolverDialog } = require('./dateResolverDialog');

const {basicText}   = require('../resources/basicText') 
const CONFIRM_PROMPT = 'confirmPrompt';
const DATE_RESOLVER_DIALOG = 'dateResolverDialog';
const TEXT_PROMPT = 'textPrompt';
const WATERFALL_DIALOG = 'waterfallDialog';

class autoDialog extends  CancelAndHelpDialog {
    constructor(id) {
        super(id || 'autoDialog'); 
          global.currentState='AUTO';

        this.addDialog(new TextPrompt(TEXT_PROMPT))
            .addDialog(new ConfirmPrompt(CONFIRM_PROMPT))
            .addDialog(new DateResolverDialog(DATE_RESOLVER_DIALOG))
            .addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
                this.travelDateStep.bind(this),
                this.autoName.bind(this),
                 this.autoMake.bind(this),
                this.autoUse.bind(this),
                this.autoStatus.bind(this),
                this.drivingExp.bind(this),           
                this.getName.bind(this),           
                this.getEmail.bind(this),
                this.quoteShow.bind(this),   
                this.finalStep1.bind(this),
            ]));

        this.initialDialogId = WATERFALL_DIALOG;
    } 


        async travelDateStep(stepContext) { 
        console.log('auto init');
        const bookingDetails = stepContext.options; 

            await stepContext.context.sendActivity(basicText.autoGreet)   

            await stepContext.context.sendActivity(basicText.autoGreet2)   

        // Capture the results of the previous step
        bookingDetails.origin = stepContext.result;
        if (!bookingDetails.travelDate1 || this.isAmbiguous(bookingDetails.travelDate1)) { 

            return await stepContext.beginDialog(DATE_RESOLVER_DIALOG, { 
                date1: bookingDetails.travelDate1,'id':1 });
        }
        return await stepContext.next(bookingDetails.autoDate);
    }  


     async autoName(stepContext) {  
        console.log('auto Name   step');
        const bookingDetails = stepContext.options; 

            await stepContext.context.sendActivity(basicText.quoteGreet) 

        // Capture the response to the previous step's prompt
        bookingDetails.autoDate = stepContext.result;
        if (!bookingDetails.autoName) {
            const messageText = basicText.autoname;
            const msg = MessageFactory.text(messageText, messageText, InputHints.ExpectingInput);
            return await stepContext.prompt(TEXT_PROMPT, { prompt: msg });
        }
        return await stepContext.next(bookingDetails.autoName);
    } 



          async autoMake(stepContext) {  

        console.log('auto make of year   step');
        const bookingDetails = stepContext.options; 
        console.log(bookingDetails);
 
        // Capture the response to the previous step's prompt
        bookingDetails.autoName = stepContext.result;
        if (!bookingDetails.autoMake) {
            const messageText = basicText.autoMake;
            const msg = MessageFactory.text(messageText, messageText, InputHints.ExpectingInput);
            return await stepContext.prompt(TEXT_PROMPT, { prompt: msg });
        }
        return await stepContext.next(bookingDetails.autoMake);
    } 

      async autoUse(stepContext) { 


        const bookingDetails = stepContext.options; 
        bookingDetails.autoMake = stepContext.result;

        console.log(' auto use  step'); 

        // Create the PromptOptions which contain the prompt and re-prompt messages.
        // PromptOptions also contains the list of choices available to the user.
        const options = {
            prompt: basicText.autoPurpose,
            retryPrompt: 'That was not a valid choice,',
            choices: this.choosePropertyType1()
        };

        // Prompt the user with the configured PromptOptions.
        return await stepContext.prompt('cardPrompt', options);
    }  
  



    async autoStatus(stepContext) {
        console.log(' auto status own or lease  step');
 
        const bookingDetails = stepContext.options; 
        bookingDetails.autoUse = stepContext.result.value;

        // Create the PromptOptions which contain the prompt and re-prompt messages.
        // PromptOptions also contains the list of choices available to the user.
        const options = {
            prompt: basicText.autoStatus,
            retryPrompt: 'That was not a valid choice,',
            choices: this.chooseAutoStatus()
        };

        // Prompt the user with the configured PromptOptions.
        return await stepContext.prompt('cardPrompt', options);
    }  


      async drivingExp(stepContext) {  
        console.log('driving exp  Name   step');
        const bookingDetails = stepContext.options;

        // Capture the response to the previous step's prompt
        bookingDetails.autoStatus = stepContext.result.value;
        if (!bookingDetails.autoDrivingExp) {
            const messageText = basicText.driving;
            const msg = MessageFactory.text(messageText, messageText, InputHints.ExpectingInput);
            return await stepContext.prompt(TEXT_PROMPT, { prompt: msg });
        }
        return await stepContext.next(bookingDetails.autoDrivingExp);
    }
      






    /**
     * If a destination city has not been provided, prompt for one.
     */
      async getName(stepContext) { 
        console.log('get name  type');
        const bookingDetails = stepContext.options;

        bookingDetails.autoDrivingExp = stepContext.result;
        if (!bookingDetails.autoCname) {
            const messageText = basicText.name;
            const msg = MessageFactory.text(messageText, messageText, InputHints.ExpectingInput);
            return await stepContext.prompt(TEXT_PROMPT, { prompt: msg });
        } 
      
        return await stepContext.next(bookingDetails.autoCname);
    } 


    

     async getEmail(stepContext) { 
        console.log('get email  type');
        const bookingDetails = stepContext.options; 


        await stepContext.context.sendActivity(basicText.prepare) 

        bookingDetails.autoCname = stepContext.result;
        if (!bookingDetails.autoEmail) {
            const messageText = basicText.autoEmail;
            const msg = MessageFactory.text(messageText, messageText, InputHints.ExpectingInput);
            return await stepContext.prompt(TEXT_PROMPT, { prompt: msg });
        } 
      
        return await stepContext.next(bookingDetails.autoEmail);
    }  



     async quoteShow(stepContext) { 


        const bookingDetails = stepContext.options; 
        bookingDetails.autoEmail = stepContext.result;

        console.log(' quote show   step'); 

        // Create the PromptOptions which contain the prompt and re-prompt messages.
        // PromptOptions also contains the list of choices available to the user.
        const options = {
            prompt: 'Thanks, We will be sending the quote details to your email, here are three plans we have for you.',
            retryPrompt: 'That was not a valid choice,',
            choices: this.chooseQuoteStatus()
        };

        // Prompt the user with the configured PromptOptions.
        return await stepContext.prompt('cardPrompt', options);
    }   


       async finalStep1(stepContext) {  
         console.log('final step'); 

          await stepContext.context.sendActivity({ attachments: [this.createReceiptCard()] });
       
 
            const bookingDetails = stepContext.options;
            return await stepContext.endDialog(bookingDetails);
      
    }





     createReceiptCard() {
        return CardFactory.receiptCard({
            title: 'Your Drydent Car Insurance Quote',
            facts: [
                {
                    key: 'Address of The Applicant',
                    value: '1234'
                },
                {
                    key: 'Coverage Highlights',
                    value: ''
                }
            ],
            items: [
                {
                    title: 'Price',
                    price: '$10.00',
                    image: { url: 'https://github.com/amido/azure-vector-icons/raw/master/renders/traffic-manager.png' }
                },
                {
                    title: 'Body, Engine',
                    price: '$10.00',
                    image: { url: 'https://github.com/amido/azure-vector-icons/raw/master/renders/cloud-service.png' }
                }
                
            ],
            tax: '$7.50',
            total: '$27.50'
        });
    }


     async getPhone(stepContext) { 
        console.log('get phone  type');
        const bookingDetails = stepContext.options; 

 

        bookingDetails.quoteName = stepContext.result;
        if (!bookingDetails.phone) {
            const messageText = basicText.autofinal;
            const msg = MessageFactory.text(messageText, messageText, InputHints.ExpectingInput);
            return await stepContext.prompt(TEXT_PROMPT, { prompt: msg });
        } 
      
        return await stepContext.next(bookingDetails.phone);
    }

    /**
     * If an origin city has not been provided, prompt for one.
     */
  

        
      



    /**
     * If a travel date has not been provided, prompt for one.
     * This will use the DATE_RESOLVER_DIALOG.
     */



    /**
     * Confirm the information the user has provided.
     */

     choosePropertyType1() {
        const cardOptions = [
            {
                value: basicText.personal,
                synonyms: ['adaptive']
            },
            {
                value: basicText.commercial,
                synonyms: ['animation']
            }, {
                value: basicText.business,
                synonyms: ['adaptive']
            },
            {
                value: basicText.farming,
                synonyms: ['animation']
            }
        ];

        return cardOptions;
    }   



     chooseQuoteStatus() {
        const cardOptions = [
            {
                value: 'Basic',
                synonyms: ['adaptive']
            },
            {
                value: "Choice",
                synonyms: ['animation']
            },
            {
                value: "Recommended",
                synonyms: ['animation']
            }
        ];

        return cardOptions;
    }   


      chooseAutoStatus() {
        const cardOptions = [
            {
                value: basicText.finance,
                synonyms: ['adaptive']
            },
            {
                value: basicText.lease,
                synonyms: ['animation']
            },
            {
                value: basicText.own,
                synonyms: ['animation']
            }
        ];

        return cardOptions;
    }   



    






    /**
     * Complete the interaction and end the dialog.
     */
 

    isAmbiguous(timex) {
        const timexPropery = new TimexProperty(timex);
        return !timexPropery.types.has('definite');
    }
}

module.exports.autoDialog = autoDialog;
