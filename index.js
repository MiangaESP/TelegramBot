//Requires
require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const axios = require('axios')
const fs = require('fs')
const FormData = require('form-data');
const cron = require('node-cron')

//Declare constants
const { TOKEN, SERVER_URL } = process.env //Make sure token and url are set on env file
const TELEGRAM_API = `https://api.telegram.org/bot${TOKEN}`
const URI = `/webhook/${TOKEN}`
const WEBHOOK_URL = SERVER_URL + URI
const app = express()
const port = 5000

app.use(bodyParser.json())

//Init Webhook
const init = async () => {
    const res = await axios.get(`${TELEGRAM_API}/setWebhook?url=${WEBHOOK_URL}`)
}

//We get all the posts from Telegram/Webhook
app.post(URI, async (req, res) => {
    var chatId = 0
    //Check if request is not new member in group or that a member has left group
    if (req.body.message.new_chat_member == null 
        && req.body.message.left_chat_member == null) {
        chatId = req.body.message.chat.id //Save chatID
        var text = '' //Declare text variable
        text = ProcessText(req.body.message.text) //Process text if it's personalized response

        const ImageData = ConsiderImage(text, chatId) //Check if text indicates we need to send an image
        const DataSchedule = ConsiderSchedule(text) //Check if text indicates we need to create a reminder
        
        if (ImageData != null) {//Send an image
            await axios.post(`${TELEGRAM_API}/sendPhoto`, ImageData, {
                headers: ImageData.getHeaders
            }).then((response) => {
                console.log(response)
            }).catch((error) => {
                console.log(error.message)
            })
        }
        else if (DataSchedule != null) { //Program a message given a date and text
            cron.schedule(`5 ${DataSchedule.min} ${DataSchedule.hour} 
            ${DataSchedule.day} ${DataSchedule.month} *`, () => {
                axios.post(`${TELEGRAM_API}/sendMessage`, {
                    chat_id: chatId,
                    text: DataSchedule.text,
                }).then((response) => {
                    console.log(response)
                }).catch((error) => {
                    console.log(error.message)
                })
            })
        } 
        else { //If it's not a photo nor reminder, send a copy of the message
            await axios.post(`${TELEGRAM_API}/sendMessage`, {
                chat_id: chatId,
                text: text,
            }).then((response) => {
                console.log(response)
            }).catch((error) => {
                console.log(error.message)
            })
        }
    }
    return res.send()
})

process.on('unhandledRejection', error => {
    console.log('unhandledRejection', error.message);
});

//Function to process message text and return a personalized response if needed
function ProcessText(originalText) {
    const PERSONALIZED_RESPONSES = { //Hash with possible responses
        ping: 'pong',
        'How are you?': 'I\'m fine',
        'What\'s your name?': 'My name is Mianga_bot'
    }
    //Return same text if it doesn't have a personalized response
    return PERSONALIZED_RESPONSES[originalText] || originalText
}

//Function to chet if an image exists and return the form data
function ConsiderImage(text, chatId) {
    const formData = new FormData();
    var path = ''
    //Check if image exists with formats jpg,jpeg or png
    if (fs.existsSync(`./images/${text}.jpg`)) {
        path = `./images/${text}.jpg`
    } else if (fs.existsSync(`./images/${text}.jpeg`)) {
        path = `./images/${text}.jpeg`
    } else if (fs.existsSync(`./images/${text}.png`)) {
        path = `./images/${text}.png`
    }
    if (path != '') { //Add chatID and photo to the form
        formData.append('chat_id', chatId);
        formData.append('photo', fs.createReadStream(path));
        return formData
    }
    return null
}

//Function that creates the schedule of a reminder given text
function ConsiderSchedule(text) {
    var schedule = { min: 0, hour: 0, day: 0, month: 0, text: 'a' } //Create schedule
    if (text.startsWith('Reminder')) { //Check if it's a reminder
        const textSplit = text.match(/("[^"]*")|[^ ]+/g) //Separate the sentence into strings

        if (textSplit.length < 4) { // Check if structure is correct (4 words)
            return null
        }

        const date = textSplit[2].split("-") //Separate the date (day-month-year)
        const hourMin = textSplit[3].split(":") //Separate the hour (hour:min)

        if (textSplit[1].startsWith('"') && textSplit[1].endsWith('"') &&
            date.length == 3 && hourMin.length == 2) { //Minimum check of each part
            //Set the data on schedule
            schedule.text = textSplit[1] 
            schedule.min = hourMin[1]
            schedule.hour = hourMin[0]
            schedule.day = date[0]
            schedule.month = date[1]

            return schedule
        }
    }

    return null
}
//Run app on localhost:5000, make sure wenhook is on same port
app.listen(process.env.PORT || port, async () => {
    console.log('app running on port', process.env.PORT || port)
    await init()
})