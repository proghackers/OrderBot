var express = require('express');
var config = require('config');
var request = require('request');
var router = express.Router();

/*
 * Be sure to setup your config values before running this code. You can
 * set them using environment variables or modifying the config file in /config.
 *
 */

// App Secret can be retrieved from the App Dashboard
var APP_SECRET = config.get('appSecret');

// Arbitrary value used to validate a webhook
var VALIDATION_TOKEN = config.get('validationToken');

// Generate a page access token for your page from the App Dashboard
var PAGE_ACCESS_TOKEN = config.get('pageAccessToken');

// URL where the app is running (include protocol). Used to point to scripts and
// assets located at this address.
var SERVER_URL = config.get('serverURL');

// Various type of entities available in our nlp.
var GREETINGS = "greetings";
var WIT_FOOD_ITEM = "wit_food_item";
var INTENT = "intent";

// Various payloads defined in the system
var PAYLOAD_SHOW_MENU = "show_menu";

/*
 * Use your own validation token. Check that the token used in the Webhook
 * setup is the same token used here.
 *
 */
router.get('/webhook', function(req, res) {
    if (req.query['hub.mode'] === 'subscribe' &&
        req.query['hub.verify_token'] === VALIDATION_TOKEN) {
        console.log("Validating webhook");
        res.status(200).send(req.query['hub.challenge']);
    } else {
        console.error("Failed validation. Make sure the validation tokens match.");
        res.sendStatus(403);
    }
});


/*
 * All callbacks for Messenger are POST-ed. They will be sent to the same
 * webhook. Be sure to subscribe your app to your page to receive callbacks
 * for your page.
 * https://developers.facebook.com/docs/messenger-platform/product-overview/setup#subscribe_app
 *
 */
router.post('/webhook', function(req, res) {
    var data = req.body;

    // Make sure this is a page subscription
    if (data.object == 'page') {
        // Iterate over each entry
        // There may be multiple if batched
        data.entry.forEach(function(pageEntry) {
            var pageID = pageEntry.id;
            var timeOfEvent = pageEntry.time;

            // Iterate over each messaging event
            pageEntry.messaging.forEach(function(messagingEvent) {
                if (messagingEvent.message) {
                    receivedMessage(messagingEvent);
                } else if (messagingEvent.postback) {
                    receivedPostback(messagingEvent);
                } else {
                    console.log("Webhook received unknown messagingEvent: ", messagingEvent);
                }
            });
        });

        // Assume all went well.
        //
        // You must send back a 200, within 20 seconds, to let us know you've
        // successfully received the callback. Otherwise, the request will time out.
        res.sendStatus(200);
    }
});

/*
 * Postback Event
 *
 * This event is called when a postback is tapped on a Structured Message.
 * https://developers.facebook.com/docs/messenger-platform/webhook-reference/postback-received
 *
 */
function receivedPostback(event) {
    var senderID = event.sender.id;
    var recipientID = event.recipient.id;
    var timeOfPostback = event.timestamp;

    // The 'payload' param is a developer-defined field which is set in a postback
    // button for Structured Messages.
    var payload = event.postback.payload;

    console.log("Received postback for user %d and page %d with payload '%s' " + "at %d", senderID, recipientID, payload, timeOfPostback);
    if (payload === PAYLOAD_SHOW_MENU) {
        showMenu(senderID);
    }

    // When a postback is called, we'll send a message back to the sender to
    // let them know it was successful
    //sendTextMessage(senderID, "Postback called");
}

/*
 * Message Event
 *
 * This event is called when a message is sent to your page. The 'message'
 * object format can vary depending on the kind of message that was received.
 * Read more at https://developers.facebook.com/docs/messenger-platform/webhook-reference/message-received
 *
 * For this example, we're going to echo any text that we get. If we get some
 * special keywords ('button', 'generic', 'receipt'), then we'll send back
 * examples of those bubbles to illustrate the special message bubbles we've
 * created. If we receive a message with an attachment (image, video, audio),
 * then we'll simply confirm that we've received the attachment.
 *
 */
