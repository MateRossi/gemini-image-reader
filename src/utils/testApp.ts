import express from "express";

const testApp = express();
testApp.use(express.json( { limit: '30mb' } ));

export default testApp;