// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const {
  AttachmentLayoutTypes,
  CardFactory,
  MessageFactory,
  InputHints
} = require("botbuilder");
const {
  ChoicePrompt,
  ComponentDialog,
  DialogSet,
  DialogTurnStatus,
  ConfirmPrompt,
  WaterfallDialog
} = require("botbuilder-dialogs");
const AdaptiveCard = require("../resources/adaptiveCard.json");

const { basicText } = require("../resources/basicText");

const { homeDialog } = require("./homeDialog");

const { autoDialog } = require("./autoDialog");

const { claimDialog } = require("./claimDialog");

const { faqDialog } = require("./faqDialog");  

// const { ConfirmAuto } = require("./confirmAuto"); 


const { capitalize } = require("../functions");

const HOME_DIALOG = "homeDialog";
const CONFIRM_PROMPT = "confirmPrompt";
const MAIN_WATERFALL_DIALOG = "mainWaterfallDialog";

class MainDialog extends ComponentDialog {
  constructor() {
    super("MainDialog");
   console.log('main dialog');
    // Define the main dialog and its related components.
    this.addDialog(new ChoicePrompt("cardPrompt"));
    this.addDialog(new homeDialog("homeDialog"));
    this.addDialog(new autoDialog("autoDialog"));
    this.addDialog(new faqDialog("faqDialog"));
    // this.addDialog(new ConfirmAuto("confirmAuto"));
    this.addDialog(new claimDialog("claimDialog"));
    this.addDialog(new ConfirmPrompt(CONFIRM_PROMPT));
    this.addDialog(
      new WaterfallDialog(MAIN_WATERFALL_DIALOG, [
        this.choiceCardStep.bind(this),
        this.showCardStep.bind(this),
        this.showCardStep.bind(this),
        this.confirmStep.bind(this),
        this.finalStep.bind(this)
      ])
    );

    // The initial child Dialog to run.
    this.initialDialogId = MAIN_WATERFALL_DIALOG;
  }

  /**
   * The run method handles the incoming activity (in the form of a TurnContext) and passes it through the dialog system.
   * If no dialog is active, it will start the default dialog.
   * @param {*} turnContext
   * @param {*} accessor
   */

  async confirmStep(stepContext) {
    console.log("confirm");  
    const bookingDetails = stepContext.result;
    console.log(bookingDetails);   
    console.log(bookingDetails.type);
    if(bookingDetails.type =="CLIAM"){  
      
    await stepContext.context.sendActivity(basicText.reach);
      console.log('in');
 const messageText = 'Do you have any other Questions?';  
  const msg = MessageFactory.text(
      messageText,
      messageText,
      InputHints.ExpectingInput
    );

    // Offer a YES/NO prompt.
    return await stepContext.prompt(CONFIRM_PROMPT, { prompt: msg });
 
    }else{  
      console.log('out');
       const messageText = 'Do you have any other Queries '+capitalize(bookingDetails.Name)+' ?';
 
       await stepContext.context.sendActivity('Awesome, I just sent the Quote to your '+bookingDetails.Email);
       
    await stepContext.context.sendActivity(basicText.reach);
        const msg = MessageFactory.text(
      messageText,
      messageText,
      InputHints.ExpectingInput
    );

    // Offer a YES/NO prompt.
    return await stepContext.prompt(CONFIRM_PROMPT, { prompt: msg });


    }

     
  }

  async run(turnContext, accessor) {
   

    const dialogSet = new DialogSet(accessor);
    dialogSet.add(this);

    const dialogContext = await dialogSet.createContext(turnContext);
    const results = await dialogContext.continueDialog();
    if (results.status === DialogTurnStatus.empty) {
      await dialogContext.beginDialog(this.id);
    }
  }

  /**
   * 1. Prompts the user if the user is not in the middle of a dialog.
   * 2. Re-prompts the user when an invalid input is received.
   *
   * @param {WaterfallStepContext} stepContext
   */
  async choiceCardStep(stepContext) {
    console.log("MainDialog.choiceCardStep");

    global.currentState = "CHOOOSESERVICE";

    // Create the PromptOptions which contain the prompt and re-prompt messages.
    // PromptOptions also contains the list of choices available to the user.
    const options = {
      prompt: basicText.chooseService,
      retryPrompt: "That was not a valid choice",
      choices: this.chooseService()
    };

    // Prompt the user with the configured PromptOptions.
    return await stepContext.prompt("cardPrompt", options);
  }

