const express = require("express");
const morgan = require("morgan");
const flash = require("express-flash");
const session = require("express-session");
const { body, validationResult } = require("express-validator");
const TodoList = require("./lib/todolist");

const app = express();
const host = "localhost";
const port = 3000;

//static data for initial testing (not persistent)
let todoLists = require("./lib/seed-data");

app.set("views", "./views");
app.set("view engine", "pug");

app.use(morgan("common"));
app.use(express.static("public"));
app.use(express.urlencoded({ extended: false }));

app.use(session({
  name: "launch-school-todos-session-id",
  resave: false,
  saveUninitialized: true,
  secret: "this is not very secure",
}));

app.use(flash());

app.use((req, res, next) => {
  res.locals.flash = req.session.flash;
  delete req.session.flash;
  next();
});

//compare todo list titles alphabetically 
const compareByTitle = (itemA, itemB) => {
  let titleA = itemA.title.toLowerCase();
  let titleB = itemB.title.toLowerCase();

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

//Find a todo list with the indicated ID.
const loadTodoList = todoListId => {
  return todoLists.find(todoList => todoList.id === todoListId);
}

const sortTodos = todoList => {
  let undone = todoList.todos.filter(todo => !todo.isDone());
  let done = todoList.todos.filter(todo => todo.isDone());

  undone.sort(compareByTitle);
  done.sort(compareByTitle);
  return [].concat(undone, done);
};

app.get("/", (req, res) => {
  res.redirect("/lists");
});

app.get("/lists", (req, res) => {
  res.render("lists", {
    todoLists: sortTodoLists(todoLists),
  })
});

app.get("/lists/new", (req, res) => {
  res.render("new-list");
});

app.post("/lists",
  [
    body("todoListTitle")
      .trim()
      .isLength({ min: 1 })
      .withMessage("The list title is required.")
      .isLength({ max: 100 })
      .withMessage("List title must be between 1 and 100 characters.")
      .custom(title => {
        let duplicate = todoLists.find(list => list.title === title);
        return duplicate === undefined;
      })
      .withMessage("List title must be unique."),
  ],
  (req, res) => {
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      errors.array().forEach(message => req.flash("error", message.msg));
      res.render("new-list", {
        flash: req.flash(),
        todoListTitle: req.body.todoListTitle,
      });
    } else {
      todoLists.push(new TodoList(req.body.todoListTitle));
      req.flash("success", "The todo list has been created.");
      res.redirect("/lists");
    }
  }
);

//render individual todo list 
app.get("/lists/:todoListId", (req, res, next) => {
  let todoListId = req.params.todoListId;
  let todoList = loadTodoList(+todoListId);

  if (todoList === undefined) {
    next(new Error("Not found."));
  } else {
    res.render("list", {
      todoList: todoList,
      todos: sortTodos(todoList),
    });
  }
});

//Error Handler
app.use((err, req, res, _next) => {
  console.log(err); 
  res.status(404).send(err.message);
});


//Listener
app.listen(port, host, () => {
  console.log(`Todos is listening on port ${port} of ${host}!`);
});

