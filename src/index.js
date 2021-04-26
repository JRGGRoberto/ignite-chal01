const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];
          
function checksExistsUserAccount(request, response, next) {
  const {username} = request.headers;
  const nomeUser = users.find((us) => us.username === username);
  if(!nomeUser){
    return response.status(404).json({error: 'User not found'});
  }
  request.user = nomeUser;
  return next();
}
/*
function checksExistsToDo(user, id) {
  const idxToDo = user.todos.findIndex((tDo) => tDo.id === id);
  if (idxToDo === -1){
    return response.status(404).json({error: 'ToDo id is not found'});
  } 
  return idxToDo; 
}*/

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const userAlredExists = users.some(
    (user) => user.username === username
  );

  if(userAlredExists) {
    return response.status(400).json({error: 'username already exists'});
  }
  const user = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }

  users.push(user);

  return response.status(201).json(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  return response.json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const {title, deadline} = request.body;
  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline,
    created_at: new Date()
  };
  user.todos.push(todo);
  return response.status(201).json(todo)

});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;
  const {title, deadline} = request.body;

  // const idxToDo = checksExistsToDo(user, id);

  const idxToDo = user.todos.findIndex((tDo) => tDo.id === id);
  if (idxToDo === -1){
    return response.status(404).json({error: 'ToDo id is not found'});
  } 

  user.todos[idxToDo].title = title;
  user.todos[idxToDo].deadline = deadline;
  const done = user.todos[idxToDo].done; 

  return response.status(201).json({title, deadline, done});
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  //const idxToDo = checksExistsToDo(user, id);
  const idxToDo = user.todos.findIndex((tDo) => tDo.id === id);
  if (idxToDo === -1){
    return response.status(404).json({error: 'ToDo id is not found'});
  } 

  const todo = user.todos[idxToDo];
  todo.done = true;
  

  return response.status(201).json(todo);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  //const idxToDo = checksExistsToDo(user, id);
  const idxToDo = user.todos.findIndex((tDo) => tDo.id === id);
  if (idxToDo === -1){
    return response.status(404).json({error: 'ToDo id is not found'});
  } 

  user.todos.splice(idxToDo, 1);

  return response.status(204).send();
});

module.exports = app;