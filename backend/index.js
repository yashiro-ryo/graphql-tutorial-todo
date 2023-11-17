const { ApolloServer, gql } = require('apollo-server');

const typeDefs = gql`
  type Query {
    tasks: [Task]
  }

  type Mutation {
    createTask(body: String!): Task
    updateTaskBody(id: String!, body: String!): Task
    updateCompleteState(id: String!, isComplete: Boolean!): Task
    deleteTask(id: String!): Task
  }

  type Task {
    id: ID!
    body: String!
    isComplete: Boolean!
    createdAt: String!
  }
`;

/* ダミーデータ */
let lastTaskIndex = 2
const tasks = [
  { "id": "1", "body": "ご飯作る", "isComplete": false, "createdAt": "2023:09:15 22:33:00" },
  { "id": "2", "body": "宿題する", "isComplete": false, "createdAt": "2023:09:15 23:45:00" }
]

const resolvers = {
  Query: {
    tasks: () => tasks
  },
  Mutation: {
    createTask: (_, args) => {
      const newTask = {
        "id": String(lastTaskIndex + 1),
        "body": args.body,
        "isComplete": false,
        "createdAt": String(new Date().getTime())
      }
      lastTaskIndex++
      tasks.push(newTask)
      return newTask
    },
    updateTaskBody: (_, args) => {
      const index = tasks.findIndex((task) => task.id === args.id)
      if (index === -1) {
        return null
      }
      const newTask = {
        "id": tasks[index].id,
        "body": args.body,
        "isComplete": tasks[index].isComplete,
        "createdAt": String(new Date().getTime())
      }
      tasks.splice(index, 1, newTask)
      return newTask
    },
    updateCompleteState: (_, args) => {
      const index = tasks.findIndex((task) => task.id === args.id)
      if (index === -1) {
        return null
      }
      const newTask = {
        "id": tasks[index].id,
        "body": tasks[index].body,
        "isComplete": args.isComplete,
        "createdAt": String(new Date().getTime())
      }
      tasks.splice(index, 1, newTask)
      return newTask
    },
    deleteTask: (_, args) => {
      const index = tasks.findIndex((task) => task.id === args.id)
      if (index === -1) {
        return null
      }
      const deleteTargetTask = tasks[index]
      tasks.splice(index, 1)
      return deleteTargetTask
    }
  }
};

const server = new ApolloServer({ typeDefs, resolvers, context: ({ req, res }) => ({ req, res }) });

server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});
