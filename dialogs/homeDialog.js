// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const {
  TimexProperty
} = require("@microsoft/recognizers-text-data-types-timex-expression");
const {
  InputHints,
  MessageFactory,
  ActivityHandler,
  CardFactory
} = require("botbuilder");
const {
  ConfirmPrompt,
  TextPrompt,
  WaterfallDialog
} = require("botbuilder-dialogs");
const { CancelAndHelpDialog } = require("./cancelAndHelpDialog");
const { DateResolverDialog } = require("./dateResolverDialog");

const { basicText } = require("../resources/basicText");
const CONFIRM_PROMPT = "confirmPrompt";
const DATE_RESOLVER_DIALOG = "dateResolverDialog";
const TEXT_PROMPT = "textPrompt";
const WATERFALL_DIALOG = "waterfallDialog";

const { capitalize } = require("../functions");

class homeDialog extends CancelAndHelpDialog {
  constructor(id) {
    super(id || "homeDialog");
    global.currentState = "HOME";

    this.addDialog(new TextPrompt(TEXT_PROMPT))
      .addDialog(new ConfirmPrompt(CONFIRM_PROMPT))
      .addDialog(new DateResolverDialog(DATE_RESOLVER_DIALOG))
      .addDialog(
        new WaterfallDialog(WATERFALL_DIALOG, [
          this.propertyType.bind(this),
          this.propertyLocation.bind(this),
          this.coverageStep.bind(this),
          this.securitySystem.bind(this),
          this.livesWithYou.bind(this),
          this.confirmStep.bind(this),
          this.getName.bind(this),
          this.getEmail.bind(this),
          this.finalStep1.bind(this)

        ])
      );

    this.initialDialogId = WATERFALL_DIALOG;
  }

  /**
   * If a destination city has not been provided, prompt for one.
   */
  async propertyType(stepContext) {  



    const bookingDetails = stepContext.options;
    await stepContext.context.sendActivity(basicText.homeGreet1);
    await stepContext.context.sendActivity(basicText.homeGreet2);
    console.log("propertyType. step");

    // Create the PromptOptions which contain the prompt and re-prompt messages.
    // PromptOptions also contains the list of choices available to the user.
    const options = {
      prompt: basicText.propertyType,
      retryPrompt: "That was not a valid choice,",
      choices: this.choosePropertyType()
    };

    // Prompt the user with the configured PromptOptions.
    return await stepContext.prompt("cardPrompt", options);
  }

  async propertyLocation(stepContext) {
    console.log("locationn property  step");
    const bookingDetails = stepContext.options;
    bookingDetails.homePropertyType = stepContext.result.value;

    // Capture the response to the previous step's prompt
    if (!bookingDetails.homePropertyLocation) {
      const messageText = basicText.propertyLocation;
      const msg = MessageFactory.text(
        messageText,
        messageText,
        InputHints.ignoringInput
      );
      return await stepContext.prompt(TEXT_PROMPT, { prompt: msg });
    }
    return await stepContext.next(bookingDetails.homePropertyLocation);
  }

  async coverageStep(stepContext) {
    console.log("MainDialog.coverage step");
    const bookingDetails = stepContext.options; 
    bookingDetails.homePropertyLocation = stepContext.result;
    console.log(bookingDetails);
    // Create the PromptOptions which contain the prompt and re-prompt messages.
    // PromptOptions also contains the list of choices available to the user.
    const options = {
      prompt: basicText.coverageNeed,
      retryPrompt: "That was not a valid choice,",
      choices: this.chooseCoverage()
    };

    // Prompt the user with the configured PromptOptions.
    return await stepContext.prompt("cardPrompt", options);
  }


  async securitySystem(stepContext) {
    console.log("ss  step");
    const bookingDetails = stepContext.options;
    bookingDetails.homePropertyType = stepContext.result.value;

    // Capture the response to the previous step's prompt
    if (!bookingDetails.homeSecurity) {
      const messageText = basicText.ss;
      const msg = MessageFactory.text(
        messageText,
        messageText,
        InputHints.ExpectingInput
      );
      return await stepContext.prompt(TEXT_PROMPT, { prompt: msg });
    }
    return await stepContext.next(bookingDetails.homeSecurity);
  }

  async livesWithYou(stepContext) {
    console.log("MainDialog.coverage step");

    const bookingDetails = stepContext.options;
    bookingDetails.homeSecurity = stepContext.result;

    // Create the PromptOptions which contain the prompt and re-prompt messages.
    // PromptOptions also contains the list of choices available to the user.
    const options = {
      prompt: basicText.livesyou,
      retryPrompt: "That was not a valid choice,",
      choices: this.chooseLives()
    };

    // Prompt the user with the configured PromptOptions.
    return await stepContext.prompt("cardPrompt", options);
  }

  async confirmStep(stepContext) {
    const bookingDetails = stepContext.options;

    await stepContext.context.sendActivity(basicText.livesGreet);
    // Capture the results of the previous step
    bookingDetails.homeLivesWithYou = stepContext.result.value;
    const messageText = basicText.fillClaim;
    const msg = MessageFactory.text(
      messageText,
      messageText,
      InputHints.ExpectingInput
    );

    // Offer a YES/NO prompt.
    return await stepContext.prompt(CONFIRM_PROMPT, { prompt: msg });
  }

