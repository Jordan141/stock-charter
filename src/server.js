const express = require('express')
const PORT = process.env.PORT || 8080
const API_KEY = process.env.API_KEY || require('./config.json').API_KEY
const fetch = require('node-fetch')
const bodyParser = require('body-parser')
const cts = require('check-ticker-symbol')
const app = express()
const server = require('http').createServer(app)
const io = require('socket.io').listen(server)
const ADD_STOCK = 'add_stock', REMOVE_STOCK = 'remove_stock', NEW_STOCK = 'new_stock', INVALID_STOCK = 'invalid_stock'

app.use(bodyParser.urlencoded({extended: true}))
app.use(express.static(__dirname + '/public'))

console.log(API_KEY)

let stocks = ['GE', 'AAPL']

app.get('/', (req, res) => {
    res.send('/')
})

app.post('/', (req, res) => {
    const id = req.body.id
    fetch(`https://www.quandl.com/api/v3/datasets/WIKI/${id}/data.json?api_key=${API_KEY}`).then(response =>response.json())
    .then(data => res.send(data))
    .catch(err => res.send(err))

})
function validateSymbol(symbol){
    return cts.valid(symbol)
}

io.on('connection', socket => {
    socket.on('join', function(data) {
        console.log('Join:', data);
        socket.emit(NEW_STOCK, stocks);
    });
    socket.on(ADD_STOCK, function(data){
        console.log(ADD_STOCK, data)
        if(validateSymbol(data)){
            stocks.push(data)
            socket.broadcast.emit(NEW_STOCK, stocks)
        } else {
            socket.emit(INVALID_STOCK, data)
        }
    })
    socket.on(REMOVE_STOCK, function(data){
        console.log(REMOVE_STOCK, data)
        if(validateSymbol(data) && stocks.includes(data)){
            stocks.splice(stocks.indexOf(data), 1)
            socket.broadcast.emit(NEW_STOCK, stocks)
        } else {
            socket.emit(INVALID_STOCK, data)
        }
    })
})
  


server.listen(PORT)