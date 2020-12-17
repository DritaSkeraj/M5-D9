const express = require("express")
const axios = require("axios")
const { parseString } = require("xml2js")
const { promisify } = require("util");
const { begin } = require("xmlbuilder");
const { AsyncParser } = require("json2csv");

const xmlRoutes = express.Router();

xmlRoutes.get("/", async(req, res, next) => {
    try{
        const url = "http://tempuri.org/Add"

        const response = await axios.get(url)

        const xml = response.data;
        const parsedJS = await asyncParser(xml)
        res.send(parsedJS.price)
        console.log(parsedJS)

    } catch(error){
        next(error)
    }
})

// POST /calculator.asmx HTTP/1.1
// Host: www.dneonline.com
// Content-Type: text/xml; charset=utf-8
// Content-Length: length
// SOAPAction: "http://tempuri.org/Add"

// <?xml version="1.0" encoding="utf-8"?>
// <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
//   <soap:Body>
//     <Add xmlns="http://tempuri.org/">
//       <intA>int</intA>
//       <intB>int</intB>
//     </Add>
//   </soap:Body>
// </soap:Envelope>

xmlRoutes.get("/sum/:num1+num2", async (req, res, next) => {
    try {
      const { string, token } = req.query;
  
      const xmlBody = begin()
        .ele("soap:Envelope", {
            "xmlns:xsi":"http://www.w3.org/2001/XMLSchema-instance",
            "xmlns:xsd":"http://www.w3.org/2001/XMLSchema",
            "xmlns:soap":"http://schemas.xmlsoap.org/soap/envelope/"
        })
        .ele("soap:Body")
        .ele("AllLowercaseWithToken", {
          xmlns: "http://www.dataaccess.com/webservicesserver/",
        })
        .ele("sAString")
        .text(string)
        .up()
        .ele("sToken")
        .text(token)
        .end();
  
      const response = await axios({
        method: "post",
        url:
          "https://www.dataaccess.com/webservicesserver/TextCasing.wso?op=AllLowercaseWithToken",
        data: xmlBody,
        headers: { "Content-type": "text/xml" },
      });
      const xml = response.data;
      const parsedJS = await asyncParser(xml);
      res.send(
        parsedJS["soap:Envelope"]["soap:Body"][0][
          "m:AllLowercaseWithTokenResponse"
        ][0]["m:AllLowercaseWithTokenResult"][0]
      );
    } catch (error) {
      next(error);
    }
  });

module.exports = xmlRoutes