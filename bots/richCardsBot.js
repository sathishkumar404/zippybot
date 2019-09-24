// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { MessageFactory, CardFactory, builder } = require("botbuilder");
const { DialogBot } = require("./dialogBot");
const { basicText } = require("../resources/basicText");

const WelcomeCard = require("../resources/welcomeCard.json");

/**
 * RichCardsBot prompts a user to select a Rich Card and then returns the card
 * that matches the user's selection.
 */
class RichCardsBot extends DialogBot {
  constructor(conversationState, userState, dialog) {
    super(conversationState, userState, dialog);

    this.onMembersAdded(async (context, next) => {
      const membersAdded = context.activity.membersAdded;
      for (let cnt = 0; cnt < membersAdded.length; cnt++) {
        if (membersAdded[cnt].id === context.activity.recipient.id) {
          const welcomeCard = CardFactory.adaptiveCard(WelcomeCard);

          await context.sendActivity({ attachments: [welcomeCard] });

          const reply = MessageFactory.text(basicText.welcome1);
          await context.sendActivity(reply);
          await context.sendActivity(basicText.welcome2);
          await dialog.run(
            context,
            conversationState.createProperty("DialogState")
          );
        }
      }

      // By calling next() you ensure that the next BotHandler is run.
      await next();
    });
  }

  createAnimationCard() {
    return CardFactory.animationCard(
      "Dryden Mutual Insurance",
      [{ url: "https://i.giphy.com/Ki55RUbOV5njy.gif" }],
      [],
      {
        subtitle: "Provide Superior Insurance"
      }
    );
  }
}

module.exports.RichCardsBot = RichCardsBot;