  async getName(stepContext) {
    console.log(" name  step");
    const bookingDetails = stepContext.options;

    // Capture the response to the previous step's prompt
    bookingDetails.pastClaim = stepContext.result;
    if (!bookingDetails.Name) {
      const messageText = basicText.name;
      const msg = MessageFactory.text(
        messageText,
        messageText,
        InputHints.ExpectingInput
      );
      return await stepContext.prompt(TEXT_PROMPT, { prompt: msg });
    }
    return await stepContext.next(bookingDetails.Name);
  }

  async getEmail(stepContext) {
    console.log("get email  type");
    const bookingDetails = stepContext.options;
    bookingDetails.Name = stepContext.result;
    await stepContext.context.sendActivity('Give me a moment '+capitalize(bookingDetails.Name)+', Let me prepare a quick quote for you');
    await stepContext.context.sendActivity({
      attachments: [this.createReceiptCard(stepContext)]
    });

    if (!bookingDetails.Email) {
      const messageText = basicText.askEmail;
      const msg = MessageFactory.text(
        messageText,
        messageText,
        InputHints.ExpectingInput
      ); 
      return await stepContext.prompt(TEXT_PROMPT, { prompt: msg });
    }

    return await stepContext.next(bookingDetails.Email);
  }

  async finalStep1(stepContext) {
    console.log('final');
    const bookingDetails = stepContext.options;
    bookingDetails.Email = stepContext.result; 
    console.log(bookingDetails);
    return await stepContext.endDialog(bookingDetails);
  }

  /**
   * If an origin city has not been provided, prompt for one.
   */

  /**
   * If a travel date has not been provided, prompt for one.
   * This will use the DATE_RESOLVER_DIALOG.
   */
  async travelDateStep(stepContext) {
    const bookingDetails = stepContext.options;
    await stepContext.context.sendActivity(basicText.homeGreet1);
    await stepContext.context.sendActivity(basicText.homeGreet2);

    // Capture the results of the previous step
    bookingDetails.origin = stepContext.result;
    if (
      !bookingDetails.travelDate ||
      this.isAmbiguous(bookingDetails.travelDate)
    ) {
      return await stepContext.beginDialog(DATE_RESOLVER_DIALOG, {
        date: bookingDetails.travelDate
      });
    }
    return await stepContext.next(bookingDetails.travelDate);
  }

  /**
   * Confirm the information the user has provided.
   */

  chooseCoverage() {
    const cardOptions = [
      {
        value: basicText.c1,
        synonyms: ["adaptive"]
      },
      {
        value: basicText.c2,
        synonyms: ["animation"]
      },
      {
        value: basicText.c3,
        synonyms: ["audio"]
      },
      {
        value: basicText.c4,
        synonyms: ["audio"]
      }
    ];

    return cardOptions;
  }

  chooseLives() {
    const cardOptions = [
      {
        value: basicText.jm,
        synonyms: ["adaptive"]
      },
      {
        value: basicText.mp,
        synonyms: ["animation"]
      },
      {
        value: basicText.pak,
        synonyms: ["audio"]
      },
      {
        value: basicText.mk,
        synonyms: ["audio"]
      }
    ];

    return cardOptions;
  }

  chooseSecurity() {
    const cardOptions = [
      {
        value: basicText.balr,
        synonyms: ["adaptive"]
      },
      {
        value: basicText.sc,
        synonyms: ["animation"]
      }
    ];

    return cardOptions;
  }

  createReceiptCard(stepContext) {
    const bookingDetails = stepContext.options;

    var name = bookingDetails.Name;
    return CardFactory.receiptCard({
      title: capitalize(name),  
      facts: [
      {
          key: capitalize(bookingDetails.homePropertyLocation) ,
          value:''
        },
        {
          key: "Quote Number - 12347",
          value: ""
        },
        {
          key: "Coverage selected for you",
          value: ""
        }
      ],
      items: [
        {
          title: "Structure",
          price: "$10.00"
        },
        {
          title: "Personal Property",
          price: "$10.00",
        },
        {
          title: "Portable Electronics",
          price: "$10.00",
        },
        {
          title:"Loss of Use",
          price:"$10.00"
        },
        {
          title:"Personal liability",
          price:"$10.00"
        },
        {
          title:"Medical Costs for Others",
          price:"$10.00"
        }
      ],
      tax: "$7.50",
      total: "$47.50"
    });
  }

  choosePropertyType() {
    const cardOptions = [
      {
        value: basicText.residential,
        synonyms: ["adaptive"]
      },
      {
        value: basicText.commercial1,
        synonyms: ["animation"]
      }
    ];

    return cardOptions;
  }

  /**
   * Complete the interaction and end the dialog.
   */
  async finalStep(stepContext) {
    if (stepContext.result === true) {
      const bookingDetails = stepContext.options;
      return await stepContext.endDialog(bookingDetails);
    }
    return await stepContext.endDialog();
  }

  isAmbiguous(timex) {
    const timexPropery = new TimexProperty(timex);
    return !timexPropery.types.has("definite");
  }
}

module.exports.homeDialog = homeDialog;
