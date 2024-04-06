//app.js is not the part of project. This file has been used for making some changes
const postgres = require('postgres');
require('dotenv').config();

let { PGHOST, PGDATABASE, PGUSER, PGPASSWORD, ENDPOINT_ID } = process.env;

// connect with NamedNodeMap.tech database with connection parameters 
const sql = postgres({
  host: PGHOST,
  database: PGDATABASE,
  username: PGUSER,
  password: PGPASSWORD,
  port: 5432,
  ssl: 'require',
  connection: {
    options: `project=${ENDPOINT_ID}`,
  },
});

// Function to register a new user
async function registerUser(name, email, password) {
  try {
    // SQL query to insert user data into the database
    const query = sql`
      INSERT INTO users (name, email, password)
      VALUES (${name}, ${email}, ${password})
      RETURNING *;`;

    // Execute the query and wait for the result
    const result = await query;

    // Return the inserted user data
    return result[0];
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
}

// Example usage
async function main() {
  try {
    // Register a new user
    const newUser = await registerUser('Mohan', 'mohan@example.com', 'password123');

    console.log('New user registered:', newUser);
  } catch (error) {
    console.error('Error:', error);
  }
}

main();



