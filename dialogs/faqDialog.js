// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const {
  TimexProperty
} = require("@microsoft/recognizers-text-data-types-timex-expression");
const {
  InputHints,
  MessageFactory,
  ActivityHandler,
  BotFrameworkAdapter,
  QnAMaker
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

const adapter = new BotFrameworkAdapter({
  appId: process.env.MicrosoftAppId,
  appPassword: process.env.MicrosoftAppPassword
});

class faqDialog extends CancelAndHelpDialog {
  constructor(id) {
    super(id || "faqDialog");

    this.addDialog(new TextPrompt(TEXT_PROMPT))
      .addDialog(new ConfirmPrompt(CONFIRM_PROMPT))
      .addDialog(new DateResolverDialog(DATE_RESOLVER_DIALOG))
      .addDialog(
        new WaterfallDialog(WATERFALL_DIALOG, [this.askQuestion.bind(this)])
      );

    this.initialDialogId = WATERFALL_DIALOG;
  }

  async askQuestion(stepContext) {
    global.currentState = "FAQ";
    const bookingDetails = stepContext.options;

    bookingDetails.drivingExp = stepContext.result;
    if (!bookingDetails.email) {
      const messageText =
        "Hey !! Ask me a question and I will try to answer it.";
      const msg = MessageFactory.text(
        messageText,
        messageText,
        InputHints.ExpectingInput
      );
      return await stepContext.prompt(TEXT_PROMPT, { prompt: msg });
    }

    return await stepContext.endDialog();
  }
  
  
  /**
   * Complete the interaction and end the dialog.
   */
  async finalStep1(stepContext) {
    if (stepContext.result === true) {
      const bookingDetails = stepContext.options;
      return await stepContext.endDialog(bookingDetails);
    }
    return await stepContext.endDialog();
  }
}

module.exports.faqDialog = faqDialog;
