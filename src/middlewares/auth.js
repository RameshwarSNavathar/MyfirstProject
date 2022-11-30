const jwt = require("jsonwebtoken");
const bookModel = require("../models/bookModel");
let decodedtoken;
const { isValidObjectId } = require("../validator/validator")

exports.authenticate = function (req, res, next) {
    try {
        let token = req.headers["x-api-key"] || req.headers["X-Api-Key"];
        if (!token) return res.status(400).send({ status: false, message: "token must be present" });

        decodedtoken = jwt.verify(token, "Book-mgmt", function (err, token) {
            if (err) {
                return res.status(401).send({ status: false, message: err.message })
            } else {
                return token;
            }
        })
        req.tokenId = decodedtoken.userId
        next();

    } catch (error) {
        res.status(500).send({ status: false, message: error.message })
    }
}



exports.authorisation = async function (req, res, next) {
    let bookId = req.params.bookId
    if (!bookId) return res.status(400).send({ status: false, message: "please provide the bookId" })
    if (!isValidObjectId(bookId)) return res.status(400).send({ status: false, message: "please provide the valid bookId" })
    let book = await bookModel.findById(bookId)
    if (!book) return res.status(400).send({ status: false, message: "this book is not exists" })
    let userid = book.userId
    let userId = req.tokenId
    if (userid != userId) return res.status(400).send({ status: false, message: "unauthorised user!" })
    next()
}


