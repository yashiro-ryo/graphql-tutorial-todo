import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import express from "express";
import { createServer } from "http";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { WebSocketServer } from "ws";
import { useServer } from "graphql-ws/lib/use/ws";
import { PubSub } from "graphql-subscriptions";
import bodyParser from "body-parser";
import cors from "cors";

const PORT = 4000;
const pubsub = new PubSub();

const typeDefs = `#graphql
  type Query {
    tasks: [Task]
  }

  type Mutation {
    createTask(body: String!): Task
    updateTaskBody(id: String!, body: String!): Task
    updateCompleteState(id: String!, isComplete: Boolean!): Task
    deleteTask(id: String!): Task
  }

  type Subscription {
    notifyTaskUpdated: [Task!]
  }

  type Task {
    id: ID!
    body: String!
    isComplete: Boolean!
    createdAt: String!
  }
`;

/* ダミーデータ */
let lastTaskIndex = 2;
const tasks = [
  {
    id: "1",
    body: "ご飯作る",
    isComplete: false,
    createdAt: "2023:09:15 22:33:00",
  },
  {
    id: "2",
    body: "宿題する",
    isComplete: false,
    createdAt: "2023:09:15 23:45:00",
  },
];

const resolvers = {
  Query: {
    tasks: () => tasks,
  },
  Mutation: {
    createTask: (_: any, args: { body: string }) => {
      const newTask = {
        id: String(lastTaskIndex + 1),
        body: args.body,
        isComplete: false,
        createdAt: String(new Date().getTime()),
      };
      lastTaskIndex++;
      tasks.push(newTask);
      pubsub.publish("NOTIFY_TASK_UPDATED", { notifyTaskUpdated: tasks });
      return newTask;
    },
    updateTaskBody: (_: any, args: { id: string; body: string }) => {
      const index = tasks.findIndex((task) => task.id === args.id);
      if (index === -1) {
        return null;
      }
      const newTask = {
        id: tasks[index].id,
        body: args.body,
        isComplete: tasks[index].isComplete,
        createdAt: String(new Date().getTime()),
      };
      tasks.splice(index, 1, newTask);
      pubsub.publish("NOTIFY_TASK_UPDATED", { notifyTaskUpdated: tasks });
      return newTask;
    },
    updateCompleteState: (
      _: any,
      args: { id: string; isComplete: boolean }
    ) => {
      const index = tasks.findIndex((task) => task.id === args.id);
      if (index === -1) {
        return null;
      }
      const newTask = {
        id: tasks[index].id,
        body: tasks[index].body,
        isComplete: args.isComplete,
        createdAt: String(new Date().getTime()),
      };
      tasks.splice(index, 1, newTask);
      pubsub.publish("NOTIFY_TASK_UPDATED", { notifyTaskUpdated: tasks });
      return newTask;
    },
    deleteTask: (_: any, args: { id: string }) => {
      const index = tasks.findIndex((task) => task.id === args.id);
      if (index === -1) {
        return null;
      }
      const deleteTargetTask = tasks[index];
      tasks.splice(index, 1);
      pubsub.publish("NOTIFY_TASK_UPDATED", { notifyTaskUpdated: tasks });
      return deleteTargetTask;
    },
  },
  Subscription: {
    notifyTaskUpdated: {
      subscribe: () => pubsub.asyncIterator(["NOTIFY_TASK_UPDATED"]),
    },
  },
};

const schema = makeExecutableSchema({ typeDefs, resolvers });

const app = express();
const httpServer = createServer(app);

const wsServer = new WebSocketServer({
  server: httpServer,
  path: "/graphql",
});
const serverCleanup = useServer({ schema }, wsServer);

// Set up ApolloServer.
const server = new ApolloServer({
  schema,
  plugins: [
    // Proper shutdown for the HTTP server.
    ApolloServerPluginDrainHttpServer({ httpServer }),

    // Proper shutdown for the WebSocket server.
    {
      async serverWillStart() {
        return {
          async drainServer() {
            await serverCleanup.dispose();
          },
        };
      },
    },
  ],
});

const runServer = async () => {
  await server.start();
  app.use(
    "/graphql",
    cors<cors.CorsRequest>(),
    bodyParser.json(),
    expressMiddleware(server)
  );

  // Now that our HTTP server is fully set up, actually listen.
  httpServer.listen(PORT, () => {
    console.log(`🚀 Query endpoint ready at http://localhost:${PORT}/graphql`);
    console.log(
      `🚀 Subscription endpoint ready at ws://localhost:${PORT}/graphql`
    );
  });
};

runServer();
