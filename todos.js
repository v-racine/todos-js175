const express = require("express");
const morgan = require("morgan");

const app = express();
const host = "localhost";
const port = 3000;

//static data for initial testing (not persistent)
let todoLists = require("./lib/seed-data");

app.set("views", "./views");
app.set("view engine", "pug");

app.use(morgan("common"));
app.use(express.static("public"));

//compare todo list titles alphabetically 
const compareByTitle = (todoListA, todoListB) => {
  let titleA = todoListA.title.toLowerCase();
  let titleB = todoListB.title.toLowerCase();

  if (titleA < titleB) {
    return - 1;
  } else if (titleA > titleB) {
    return 1;
  } else {
    return 0;
  }
}

// return the list of todo lists sorted by completion status and title.
const sortTodoLists = lists => {
  let undone = lists.filter(todoList => !todoList.isDone());
  let done = lists.filter(todoList => todoList.isDone());
  
  undone.sort(compareByTitle);
  done.sort(compareByTitle);

  return undone.concat(done); //instead of calling concat on `[]`
};

app.get("/", (req, res) => {
  res.render("lists", { 
    todoLists: sortTodoLists(todoLists), 
  });
});

//Listener
app.listen(port, host, () => {
  console.log(`Todos is listening on port ${port} of ${host}!`);
});

