const express = require("express");
const jwt = require("jsonwebtoken");
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
  const matchingUsers = users.filter((user) => user["username"] === username);
  return matchingUsers.length > 0;
};

const isAuthenticatedUser = (username, password) => {
  return (
    users.filter(
      (user) => user.username === username && user.password === password
    ).length != 0
  );
};

//only registered users can login
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(404).json({ message: "Login Error." });
  }

  if (isAuthenticatedUser(username, password)) {
    let accessToken = jwt.sign(
      {
        data: password,
      },
      "access",
      { expiresIn: 60 * 60 }
    );

    req.session.authorization = {
      accessToken,
      username,
    };

    return res.status(200).send("User successfully logged in.");
  } else {
    return res
      .status(208)
      .json({ message: "Invalid credentials. Check username and password." });
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const review = req.query.review.replace("+", " ");
  const username = req.session.authorization.username;
  const isbn = req.params.isbn;

  const book = books[isbn];
  if (!book)
    return res
      .status(404)
      .json({ message: `Book with ISBN ${isbn} not found.` });

  books[isbn]["reviews"][username] = review;

  return res.status(200).json({
    message: `Successfully added review for isbn ${isbn} - book ${JSON.stringify(
      book
    )}`,
  });
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  const username = req.session.authorization.username;
  const isbn = req.params.isbn;

  const book = books[isbn];
  if (!book)
    return res
      .status(404)
      .json({ message: `Book with ISBN ${isbn} not found.` });

  const review = books[isbn]["reviews"][username];
  if (!review)
    return res
      .status(400)
      .json({ message: `No review from ${username} found for isbn ${isbn}.` });

  delete books[isbn]["reviews"][username];
  return res.status(200).json({
    message: `Successfully deleted review from ${username} found for isbn ${isbn}, book ${JSON.stringify(
      book
    )}.`,
  });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