  /**
   * Send a Rich Card response to the user based on their choice.
   * This method is only called when a valid prompt response is parsed from the user's response to the ChoicePrompt.
   * @param {WaterfallStepContext} stepContext
   */
  async showCardStep(stepContext) {  

  
    if(global.currentState =="RESTART"){
         return await stepContext.replaceDialog(this.initialDialogId, {
          restartMsg: "What else can I do for you?"
        });
      
    }

    switch (stepContext.result.value) {
      case basicText.csOpt1: {
        // await stepContext.context.sendActivity(basicText.quoteGreet);
        return this.chooseInsureType(stepContext);
        break;
      }
      case basicText.home: {
        console.log("home");

        const bookingDetails = {};
        bookingDetails.type = "Home";
        console.log("home pressed");
        return await stepContext.beginDialog("homeDialog", bookingDetails);
        console.log("home next");
        return await stepContext.next();
      }

      case basicText.auto: {
        console.log("auto");
        const bookingDetails = {};
        bookingDetails.type = "Auto";
        console.log("auto pressed");
        return await stepContext.beginDialog("autoDialog", bookingDetails);
        console.log("auto next");
        return await stepContext.next();
      }

      case basicText.csOpt3: {
        console.log("faq pressed");
        const bookingDetails = {};
        bookingDetails.type = "FAQ";
        return await stepContext.beginDialog("faqDialog", bookingDetails);
        return await stepContext.next();
      }

      case basicText.csOpt2: {
        console.log("claim  pressed");
        const bookingDetails = {};
        bookingDetails.type = "CLIAM";
        return await stepContext.beginDialog("claimDialog", bookingDetails);
        return await stepContext.next();
      } 

      default: { 
        console.log('claiom');
        const bookingDetails = stepContext.result;
        return await stepContext.next(bookingDetails);
      }
    } //awithc end

    // Give the user instructions about what to do next
    // await stepContext.context.sendActivity('Type anything to see another card.');

    return await stepContext.endDialog();
  }

  /**
   * Create the choices with synonyms to render for the user during the ChoicePrompt.
   * (Indexes and upper/lower-case variants do not need to be added as synonyms)
   */
  getChoices() {
    const cardOptions = [
      {
        value: "Adaptive Card",
        synonyms: ["adaptive"]
      },
      {
        value: "Animation Card",
        synonyms: ["animation"]
      },
      {
        value: "Audio Card",
        synonyms: ["audio"]
      },
      {
        value: "Hero Card",
        synonyms: ["hero"]
      },
      {
        value: "Receipt Card",
        synonyms: ["receipt"]
      },
      {
        value: "Signin Card",
        synonyms: ["signin"]
      },
      {
        value: "Thumbnail Card",
        synonyms: ["thumbnail", "thumb"]
      },
      {
        value: "Video Card",
        synonyms: ["video"]
      },
      {
        value: "All Cards",
        synonyms: ["all"]
      }
    ];

    return cardOptions;
  }

  chooseService() {
    const cardOptions = [
      {
        value: basicText.csOpt1,
        synonyms: ["adaptive"]
      },
      {
        value: basicText.csOpt2,
        synonyms: ["animation"]
      },
      {
        value: basicText.csOpt3,
        synonyms: ["audio"]
      }
    ];

    return cardOptions;
  }

  quoteOption() {
    const cardOptions = [
      {
        value: basicText.home,
        synonyms: ["adaptive"]
      },
      {
        value: basicText.auto,
        synonyms: ["animation"]
      }
    ];

    return cardOptions;
  }

  async chooseInsureType(stepContext) {
    // Create the PromptOptions which contain the prompt and re-prompt messages.
    // PromptOptions also contains the list of choices available to the user.
    const options = {
      prompt: basicText.quoteOption,
      retryPrompt: "That was not a valid choice,",
      choices: this.quoteOption()
    };

    // Prompt the user with the configured PromptOptions.
    return await stepContext.prompt("cardPrompt", options);
    // return CardFactory.adaptiveCard(AdaptiveCard);
  }

  async finalStep(stepContext) {
    console.log("finalstep");
    // If the child dialog ("bookingDialog") was cancelled or the user failed to confirm, the Result here will be null.
    if (stepContext.result) {
      const result = stepContext.result;
      return await stepContext.replaceDialog(this.initialDialogId, {
        restartMsg: "What else can I do for you?"
      });
    } else {
      console.log("ended main dialog"); 
      await stepContext.context.sendActivity(basicText.havegreat2);
      return await stepContext.endDialog();
    }

    // Restart the main dialog with a different message the second time around
    //  return await stepContext.replaceDialog(this.initialDialogId, { restartMsg: 'What else can I do for you?' });
  }

