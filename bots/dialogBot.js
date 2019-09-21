// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { ActivityHandler,CardFactory } = require('botbuilder');
const { QnAMaker,LuisRecognizer } = require('botbuilder-ai');
/**
 * This IBot implementation can run any type of Dialog. The use of type parameterization is to allows multiple different bots
 * to be run at different endpoints within the same project. This can be achieved by defining distinct Controller types
 * each with dependency on distinct IBot types, this way ASP Dependency Injection can glue everything together without ambiguity.
 * The ConversationState is used by the Dialog system. The UserState isn't, however, it might have been used in a Dialog implementation,
 * and the requirement is that all BotState objects are saved at the end of a turn.
 */

class DialogBot extends ActivityHandler {
    /**
     *
     * @param {ConversationState} conversationState
     * @param {UserState} userState
     * @param {Dialog} dialog
     */
    constructor(conversationState, userState, dialog) {
        super();
        if (!conversationState) throw new Error('[DialogBot]: Missing parameter. conversationState is required');
        if (!userState) throw new Error('[DialogBot]: Missing parameter. userState is required');
        if (!dialog) throw new Error('[DialogBot]: Missing parameter. dialog is required');

        this.conversationState = conversationState;
        this.userState = userState;
        this.dialog = dialog;
        this.dialogState = this.conversationState.createProperty('DialogState');   


         const dispatchRecognizer = new LuisRecognizer({
            applicationId: process.env.LuisAppId,
            endpointKey: process.env.LuisAPIKey,
            endpoint: `https://${ process.env.LuisAPIHostName }`
        }, {
            includeAllIntents: true,
            includeInstanceData: true
        }, true); 

        
        this.dispatchRecognizer = dispatchRecognizer;

          try {
            this.qnaMaker = new QnAMaker({
                knowledgeBaseId: process.env.QnAKnowledgebaseId,
                endpointKey: process.env.QnAEndpointKey,
                host: process.env.QnAEndpointHostName
            });
        } catch (err) {
            console.warn(`QnAMaker Exception: ${ err }  your QnAMaker configuration in .env`);
        }





 this.onEvent(async (context, next) => {

    await context.sendActivity("event received!");

    await next();
}); 



























        this.onMessage(async (context, next) => {    
       console.log('onMessage called')   


    // Save state changes
    await this.userState.saveChanges(context);

        
       await context.sendActivity({ type: 'typing','delay':'1000'}); 


       

//Call LUIS 

  // const recognizerResult = await dispatchRecognizer.recognize(context);

  //           // Top intent tell us which cognitive service to use.
  //           const intent = LuisRecognizer.topIntent(recognizerResult);
            
  //           console.log(intent);
  //           // Next, we call the dispatcher with the top intent.
  //           await this.dispatchToTopIntentAsync(context, intent, recognizerResult);


//end







 console.log(global.currentState);
  if(global.currentState==='FAQ'){ 
             console.log('faq running');
        if (!process.env.QnAKnowledgebaseId || !process.env.QnAEndpointKey || !process.env.QnAEndpointHostName) {
                let unconfiguredQnaMessage = 'NOTE: \r\n' + 
                    'QnA Maker is not configured. To enable all capabilities, add `QnAKnowledgebaseId`, `QnAEndpointKey` and `QnAEndpointHostName` to the .env file. \r\n' +
                    'You may visit www.qnamaker.ai to create a QnA Maker knowledge base.'

                 await context.sendActivity(unconfiguredQnaMessage)
            }
            else {
                console.log('Calling QnA Maker');
    
                const qnaResults = await this.qnaMaker.getAnswers(context);
    
                // If an answer was received from QnA Maker, send the answer back to the user.
                if (qnaResults[0]) {
                    await context.sendActivity(qnaResults[0].answer);
    
                // If no answers were returned from QnA Maker, reply with help.
                } else {
                    await context.sendActivity('Sorry, Im unable to answer. '); 
                    global.currentState="CHOOSESERVICE";
                 await dialog.run(context, conversationState.createProperty('DialogState'));
                   
                }
    
            }
  }else{
           console.log('run dialog ');
            // Run the Dialog with the new message Activity.
            await this.dialog.run(context, this.dialogState);
  } 

 
         


            // By calling next() you ensure that the next BotHandler is run.
            await next();
        });

        this.onDialog(async (context, next) => { 
            
            // Save any state changes. The load happened during the execution of the Dialog.
            await this.conversationState.saveChanges(context, false);
            await this.userState.saveChanges(context, false);

            // By calling next() you ensure that the next BotHandler is run.
            await next();
        });
    } 






     async dispatchToTopIntentAsync(context, intent, recognizerResult) { 
        console.log(recognizerResult.luisResult);
        switch (intent) {
        case 'AUTO':
            await this.processHomeAutomation(context, recognizerResult.luisResult);
            break;
        case 'l_Weather':
            await this.processWeather(context, recognizerResult.luisResult);
            break;
        case 'q_sample-qna':
            await this.processSampleQnA(context);
            break;
        default:
            console.log(`Dispatch unrecognized intent: ${ intent }.`);
            await context.sendActivity(`Dispatch unrecognized intent: ${ intent }.`);
            // await next();
            break;
        }
    }

    async processHomeAutomation(context, luisResult) {
        console.log('processHomeAutomation');

        // Retrieve LUIS result for Process Automation.
        const result = luisResult.connectedServiceResult;
        const intent = result.topScoringIntent.intent;

        await context.sendActivity(`HomeAutomation top intent ${ intent }.`);
        await context.sendActivity(`HomeAutomation intents detected:  ${ luisResult.intents.map((intentObj) => intentObj.intent).join('\n\n') }.`);

        if (luisResult.entities.length > 0) {
            await context.sendActivity(`HomeAutomation entities were found in the message: ${ luisResult.entities.map((entityObj) => entityObj.entity).join('\n\n') }.`);
        }
    }

    async processWeather(context, luisResult) {
        console.log('processWeather');

        // Retrieve LUIS results for Weather.
        const result = luisResult.connectedServiceResult;
        const topIntent = result.topScoringIntent.intent;

        await context.sendActivity(`ProcessWeather top intent ${ topIntent }.`);
        await context.sendActivity(`ProcessWeather intents detected:  ${ luisResult.intents.map((intentObj) => intentObj.intent).join('\n\n') }.`);

        if (luisResult.entities.length > 0) {
            await context.sendActivity(`ProcessWeather entities were found in the message: ${ luisResult.entities.map((entityObj) => entityObj.entity).join('\n\n') }.`);
        }
    }

    async processSampleQnA(context) {
        console.log('processSampleQnA');

        const results = await this.qnaMaker.getAnswers(context);

        if (results.length > 0) {
            await context.sendActivity(`${ results[0].answer }`);
        } else {
            await context.sendActivity('Sorry, could not find an answer in the Q and A system.');
        }
    }


}

module.exports.DialogBot = DialogBot;
