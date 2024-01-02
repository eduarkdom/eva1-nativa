const express = require('express');
const cors = require('cors');
const routes = require('./Pacient/routes');
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());
app.use('/api', routes);

module.exports = app;