  // ======================================
  // Helper functions used to create cards.
  // ======================================

  createAdaptiveCard() {
    return CardFactory.adaptiveCard(AdaptiveCard);
  }

  createAnimationCard() {
    return CardFactory.animationCard(
      "Microsoft Bot Framework",
      [{ url: "https://i.giphy.com/Ki55RUbOV5njy.gif" }],
      [],
      {
        subtitle: "Animation Card"
      }
    );
  }

  createAudioCard() {
    return CardFactory.audioCard(
      "I am your father",
      [
        "https://www.mediacollege.com/downloads/sound-effects/star-wars/darthvader/darthvader_yourfather.wav"
      ],
      CardFactory.actions([
        {
          type: "openUrl",
          title: "Read more",
          value: "https://en.wikipedia.org/wiki/The_Empire_Strikes_Back"
        }
      ]),
      {
        subtitle: "Star Wars: Episode V - The Empire Strikes Back",
        text:
          "The Empire Strikes Back (also known as Star Wars: Episode V – The Empire Strikes Back) is a 1980 American epic space opera film directed by Irvin Kershner. Leigh Brackett and Lawrence Kasdan wrote the screenplay, with George Lucas writing the film's story and serving as executive producer. The second installment in the original Star Wars trilogy, it was produced by Gary Kurtz for Lucasfilm Ltd. and stars Mark Hamill, Harrison Ford, Carrie Fisher, Billy Dee Williams, Anthony Daniels, David Prowse, Kenny Baker, Peter Mayhew and Frank Oz.",
        image:
          "https://upload.wikimedia.org/wikipedia/en/3/3c/SW_-_Empire_Strikes_Back.jpg"
      }
    );
  }

  createHeroCard() {
    return CardFactory.heroCard(
      "BotFramework Hero Card",
      CardFactory.images([
        "https://sec.ch9.ms/ch9/7ff5/e07cfef0-aa3b-40bb-9baa-7c9ef8ff7ff5/buildreactionbotframework_960.jpg"
      ]),
      CardFactory.actions([
        {
          type: "openUrl",
          title: "Get started",
          value: "https://docs.microsoft.com/en-us/azure/bot-service/"
        }
      ])
    );
  }

  createReceiptCard() {
    return CardFactory.receiptCard({
      title: "John Doe",
      facts: [
        {
          key: "Order Number",
          value: "1234"
        },
        {
          key: "Payment Method",
          value: "VISA 5555-****"
        }
      ],
      items: [
        {
          title: "Data Transfer",
          price: "$38.45",
          quantity: 368,
          image: {
            url:
              "https://github.com/amido/azure-vector-icons/raw/master/renders/traffic-manager.png"
          }
        },
        {
          title: "App Service",
          price: "$45.00",
          quantity: 720,
          image: {
            url:
              "https://github.com/amido/azure-vector-icons/raw/master/renders/cloud-service.png"
          }
        }
      ],
      tax: "$7.50",
      total: "$90.95",
      buttons: CardFactory.actions([
        {
          type: "openUrl",
          title: "More information",
          value:
            "https://azure.microsoft.com/en-us/pricing/details/bot-service/"
        }
      ])
    });
  }

  createSignInCard() {
    return CardFactory.signinCard(
      "BotFramework Sign in Card",
      "https://login.microsoftonline.com",
      "Sign in"
    );
  }

 

  createVideoCard() {
    return CardFactory.videoCard(
      "2018 Imagine Cup World Championship Intro",
      [
        {
          url:
            "https://sec.ch9.ms/ch9/783d/d57287a5-185f-4df9-aa08-fcab699a783d/IC18WorldChampionshipIntro2.mp4"
        }
      ],
      [
        {
          type: "openUrl",
          title: "Lean More",
          value:
            "https://channel9.msdn.com/Events/Imagine-Cup/World-Finals-2018/2018-Imagine-Cup-World-Championship-Intro"
        }
      ],
      {
        subtitle: "by Microsoft",
        text:
          "Microsoft's Imagine Cup has empowered student developers around the world to create and innovate on the world stage for the past 16 years. These innovations will shape how we live, work and play."
      }
    );
  }
}

module.exports.MainDialog = MainDialog;
