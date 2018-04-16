const express = require('express')
const PORT = process.env.PORT || 8080
const API_KEY = process.env.API_KEY || require('./config.json').API_KEY
const fetch = require('node-fetch')
const ejs = require('ejs')
const bodyParser = require('body-parser')
const app = express()

app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({extended: true}))
app.use(express.static(__dirname + '/public'))

console.log(API_KEY)

app.get('/', (req, res) => {
   /* fetch('https://www.quandl.com/api/v3/datasets/WIKI/FB/data.json?api_key=' + API_KEY).then(response =>response.json())
    .then(data => res.send(data))
    .catch(err => res.send(err))*/
    res.send('/')
})

app.post('/', (req, res) => {
    const id = req.body.id
    fetch(`https://www.quandl.com/api/v3/datasets/WIKI/${id}/data.json?api_key=${API_KEY}`).then(response =>response.json())
    .then(data => res.send(data))
    .catch(err => res.send(err))

})


app.listen(PORT)