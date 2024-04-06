const { create_token } = require("../authentication/adminauth");
const sql = require("../dataBase/connectdb");
const bcrypt = require("bcryptjs");

//load login page
const loadLogin = async (req, res) => {
    try {
        res.render('login');
    } catch (error) {
        console.log("loadLogin:", error.message);
        res.status(400).send(error.message);
    }
}

// Amin login and generate jwt token
const adminLogin = async (req, res) => {
    console.log("here", req.body)
    try {
        const { email, password } = req.body;
        const adminData = await sql`
          select * from admins where adminEmail=${email};`

        if (adminData) {
            const matchPassword = await bcrypt.compare(password, adminData[0].adminpassword);
            if (matchPassword) {
                const token = await create_token(adminData[0].adminid);
                // res.status(200).send({ success: true, data: userData[0], token: token })
                res.cookie('admintoken', token);
                // res.send('Login successful');
                res.render('dashboard', { admin: adminData[0] });
            } else {
                return res.status(200).send({ msg: "Admin Email or password incorrect" });
            }
        } else {
            return res.status(200).send({ msg: "Admin Email or password incorrect" });
        }
    } catch (error) {
        console.log("adminLogin:", error.message);
        res.status(400).send({ msg: error.message });
    }
}

const addAdmin = async (req, res) => {
    console.log(req.body)
    try {
        // // Create 'admins' table 
        // await sql`
        //      CREATE TABLE IF NOT EXISTS admins(
        //         adminId SERIAL PRIMARY KEY,
        //         adminName varchar(100),
        //         adminEmail varchar(100) UNIQUE,
        //         adminPassword varchar(100),
        //         adminImage varchar(50)
        //      );`

        const { name, email, password } = req.body;
        const salt = await bcrypt.genSalt();
        const spassword = await bcrypt.hash(password, salt);
        const result = await sql`INSERT INTO admins(adminName,adminEmail,adminPassword)
               VALUES (${name},${email},${spassword})RETURNING *;`
        console.log(result);
        res.status(200).send({ success: true, msg: result });
    } catch (error) {
        console.error("addAdmin:", error.message, error.code);
        res.status(400).send({ msg: error.message });
    }
};

//load dashboard page
const showAllUsers = async (req, res) => {
    try {
        let page=parseInt(req.query.page) || 1;
        let limit=parseInt(req.query.limit) || 4;//We can also set limit Dynamically otherwise it is 2
        let offset=(page-1)*limit; //To find how many rows are to skit
       
        let search = req.query.search || '';
        const allUsers = await sql`
        SELECT * from users 
        WHERE name ILIKE '%' || ${search} || '%' OR email ILIKE '%' || ${search} || '%' OR  CAST(id AS VARCHAR) ILIKE '%' || ${search.toString()} || '%' ORDER BY id
        LIMIT ${limit}
        OFFSET ${offset};`;
      
        const totalRows= await sql`
        SELECT count(*) from users 
        WHERE name ILIKE '%' || ${search} || '%' OR email ILIKE '%' || ${search} || '%' OR  CAST(id AS VARCHAR) ILIKE '%' || ${search.toString()} || '%';`     
       
        let totalPages=Math.ceil(totalRows[0].count/limit);
        console.log("total pages:",totalRows,totalPages)
        res.render('users', { users: allUsers,pages:totalPages });
       
        // let search = '';  
        // if (req.query.search) {
        //     search=req.query.search;
        // const allUsers = await sql`
        //     SELECT * from users
        //     WHERE name ILIKE '%' || ${search} || '%' OR email ILIKE '%' || ${search} || '%' OR  CAST(id AS VARCHAR) ILIKE '%' || ${search.toString()} || '%'
        //     ORDER BY id `;
        //     res.render('users', { users: allUsers });
        // } else {
        //     const allUsers = await sql`
        //     SELECT * from users ORDER BY id;`
        //     res.render('users', { users: allUsers });
        // }
    } catch (error) {
        console.log("loadLogin:", error.message);
        res.status(400).send(error.message);
    }
}

//load edit user
const loadEditUser = async (req, res) => {
    try {
  
      const userId = req.query.id;
      const userData = await sql`
                SELECT * from users WHERE id=${userId};`
      res.render('edit-user', { user: userData[0] });
  
    } catch (error) {
      console.log("loadEditUser:", error.message);
      res.status(400).send({ msg: error.message });
    }
  }

