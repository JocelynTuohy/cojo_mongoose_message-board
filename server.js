// CONSTANTS
const express = require('express');
const path = require('path');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const PORT  = 8000;
// GENERAL CONFIGURATION
app.use(bodyParser.urlencoded({ extended: true }));
app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'ejs');
// MONGOOSE CONFIGURATION
mongoose.connect('mongodb://localhost/message_board');
mongoose.Promise = global.Promise;
let Schema = mongoose.Schema;
// MONGOOSE SCHEMAS/COLLECTIONS
let MessageSchema = new mongoose.Schema({
  firstName: { type: String, required: true, minlength: 4 },
  message: { type: String, required: true, minlength: 1 },
  _comments: [{ type: Schema.Types.ObjectId, ref: 'Comment'}]
}, {timestamps: true });
let CommentSchema = new mongoose.Schema({
  _message: {type: Schema.Types.ObjectId, ref: 'Message'},
  cfirstName: { type: String, required: true, minlength: 4 },
  comment: { type: String, required: true, minlength: 1 }
}, {timestamps: true});
mongoose.model('Message', MessageSchema);
mongoose.model('Comment', CommentSchema);
let Message = mongoose.model('Message');
let Comment = mongoose.model('Comment');
// VARIABLES
var errors = [];
// ROUTES
app.get('/', (req, res) => {
  let messages = Message.find({}).sort('createdAt').populate('_comments').sort('-createdAt')
  messages
    .exec()
    .then((messages)=>{
      // console.log('then');
      res.render('index', {messages: messages, errors: errors});
      errors = [];
    })
    .catch((err)=>{
      for (let x in err){
        errors.push(err.message);
      }
      res.render('index', {messages: [], errors: errors});
      errors = [];
    })
})
app.post('/postmessage', (req, res) => {
  // console.log('POST DATA', req.body);
  var message = new Message();
  message.firstName = req.body.firstName;
  message.message = req.body.message;
  message
    .save()
    .then(()=>{
      res.redirect('/');
    })
    .catch((err)=>{
      console.log(err.message);
      errors.push(err.message);
      res.redirect('/');
    })
})
app.post('/postcomment/:id', (req, res) => {
  var message;
  // console.log('POST DATA', req.body);
  Message.findById(req.params.id)
    .exec()
    .then((thisMessage)=>{
      message = thisMessage;
      let comment = new Comment();
      comment.cfirstName = req.body.cfirstName;
      comment.comment = req.body.comment;
      comment._message = req.params.id;
      return comment.save();
    })
    .then((comment)=>{
      message._comments.push(comment);
      res.redirect('/');
      return message.save();
    })
    .catch((err)=>{
      console.log(err.message);
      errors.push(err.message);
      res.redirect('/');
    });
})
// THE IMPORTANT SERVER BIT
app.listen(PORT, () => {
  console.log('listening on port' + PORT);
});

// for sockets setup:
// const server = app.listen(PORT, () => {
  // console.log('listening on port' + PORT);
// });
