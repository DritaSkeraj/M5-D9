const express = require("express");
const path = require("path");
const uniqid = require("uniqid");
const { writeFile, createReadStream, read } = require("fs-extra");
const { readDB, writeDB } = require("../../lib/utilites");
const { check, validationResult } = require("express-validator");

const router = express.Router();
const cardsFilePath = path.join(__dirname, "cards.json");
const productsFilePath = path.join(__dirname, "../products/products.json")

router.get("/", async (req, res, next) => {
  try {
    const cards = await readDB(cardsFilePath);
    res.send(cards);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

router.get("/:cardId", async (req, res, next) => {
  try {
    const cards = await readDB(cardsFilePath);
    const cardFound = cards.find((card) => card._id === req.params.cardId);

    if (cardFound) {
      res.send(cardFound);
    } else {
      const err = new Error();
      err.httpsStatusCode = 404;
      next(err);
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

router.post(
  "/",
  [
    check("name").exists().withMessage("Add user name"),
    check("surname").exists().withMessage("Add user surname"),
  ],
  async (req, res, next) => {
    try {
      const validationErrors = validationResult(req);

      if (!validationErrors.isEmpty()) {
        const error = new Error();
        error.httpStatusCode = 400;
        error.message = validationErrors;
        next(error);
      } else {
        const cards = await readDB(cardsFilePath);

        cards.push({
          ...req.body,
          createdAt: new Date(),
          ownerId: uniqid(),
          _id: uniqid(),
          products: [],
          total: 0
        });
        await writeDB(cardsFilePath, cards);


        res.status(201).send();
      }
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);

router.get("/:cardId", async (req, res, next) => {
    try {
      const cards = await readDB(cardsFilePath)
  
      const cardFound = cards.find(
        card => card._id === req.params.cardId
      )
  
      if (cardFound) {
        res.send(cardFound)
      } else {
        const error = new Error()
        error.httpStatusCode = 404
        next(error)
      }
    } catch (error) {
      console.log(error)
      next(error)
    }
  })

  router.post(
    "/:cardId/add-to-card/:productId",
    async (req, res, next) => {
      try {
        const cards = await readDB(cardsFilePath)
  
        const cardIndex = cards.findIndex(
          card => card._id === req.params.cardId
        )

        if (cardIndex !== -1) {
          // product found
          let myTotal = await cards[cardIndex].total;

          console.log("card found")
          cards[cardIndex].products.push({
            _id: req.params.productId,
            createdAt: new Date()
          })
          cards[cardIndex].total = ++myTotal;
          await writeDB(cardsFilePath, cards)
          res.status(201).send(cards)
        } else {
          // product not found
          const error = new Error()
          error.httpStatusCode = 404
          next(error)
        }
      } catch (error) {
        console.log(error)
        next(error)
      }
    }
  )

  router.delete(
    "/:cardId/products/:productId",
    async (req, res, next) => {
      try {
        const cards = await readDB(cardsFilePath);
  
        const cardIndex = cards.findIndex(
          card => card._id === req.params.cardId
        )
        let total = cards[cardIndex].total;
    
        if (cardIndex !== -1) {
          cards[cardIndex].products = cards[cardIndex].products.filter(
            product => product._id !== req.params.productId
          )
          let intTotal = parseInt(total)
          cards[cardIndex].total = --intTotal;
            console.log("total::::::::", cards[cardIndex].total)
          await writeDB(cardsFilePath, cards)
          res.send(cards)
        } else {
        }
      } catch (error) {
        console.log(error)
        next(error)
      }
    }
  )

module.exports = router;