//Update user
const updateUser = async (req, res) => {
    try {
      let id = req.body.id;
      let name = req.body.name;
      let email = req.body.email;

        await sql`
        UPDATE users 
        SET name=${name}, email=${email}
        WHERE id=${id};`
        res.redirect('/admin/users');
    } catch (error) {
      console.log(error.message);
      if(error.code=='23505'){
       return res.render('23505',{message:error.message});
      }
      res.status(400).send({ msg: error.message });
    }
  }

  //Delete user
  const deleteUser=async(req,res)=>{
    try {
        await sql`
        DELETE FROM users WHERE id=${req.query.id};`

        res.redirect('/admin/users')
    } catch (error) {
        console.log("deleteUser:", error.message,error.code);
        res.status(400).send({ msg: error.message }); 
    }
  }

//Show all courses
const showAllCourses = async (req, res) => {
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
        res.render("courses",{courses:allCourses,pages:totalPages});
    //    let search=''
    //    if(req.query.search){
    //     search=req.query.search;
    //     const allCourses=await sql`
    //     SELECT * from courses
    //     WHERE course_name ILIKE '%' || ${search} || '%' OR category ILIKE '%' || ${search} || '%' OR level ILIKE '%' || ${search} || '%' or CAST(popularity AS VARCHAR) ILIKE '%' || ${search.toString()} || '%'
    //     ORDER BY course_id`;
    //     res.render("courses",{courses:allCourses});
    //    }else{
    //     const allCourses=await sql`
    //            SELECT * from courses ORDER BY course_id;`
    //     res.render("courses",{courses:allCourses});
    //    }
    } catch (error) {
        console.log("showAllCourses:", error.message);
        res.status(400).send("Server is not responding!");
    }
  }
// Load add new course 
const loadAddCourse=async(req,res)=>{
    try {
        res.render('addCourse');
    } catch (error) {
        console.log("loadAddCourse:", error.message);
        res.status(400).send(error.message);
    }
}

//Add new course
const addNewCourse = async (req, res) => {
    try {
        const { name, category, level, popularity } = req.body;
        await sql`
         INSERT INTO courses(course_name,category,level,popularity)
         VALUES (${name},${category},${level},${popularity});`

        res.redirect('/admin/courses');
    } catch (error) {
        console.log("addCourse:", error.message);
        res.status(400).send(error.message);
    }
}

//Delete course
const deleteCourse=async(req,res)=>{
    try {
        await sql`
        DELETE FROM courses WHERE course_id=${req.query.courseId};`

        res.redirect('/admin/courses')
    } catch (error) {
        console.log("deleteCourse:", error.message,error.code);
        res.status(400).send({ msg: error.message }); 
    }
  }
//load edit course
const loadEditCourse = async (req, res) => {
    try {
  
      const courseId = req.query.courseId;
      const courseData = await sql`
                SELECT * from courses WHERE course_id=${courseId};`
                console.log("updatecourse:",courseData[0])
      res.render('edit-course', { course: courseData[0] });
  
    } catch (error) {
      console.log("loadEditCourse:", error.message);
      res.status(400).send({ msg: error.message });
    }
  }

  // update course
  const updateCourse = async (req, res) => {
    try {
        const {course_id, name, category, level, popularity } = req.body;
        await sql`
         UPDATE courses
         SET course_name=${name}, category=${category}, level=${level}, popularity=${popularity}
         WHERE course_id=${course_id};`

        res.redirect('/admin/courses');
    } catch (error) {
        console.log("updateCourse:", error.message);
        res.status(400).send(error.message);
    }
}

const showAllEnrolledUsers=async(req,res)=>{
    try {
        const enrolledUsers=await sql`
         SELECT * from enrolled_courses;`
         res.render('enrolled-users',{users:enrolledUsers})
    } catch (error) {
        console.log("showAllEnrolledUsers:", error.message);
        res.status(400).send(error.message);
    }
}
module.exports = {
    loadLogin,
    adminLogin,
    addAdmin,
    showAllUsers,
    loadEditUser,
    updateUser,
    deleteUser,
    showAllCourses,
    loadAddCourse,
    addNewCourse,
    deleteCourse,
    loadEditCourse,
    updateCourse,
    showAllEnrolledUsers
}