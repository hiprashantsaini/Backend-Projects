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


// // app.js
// const postgres = require('postgres');
// require('dotenv').config();

// let { PGHOST, PGDATABASE, PGUSER, PGPASSWORD, ENDPOINT_ID } = process.env;

// const sql = postgres({
//   host: PGHOST,
//   database: PGDATABASE,
//   username: PGUSER,
//   password: PGPASSWORD,
//   port: 5432,
//   ssl: 'require',
//   connection: {
//     options: `project=${ENDPOINT_ID}`,
//   },
// });

// async function getPgVersion() {
//   const result = await sql`select version()`;
//   console.log(result);
// }

// getPgVersion();
// app.js


// app.js
// const postgres = require('postgres');
// require('dotenv').config();

// let { PGHOST, PGDATABASE, PGUSER, PGPASSWORD, ENDPOINT_ID } = process.env;

// const sql = postgres({
//   host: PGHOST,
//   database: PGDATABASE,
//   username: PGUSER,
//   password: PGPASSWORD,
//   port: 5432,
//   ssl: 'require',
//   connection: {
//     options: `project=${ENDPOINT_ID}`,
//   },
// });

// // Function to create users table
// async function createUsersTable() {
//   try {
//     // SQL query to create users table
//     const query = sql`
//       CREATE TABLE IF NOT EXISTS users (
//         id SERIAL PRIMARY KEY,
//         name VARCHAR(100) NOT NULL,
//         email VARCHAR(100) UNIQUE NOT NULL,
//         password VARCHAR(100) NOT NULL
//       );`;

//     // Execute the query
//     await query;

//     console.log('Users table created successfully');
//   } catch (error) {
//     console.error('Error creating users table:', error);
//     throw error;
//   }
// }

// // Example usage
// async function main() {
//   try {
//     // Create users table
//     await createUsersTable();
//   } catch (error) {
//     console.error('Error:', error);
//   } finally {
//     // Close database connection
//     await sql.end();
//   }
// }

// main();


