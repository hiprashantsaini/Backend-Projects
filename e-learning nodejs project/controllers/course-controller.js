const sql = require("../dataBase/connectdb");

const addCourse = async (req, res) => {
    try {
        //    const data= await sql`
        //     CREATE TABLE IF NOT EXISTS courses (
        //         course_id SERIAL PRIMARY KEY,
        //         course_name VARCHAR(200),
        //         category VARCHAR(200),
        //         level VARCHAR(100), 
        //         popularity INTEGER
        //     )
        // `;
        // console.log("Course table created");

        const { name, category, level, popularity } = req.body;
        await sql`
         INSERT INTO courses(course_name,category,level,popularity)
         VALUES (${name},${category},${level},${popularity});`

        res.send("Course table created")
    } catch (error) {
        console.log("addCourse:", error.message);
        res.status(400).send(error.message);
    }
}

//Show all courses
const showCourses = async (req, res) => {
    try {

        let page=parseInt(req.query.page) || 1;
        let limit=parseInt(req.query.limit) || 2;//We can also set limit Dynamically otherwise it is 2
        let offset=(page-1)*limit; //To find how many rows are to skit

        let search = req.query.search || '';
        const allCourses = await sql`
        SELECT * from courses 
        WHERE course_name ILIKE '%' || ${search} || '%' OR category ILIKE '%' || ${search} || '%' OR level ILIKE '%' || ${search} || '%' or CAST(popularity AS VARCHAR) ILIKE '%' || ${search.toString()} || '%'
        ORDER BY course_id
        LIMIT ${limit}
        OFFSET ${offset};`;
      
        const totalRows= await sql`
        SELECT count(*) from courses 
        WHERE course_name ILIKE '%' || ${search} || '%' OR category ILIKE '%' || ${search} || '%' OR level ILIKE '%' || ${search} || '%' or CAST(popularity AS VARCHAR) ILIKE '%' || ${search.toString()} || '%'`;
        
        let totalPages=Math.ceil(totalRows[0].count/limit);
        console.log("total pages:",totalRows,totalPages)
        res.render("index", { courses: allCourses, pages:totalPages });
        
    } catch (error) {
        console.log("showCourses:", error.message);
        res.status(400).send("Server is not responding!");
    }
}

module.exports = {
    addCourse,
    showCourses
}