function receivedMessage(event) {
    var senderID = event.sender.id;
    var recipientID = event.recipient.id;
    var timeOfMessage = event.timestamp;
    var message = event.message;

    console.log("Received message for user %d and page %d at %d with message:",
        senderID, recipientID, timeOfMessage);
    console.log(JSON.stringify(event));

    console.log(getUserName(senderID));



    var messageId = message.mid;
    var appId = message.app_id;
    var metadata = message.metadata;

    var entities = message.nlp.entities;

    var entityValues = Object.keys(entities);

    if (entityValues.includes(GREETINGS)) {
        sendWelcomeMessage(senderID);
    }

    // You may get a text or attachment but not both
    var messageText = message.text;

    // If we receive a text message, check to see if it matches any special
    // keywords and send back the corresponding example. Otherwise, just echo
    // the text we received.
    // switch (messageText) {
    //     case 'image':
    //         sendImageMessage(senderID);
    //         break;

    //     case 'gif':
    //         sendGifMessage(senderID);
    //         break;

    //     case 'button':
    //         sendButtonMessage(senderID);
    //         break;

    //     case 'generic':
    //         sendGenericMessage(senderID);
    //         break;

    //     case 'receipt':
    //         sendReceiptMessage(senderID);
    //         break;

    //     case 'quick reply':
    //         sendQuickReply(senderID);
    //         break;

    //     case 'read receipt':
    //         sendReadReceipt(senderID);
    //         break;

    //     case 'typing on':
    //         sendTypingOn(senderID);
    //         break;

    //     case 'typing off':
    //         sendTypingOff(senderID);
    //         break;

    //     case 'account linking':
    //         sendAccountLinking(senderID);
    //         break;

    //     default:
    //         sendTextMessage(senderID, messageText);
    // }
}

/*
 * Send an image using the Send API.
 *
 */
function sendImageMessage(recipientId) {
    var messageData = {
        recipient: {
            id: recipientId
        },
        message: {
            attachment: {
                type: "image",
                payload: {
                    url: SERVER_URL + "/assets/rift.png"
                }
            }
        }
    };

    callSendAPI(messageData);
}

/*
 * Send a Gif using the Send API.
 *
 */
function sendGifMessage(recipientId) {
    var messageData = {
        recipient: {
            id: recipientId
        },
        message: {
            attachment: {
                type: "image",
                payload: {
                    url: SERVER_URL + "/assets/instagram_logo.gif"
                }
            }
        }
    };

    callSendAPI(messageData);
}

/*
 * Send a text message using the Send API.
 *
 */
function sendTextMessage(recipientId, messageText) {
    var messageData = {
        recipient: {
            id: recipientId
        },
        message: {
            text: messageText,
            metadata: "DEVELOPER_DEFINED_METADATA"
        }
    };

    callSendAPI(messageData);
}

function sendWelcomeMessage(recipientId) {
    var messageData = {
        recipient: {
            id: recipientId
        },
        message: {
            attachment: {
                type: "template",
                payload: {
                    template_type: "button",
                    text: "Hi, Welcome to knowyourbites. We'll serve you with delicious foods.",
                    buttons: [{
                        type: "postback",
                        title: "OPEN MENU",
                        payload: "show_menu"
                    }, {
                        type: "phone_number",
                        title: "Call Us Now!",
                        payload: "+919582707795"
                    }]
                }
            }
        }
    };

    callSendAPI(messageData);
}

/*
 * Send a button message using the Send API.
 *
 */
function sendButtonMessage(recipientId) {
    var messageData = {
        recipient: {
            id: recipientId
        },
        message: {
            attachment: {
                type: "template",
                payload: {
                    template_type: "button",
                    text: "This is test text",
                    buttons: [{
                        type: "web_url",
                        url: "https://www.oculus.com/en-us/rift/",
                        title: "Open Web URL"
                    }, {
                        type: "postback",
                        title: "Trigger Postback",
                        payload: "DEVELOPER_DEFINED_PAYLOAD"
                    }, {
                        type: "phone_number",
                        title: "Call Phone Number",
                        payload: "+16505551234"
                    }]
                }
            }
        }
    };

    callSendAPI(messageData);
}

