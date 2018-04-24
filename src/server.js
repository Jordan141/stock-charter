const express = require('express')
const PORT = process.env.PORT || 8080
//@ts-ignore
const API_KEY = process.env.API_KEY || require('./config.json').API_KEY
const fetch = require('node-fetch')
const bodyParser = require('body-parser')
const app = express()
const server = require('http').createServer(app)
const io = require('socket.io').listen(server)
const errorCodes = require('./errorCodes')
const ADD_STOCK = 'add_stock', REMOVE_STOCK = 'remove_stock', NEW_STOCK = 'new_stock', INVALID_STOCK = 'invalid_stock'

app.use(bodyParser.urlencoded({extended: true}))
app.use(express.static(__dirname + '/public'))

let stocks = ['GE', 'AAPL']

app.get('/', (req, res) => {
    res.send('/')
})

app.post('/', (req, res) => {
    const id = req.body.id
    const url = `https://www.quandl.com/api/v3/datasets/WIKI/${id}/data.json?api_key=${API_KEY}`
    //@ts-ignore
    fetch(url).then(y => y.json())
    .then(results => res.send(results))
})

function notifyUsers(socket, tag, data){
    socket.emit(tag, data)
    socket.broadcast.emit(tag, data)
}

io.on('connection', socket => {
    socket.on('join', function(data) {
        socket.emit(NEW_STOCK, stocks);
    });
    socket.on(ADD_STOCK, function(data){
        if(data){
            console.log(ADD_STOCK, 'Accepted', data)
            stocks.push(data)
            notifyUsers(socket, NEW_STOCK, stocks)
        } else {
            console.log(INVALID_STOCK, data)
            socket.emit(INVALID_STOCK, data)
        }
    })
    socket.on(REMOVE_STOCK, function(data){
        if(data && stocks.includes(data)){
            stocks.splice(stocks.indexOf(data), 1)
            console.log(REMOVE_STOCK,"stocks", stocks)
            notifyUsers(socket, NEW_STOCK, stocks)
        } else {
            console.log(INVALID_STOCK, data)
            socket.emit(INVALID_STOCK, data)
        }
    })
})
  


server.listen(PORT)