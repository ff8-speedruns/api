const poles = require('./endpoints/poles');
const fp = require('./endpoints/finalparty');

const express = require("express");
const app = express();
const port = process.env.PORT || 3001;

app.get("/", (req, res) => {
  res.redirect('https://galbadia.garden/api');
});

app.get("/poles", (req, res) => res.type('html').send(noInputError));
app.get("/party", (req, res) => res.type('html').send(noInputError));

app.get("/poles/:pattern", (req, res) => {
  let response = "ERROR";
  if(!req.params.pattern) {
    response = noInputError;
  } else {
    response = poles.GetPoles(req.params.pattern);
  }
  res.send(response);
});

app.get("/party/:pattern", (req, res) => {
  let response = "ERROR";
  if(!req.params.pattern) {
    response = noInputError;
  } else {
    response = fp.GetFinalParty(req.params.pattern);
  }
  res.send(response);
});

const server = app.listen(port, () => console.log(`App listening on port ${port}!`));

server.keepAliveTimeout = 120 * 1000;
server.headersTimeout = 120 * 1000;

const noInputError = "Input vas not specified!! Odine vants to know WHY?!";