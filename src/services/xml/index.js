const express = require("express")
const axios = require("axios")

const xmlRoutes = express.Router();

xmlRoutes.get("/", async(req, res, next) => {
    try{
        const url = "http://tempuri.org/Add"

        const response = await axios.get(url)

        const xml = response.data;

        res.send(xml)

    } catch(error){
        next(error)
    }
})

module.exports = xmlRoutes