const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const { ApolloServer } = require('apollo-server-express');
const fs = require('fs');               
const path = require('path');

const dicomRoutes = require('./routes/dicomRoutes');
const typeDefs = require('./graphql/schema');
const resolvers = require('./graphql/resolvers');

const app = express();
const PORT = process.env.PORT || 5005;

// CORS Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'https://studio.apollographql.com'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type'],
  credentials: true
}));

// Body Parser Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Ensure the 'uploads' folder exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Serve static files from the 'uploads' directory
app.use('/uploads', express.static(uploadsDir));

// REST routes
app.use('/api', dicomRoutes);

const MONGO_URI = process.env.MONGO_URI || 'default-mongo-uri';

/*
// mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
*/

// Apollo Server Integration
async function startApolloServer() {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => {
      return { user: req.user }; 
    },
  });

  await server.start();
  server.applyMiddleware({ app, path: '/graphql' });
  console.log(`Apollo Server running at http://localhost:${PORT}${server.graphqlPath}`);
}

async function startServer() {
  try {
    await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('MongoDB connected successfully.');

    await startApolloServer();

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start the server:', err);
    process.exit(1);
  }
}

// server start
startServer();

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send({
    error: 'Something went wrong!',
    details: err.message
  });
});
