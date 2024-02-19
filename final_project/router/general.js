const express = require("express");
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password must be provided." });
  }

  if (isValid(username)) {
    return res.status(400).json({
      message: `Cannot register. Account for ${username} already exists.`,
    });
  }

  users.push({
    username: username,
    password: password,
  });
  return res
    .status(200)
    .json({ message: `${username} successfully registered.` });
});

// Get the book list available in the shop
public_users.get("/", async (req, res) => {
  try {
    const allBooks = await books; // async operation like db-connection
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error!!" });
  }
  return res.status(200).json({ message: books });
});

// Get book details based on ISBN
public_users.get("/isbn/:isbn", async function (req, res) {
  const isbn = req.params.isbn;

  try {
    const book = await books[isbn]; // async operation like db-connection
    if (!book)
      return res
        .status(404)
        .json({ message: `Book with ISBN ${isbn} not found.` });

    return res.status(200).json({ message: book });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error!!" });
  }
});

// Get book details based on author
public_users.get("/author/:author", async function (req, res) {
  const author = req.params.author.replace("+", " ");

  try {
    let matchingBooks = await findBooksBy("author", author);

    if (matchingBooks.length === 0)
      return res
        .status(404)
        .json({ message: `No books written by ${author} found.` });

    return res.status(200).json({ message: matchingBooks });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error!!" });
  }
});

// Get all books based on title
public_users.get("/title/:title", async function (req, res) {
  const title = req.params.title.replace("+", " ");

  try {
    let matchingBooks = await findBooksBy("title", title);
    if (matchingBooks.length === 0)
      return res
        .status(404)
        .json({ message: `No books with Title "${title}" found.` });

    return res.status(200).json({ message: matchingBooks });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error!!" });
  }
});

const findBooksBy = async (key, value) => {
  return Object.values(books).filter((book) => book[key] === value);
};

//  Get book review
public_users.get("/review/:isbn", function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (!book)
    return res
      .status(404)
      .json({ message: `Book with ISBN ${isbn} not found.` });

  const reviews = book["reviews"];

  return res.status(200).json({ message: reviews });
});

module.exports.general = public_users;