function showMenu(recipientId) {
    var messageData = {
        recipient: {
            id: recipientId
        },
        message: {
            attachment: {
                type: "template",
                payload: {
                    template_type: "list",
                    top_element_style: "compact",
                    elements: [{
                        title: "Classic Burger",
                        image_url: SERVER_URL + "/assets/burger.jpg",
                        subtitle: "Delicious Yet Healthy Still Tasty",
                        buttons: [{
                            type: "postback",
                            title: "Add to cart",
                            payload: "ORDER classic_burger restaurant1",
                        }]
                    }, {
                        title: "Chicken Biryani",
                        image_url: SERVER_URL + "/assets/chicken_biryani.jpg",
                        subtitle: "Super Awesome Chicken Biryani with all the spices you need in your life",
                        buttons: [{
                            type: "postback",
                            title: "Add to cart",
                            payload: "ORDER chicken_biryani restaurant1",
                        }]
                    }, {
                        title: "Grilled Chicken (with skin)",
                        image_url: SERVER_URL + "/assets/grilled_chicken.jpg",
                        subtitle: "OMG This is fucking grilled chicken",
                        buttons: [{
                            type: "postback",
                            title: "Add to cart",
                            payload: "ORDER classic_burger restaurant1",
                        }]
                    }, {
                        title: "Rasmalai",
                        image_url: SERVER_URL + "/assets/rasmalai.jpg",
                        subtitle: "Rasmalaiiiiii",
                        buttons: [{
                            type: "postback",
                            title: "Add to cart",
                            payload: "ORDER classic_burger restaurant1",
                        }]
                    }]
                }
            }
        }
    };

    callSendAPI(messageData);
}

/*
 * Send a Structured Message (Generic Message type) using the Send API.
 *
 */
function sendGenericMessage(recipientId) {
    var messageData = {
        recipient: {
            id: recipientId
        },
        message: {
            attachment: {
                type: "template",
                payload: {
                    template_type: "generic",
                    elements: [{
                        title: "rift",
                        subtitle: "Next-generation virtual reality",
                        item_url: "https://www.oculus.com/en-us/rift/",
                        image_url: SERVER_URL + "/assets/rift.png",
                        buttons: [{
                            type: "web_url",
                            url: "https://www.oculus.com/en-us/rift/",
                            title: "Open Web URL"
                        }, {
                            type: "postback",
                            title: "Call Postback",
                            payload: "Payload for first bubble",
                        }],
                    }, {
                        title: "touch",
                        subtitle: "Your Hands, Now in VR",
                        item_url: "https://www.oculus.com/en-us/touch/",
                        image_url: SERVER_URL + "/assets/touch.png",
                        buttons: [{
                            type: "web_url",
                            url: "https://www.oculus.com/en-us/touch/",
                            title: "Open Web URL"
                        }, {
                            type: "postback",
                            title: "Call Postback",
                            payload: "Payload for second bubble",
                        }]
                    }]
                }
            }
        }
    };

    callSendAPI(messageData);
}

/*
 * Send a receipt message using the Send API.
 *
 */
function sendReceiptMessage(recipientId) {
    // Generate a random receipt ID as the API requires a unique ID
    var receiptId = "order" + Math.floor(Math.random() * 1000);

    var messageData = {
        recipient: {
            id: recipientId
        },
        message: {
            attachment: {
                type: "template",
                payload: {
                    template_type: "receipt",
                    recipient_name: "Peter Chang",
                    order_number: receiptId,
                    currency: "USD",
                    payment_method: "Visa 1234",
                    timestamp: "1428444852",
                    elements: [{
                        title: "Oculus Rift",
                        subtitle: "Includes: headset, sensor, remote",
                        quantity: 1,
                        price: 599.00,
                        currency: "USD",
                        image_url: SERVER_URL + "/assets/riftsq.png"
                    }, {
                        title: "Samsung Gear VR",
                        subtitle: "Frost White",
                        quantity: 1,
                        price: 99.99,
                        currency: "USD",
                        image_url: SERVER_URL + "/assets/gearvrsq.png"
                    }],
                    address: {
                        street_1: "1 Hacker Way",
                        street_2: "",
                        city: "Menlo Park",
                        postal_code: "94025",
                        state: "CA",
                        country: "US"
                    },
                    summary: {
                        subtotal: 698.99,
                        shipping_cost: 20.00,
                        total_tax: 57.67,
                        total_cost: 626.66
                    },
                    adjustments: [{
                        name: "New Customer Discount",
                        amount: -50
                    }, {
                        name: "$100 Off Coupon",
                        amount: -100
                    }]
                }
            }
        }
    };

    callSendAPI(messageData);
}

