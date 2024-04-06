// const sql=require('../dataBase/connectdb');
// const courseTable=async()=>{
//     try {
        
//         await sql`
//               CREATE TABLE courses(
//                 course_id SERIAL PRIMARY KEY,
//                 course_name VARCHAR(200),
//                 category VARCHAR(200),
//                 level VARCHAR(100), 
//                 popularity INTEGER
//               )`
//           console.log("Course table created");
//     } catch (error) {
//         console.log("courseTable:",error.message);
//     }
// }

// courseTable();
const sql = require('../dataBase/connectdb');

const courseTable = async () => {
    try {
        await sql`
            CREATE TABLE IF NOT EXISTS courses (
                course_id SERIAL PRIMARY KEY,
                course_name VARCHAR(200),
                category VARCHAR(200),
                level VARCHAR(100), 
                popularity INTEGER
            )
        `;
        console.log("Course table created");
    } catch (error) {
        console.log("courseTable:", error.message);
    }
}

courseTable();
