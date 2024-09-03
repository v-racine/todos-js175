const nextId = require("./next-id");

/**
 * Todo is a class for constructing todos.
 */
class Todo {
  constructor(title) {
    this.id = nextId();
    this.title = title;
    this.done = false;
  }

  static makeTodo(rawTodo) {
    return Object.assign(new Todo(), rawTodo);
  }

  /**
   * toString makes a todo a string.
   * @returns stringified todo
   */
  toString() {
    let marker = this.isDone() ? Todo.DONE_MARKER : Todo.UNDONE_MARKER;
    return `[${marker}] ${this.title}`;
  }

  markDone() {
    this.done = true;
  }

  markUndone() {
    this.done = false;
  }

  isDone() {
    return this.done;
  }

  setTitle(title) {
    this.title = title;
  }
}

Todo.DONE_MARKER = "X";
Todo.UNDONE_MARKER = " ";

module.exports = Todo;