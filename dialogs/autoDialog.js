// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const {
  TimexProperty
} = require("@microsoft/recognizers-text-data-types-timex-expression");
const {
  InputHints,
  MessageFactory,
  ActivityHandler,
  CardFactory,
  AttachmentLayoutTypes
} = require("botbuilder");
const {
  ConfirmPrompt,
  TextPrompt, 
  NumberPrompt,
  WaterfallDialog
} = require("botbuilder-dialogs");
const { CancelAndHelpDialog } = require("./cancelAndHelpDialog");
const { DateResolverDialog } = require("./dateResolverDialog");

const { capitalize,emailValid } = require("../functions");

const { basicText } = require("../resources/basicText");
const CONFIRM_PROMPT = "confirmPrompt";
const DATE_RESOLVER_DIALOG = "dateResolverDialog";
const TEXT_PROMPT = "textPrompt";
const WATERFALL_DIALOG = "waterfallDialog"; 
const EMAIL_PROMPT = "emailPrompt"; 

class autoDialog extends CancelAndHelpDialog {
  constructor(id) {
    super(id || "autoDialog");
    global.currentState = "AUTO";

    this.addDialog(new TextPrompt(TEXT_PROMPT))
      .addDialog(new ConfirmPrompt(CONFIRM_PROMPT))
      .addDialog(new TextPrompt(EMAIL_PROMPT,emailValid))
      .addDialog(new DateResolverDialog(DATE_RESOLVER_DIALOG))
      .addDialog(
        new WaterfallDialog(WATERFALL_DIALOG, [
          this.travelDateStep.bind(this),
          this.autoName.bind(this),
          this.autoMake.bind(this),
          this.autoUse.bind(this),
          this.autoStatus.bind(this),
          this.getName.bind(this),
          this.quoteShow.bind(this),
          this.viewQuote.bind(this),
            this.getEmail.bind(this),
          this.finalStep1.bind(this)
        ])
      ); 

    this.initialDialogId = WATERFALL_DIALOG;
  } 

   

   
  async travelDateStep(stepContext) {
    console.log("auto init");  

    const bookingDetails = stepContext.options;
    await stepContext.context.sendActivity(basicText.autoGreet2);

    // Capture the results of the previous step
    bookingDetails.origin = stepContext.result;
    if (
      !bookingDetails.travelDate1 ||
      this.isAmbiguous(bookingDetails.travelDate1)
    ) {
      return await stepContext.beginDialog(DATE_RESOLVER_DIALOG, {
        date1: bookingDetails.travelDate1,
        id: 1
      });
    }
    return await stepContext.next(bookingDetails.autoDate);
  }

  async autoName(stepContext) {
    console.log("auto Name   step");
    const bookingDetails = stepContext.options;

    // await stepContext.context.sendActivity(basicText.quoteGreet);

    // Capture the response to the previous step's prompt
    bookingDetails.autoDate = stepContext.result;
    if (!bookingDetails.autoName) {
      const messageText = basicText.autoname;
      const msg = MessageFactory.text(
        messageText,
        messageText,
        InputHints.ExpectingInput
      );
      return await stepContext.prompt(TEXT_PROMPT, { prompt: msg });
    }
    return await stepContext.next(bookingDetails.autoName);
  }

  async autoMake(stepContext) {
    console.log("auto make of year   step");
    const bookingDetails = stepContext.options;
    console.log(bookingDetails);

    // Capture the response to the previous step's prompt
    bookingDetails.autoName = stepContext.result;
    if (!bookingDetails.autoMake) {
      const messageText = basicText.autoMake;
      const msg = MessageFactory.text(
        messageText,
        messageText,
        InputHints.ExpectingInput
      );
      return await stepContext.prompt(TEXT_PROMPT, { prompt: msg });
    }
    return await stepContext.next(bookingDetails.autoMake);
  }

  async autoUse(stepContext) {
    const bookingDetails = stepContext.options;
    bookingDetails.autoMake = stepContext.result;

    console.log(" auto use  step");

    // Create the PromptOptions which contain the prompt and re-prompt messages.
    // PromptOptions also contains the list of choices available to the user.
    const options = {
      prompt: basicText.autoPurpose,
      retryPrompt: "That was not a valid choice,",
      choices: this.choosePropertyType1()
    };

    // Prompt the user with the configured PromptOptions.
    return await stepContext.prompt("cardPrompt", options);
  }

  async autoStatus(stepContext) {
    console.log(" auto status own or lease  step");

    const bookingDetails = stepContext.options;
    bookingDetails.autoUse = stepContext.result.value;

    // Create the PromptOptions which contain the prompt and re-prompt messages.
    // PromptOptions also contains the list of choices available to the user.
    const options = {
      prompt: basicText.autoStatus,
      retryPrompt: "That was not a valid choice,",
      choices: this.chooseAutoStatus()
    };

    // Prompt the user with the configured PromptOptions.
    return await stepContext.prompt("cardPrompt", options);
  }