/*
 * Send a message with Quick Reply buttons.
 *
 */
function sendQuickReply(recipientId) {
    var messageData = {
        recipient: {
            id: recipientId
        },
        message: {
            text: "What's your favorite movie genre?",
            quick_replies: [{
                    "content_type": "text",
                    "title": "Action",
                    "payload": "DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_ACTION"
                },
                {
                    "content_type": "text",
                    "title": "Comedy",
                    "payload": "DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_COMEDY"
                },
                {
                    "content_type": "text",
                    "title": "Drama",
                    "payload": "DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_DRAMA"
                }
            ]
        }
    };

    callSendAPI(messageData);
}

/*
 * Send a read receipt to indicate the message has been read
 *
 */
function sendReadReceipt(recipientId) {
    console.log("Sending a read receipt to mark message as seen");

    var messageData = {
        recipient: {
            id: recipientId
        },
        sender_action: "mark_seen"
    };

    callSendAPI(messageData);
}

/*
 * Turn typing indicator on
 *
 */
function sendTypingOn(recipientId) {
    console.log("Turning typing indicator on");

    var messageData = {
        recipient: {
            id: recipientId
        },
        sender_action: "typing_on"
    };

    callSendAPI(messageData);
}

/*
 * Turn typing indicator off
 *
 */
function sendTypingOff(recipientId) {
    console.log("Turning typing indicator off");

    var messageData = {
        recipient: {
            id: recipientId
        },
        sender_action: "typing_off"
    };

    callSendAPI(messageData);
}

/*
 * Send a message with the account linking call-to-action
 *
 */
function sendAccountLinking(recipientId) {
    var messageData = {
        recipient: {
            id: recipientId
        },
        message: {
            attachment: {
                type: "template",
                payload: {
                    template_type: "button",
                    text: "Welcome. Link your account.",
                    buttons: [{
                        type: "account_link",
                        url: SERVER_URL + "/authorize"
                    }]
                }
            }
        }
    };

    callSendAPI(messageData);
}

/*
 * Call the Send API. The message data goes in the body. If successful, we'll
 * get the message id in a response
 *
 */
function callSendAPI(messageData) {
    request({
        uri: 'https://graph.facebook.com/v2.6/me/messages',
        qs: { access_token: PAGE_ACCESS_TOKEN },
        method: 'POST',
        json: messageData

    }, function(error, response, body) {
        if (!error && response.statusCode == 200) {
            var recipientId = body.recipient_id;
            var messageId = body.message_id;

            if (messageId) {
                console.log("Successfully sent message with id %s to recipient %s",
                    messageId, recipientId);
            } else {
                console.log("Successfully called Send API for recipient %s",
                    recipientId);
            }
        } else {
            console.error("Failed calling Send API", response.statusCode, response.statusMessage, body.error);
        }
    });
}

function getUserName(userId) {
    request({
        uri: 'https://graph.facebook.com/v2.6/' + userId,
        qs: { access_token: PAGE_ACCESS_TOKEN },
        method: 'GET'
    }, function(error, response, body) {
        if (!error && response.statusCode == 200) {
            var userData = JSON.parse(body);
            console.log(body);
            return userData.first_name + ' ' + userData.last_name;
        } else {
            console.error("Failed fetching user info", userId, response.statusCode, response.statusMessage, body.error);
            return "";
        }
    });
}

module.exports = router;