  /**
   * If a destination city has not been provided, prompt for one.
   */
  async getName(stepContext) {
    console.log("get name  type");
    const bookingDetails = stepContext.options;

    bookingDetails.autoStatus = stepContext.result.value;
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

  
  async quoteShow(stepContext) {
    const bookingDetails = stepContext.options;
    bookingDetails.Name = stepContext.result;


    var quoteshow="Thanks, here are three plans we have for you.";

    await stepContext.context.sendActivity(quoteshow);

    await stepContext.context.sendActivity({ attachments: [
                    this.createThumbnailCard(),
                    this.createThumbnailCard1(),
                    this.createThumbnailCard2(),
      ], attachmentLayout: AttachmentLayoutTypes.Carousel });

         
      return await stepContext.prompt(TEXT_PROMPT, { prompt: '' });

  
  } 
 
  async viewQuote(stepContext) {
    console.log("view quote step");  

    const bookingDetails = stepContext.options; 

console.log(stepContext.result);
console.log(stepContext.result.value);
    bookingDetails.quoteShow = stepContext.result;  
    console.log(bookingDetails.quoteShow);

    await stepContext.context.sendActivity('Give me a moment '+capitalize(bookingDetails.Name)+', Let me prepare a quick quote for you');
 
    await stepContext.context.sendActivity({
      attachments: [this.createReceiptCard(stepContext)]
    });

    return await stepContext.next(bookingDetails);
  }  


    createThumbnailCard() {
    return CardFactory.thumbnailCard(
      "Basic",
      [
        {
          url:
            ""
        }
      ],
      [
        { 
           "type": "imBack",
    "title": "Select",
     "value":"Basic"
        }
      ],
      {
        subtitle: "Starts at: $35 a month",
        text:
          "(Includes 3 coverages required as per law in your state)"
      }
    )

  } 

  createThumbnailCard1() {
    return CardFactory.thumbnailCard(
      "Classic",
      [
        {
          url:
            ""
        }
      ],
      [
        {
          type: "imBack",
          title: "Select",
          value: "Classic"
        }
      ],
      {
        subtitle: "Starts at: $47 a month",
        text:
          "(Includes Basic + 2 additional Coverages) \n\n"
      }
    );
  } 
  createThumbnailCard2() {
    return CardFactory.thumbnailCard(
      "Recommended",
      [
        {
          url:
            ""
        }
      ],
      [
        {
          type: "imBack",
          title: "Select",
          value: "Recommended"
        }
      ],
      {
        subtitle: "Starts at: $69 a month",
        text:
          "(Includes Basic + 5 additional coverages & Free additional drivers)"
      } 
    );
  }


  async getEmail(stepContext) {
    console.log("get email  type");
    const bookingDetails = stepContext.options; 

    if (!bookingDetails.Email) {
      const messageText = basicText.askEmail; 
    
      const promptOptions = { prompt: basicText.askEmail, retryPrompt: basicText.retryEmailPrompt };
 
      return await stepContext.prompt(EMAIL_PROMPT, promptOptions);
    }
    return await stepContext.next(bookingDetails.Email);
  }  


  async finalStep1(stepContext) { 

    const bookingDetails = stepContext.options;
    bookingDetails.Email = stepContext.result;
    return await stepContext.endDialog(bookingDetails);

  }


 

 
 
  createReceiptCard(stepContext) {
    const bookingDetails = stepContext.options;
    var name = bookingDetails.Name;
    var quote = bookingDetails.quoteShow;   
    if(quote == "Basic") 
    var list = basicText.Basic;
  else if(quote == "Classic")
    var list = basicText.Classic;
  else if(quote == "Recommended")
    var list = basicText.Recommended;
    return CardFactory.receiptCard({
      title: capitalize(name),  
      facts: [
        {
          key: "Quote Number",
          value: "1234"
        },
        {
          key: "Coverage selected for you",
          value: ""
        }
      ],
      items: list ,
      tax: "$7.50",
      total: "$47.50"
    });
  }


  async getPhone(stepContext) {
    console.log("get phone  type");
    const bookingDetails = stepContext.options;

    bookingDetails.quoteName = stepContext.result;
    if (!bookingDetails.phone) {
      const messageText = basicText.autofinal;
      const msg = MessageFactory.text(
        messageText,
        messageText,
        InputHints.ExpectingInput
      );
      return await stepContext.prompt(NUMBER_PROMPT, { prompt: msg });
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
        synonyms: ["adaptive"]
      },
      {
        value: basicText.commercial,
        synonyms: ["animation"]
      },
      {
        value: basicText.business,
        synonyms: ["adaptive"]
      },
      {
        value: basicText.farming,
        synonyms: ["animation"]
      }
    ];

    return cardOptions;
  }

  chooseQuoteStatus() {
    const cardOptions = [
      {
        value: "Basic",
        synonyms: ["adaptive"]
      },
      {
        value: "Choice",
        synonyms: ["animation"]
      },
      {
        value: "Recommended",
        synonyms: ["animation"]
      }
    ];

    return cardOptions;
  }

  chooseAutoStatus() {
    const cardOptions = [
      {
        value: basicText.finance,
        synonyms: ["adaptive"]
      },
      {
        value: basicText.lease,
        synonyms: ["animation"]
      },
      {
        value: basicText.own,
        synonyms: ["animation"]
      }
    ];

    return cardOptions;
  }

  /**
   * Complete the interaction and end the dialog.
   */

  isAmbiguous(timex) {
    const timexPropery = new TimexProperty(timex);
    return !timexPropery.types.has("definite");
  }
}

module.exports.autoDialog = autoDialog;
