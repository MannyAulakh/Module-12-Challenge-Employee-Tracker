const inquirer = require("inquirer")
const mysql = require("mysql2")

require('console.table')

//List of prompts
const actions = ["View all departments", "View all roles", "View all employees", "Add a department", "Add a role", "Add an employee", "Update an employee role", "Quit"]

//Welcome message
console.log("█░█░█ █▀▀ █░░ █▀▀ █▀█ █▀▄▀█ █▀▀ █\n▀▄▀▄▀ ██▄ █▄▄ █▄▄ █▄█ █░▀░█ ██▄ ▄")


// Connect to database
const db = mysql.createConnection(
    {
        host: 'localhost',
        // MySQL username,
        user: 'root',
        // TODO: Add MySQL password
        password: '',
        database: 'employees_db'
    },
    console.log(`Connected to the books_db database.`)
);

//---------------------------Inital Menu---------------------------
function start() {
    inquirer
        .prompt({
            name: "task",
            type: "list",
            message: "What do you want to do?",
            choices: actions
        })
        .then((resp) => {
            switch (resp.task) {
                case "View all departments":
                    viewDepartments()
                    break
                case "View all roles":
                    viewRoles()
                    break
                case "View all employees":
                    viewEmployees()
                    break
                case "Add a department":
                    addDepartment()
                    break
                case "Add a role":
                    addRole()
                    break
                case "Add an employee":
                    addEmployee()
                    break
                case "Update an employee role":
                    updateEmployee()
                    break
                case "Quit":
                    Quit()
                    break
            }
        })
}

//---------------------------View All Departments---------------------------
function viewDepartments() {
    db.query("SELECT * FROM department", function (err, results) {
        console.table(results)
        start()
    })
}

//---------------------------View All Roles---------------------------
function viewRoles() {
    db.query("SELECT title, role.id, dep_name, salary FROM role JOIN department ON department_id = department.id", function (err, results) {
        console.table(results)
        start()
    })
}

//---------------------------View All Employees---------------------------
function viewEmployees() {
    db.query("SELECT employee.id, employee.first_name, employee.last_name, title, dep_name, salary, CONCAT(manager.first_name, ' ', manager.last_name) AS manager FROM employee LEFT JOIN employee manager ON employee.manager_id = manager.id JOIN role on employee.role_id = role.id JOIN department ON department_id = department.id", function (err, results) {
        console.table(results)
        start()
    })
}

//---------------------------Add Department---------------------------
function addDepartment() {
    inquirer
        .prompt(
            {
                name: "depName",
                type: "input",
                message: "What is the name of the department?",
            }
        )
        .then((resp) => {
            db.query("INSERT INTO department (dep_name) VALUES (?)", resp.depName, function (err, results) {
                console.log("Successfully Added Department")
                start()
            })
        })
}

//---------------------------Add Role---------------------------
function addRole() {
    //Get list of current Departments
    db.query("SELECT dep_name FROM department", function (err, result) {
        const departments = result.map((d) => `${d.dep_name}`)
        inquirer
            .prompt([
                {
                    name: "roleName",
                    type: "input",
                    message: "What is the name of the role",
                },
                {
                    name: "salary",
                    type: "input",
                    message: "Enter salary"
                },
                {
                    name: "depName",
                    type: "list",
                    message: "Select department for role",
                    //Select a department
                    choices: [...departments]

                }
            ])
            .then((resp) => {
                //Get department ID of selected dep name to add to new role & salary
                db.query("INSERT INTO role (title, salary, department_id) SELECT ?, ?, department.id FROM department WHERE department.dep_name = ?", [resp.roleName, resp.salary, resp.depName], function (err, results) {
                    console.log("Successfully Added Role")
                    start()
                })
            })
    })
}


//---------------------------Add Employee---------------------------
function addEmployee() {
    //Get list of current roles
    db.query("SELECT title FROM role", function (err, result) {
        const roles = result.map((r) => `${r.title}`)
        inquirer
            .prompt([
                {
                    name: "firstName",
                    type: "input",
                    message: "What is the first name of the employee",
                },
                {
                    name: "lastName",
                    type: "input",
                    message: "What is the last name of the employee",
                },
                {
                    name: "Role",
                    type: "list",
                    message: "Select new employee role",
                    //Select Role
                    choices: [...roles]
                }
            ])
            .then((resp) => {
                // Insert New Employee first name, last name, & role ID
                db.query("INSERT INTO employee (first_name, last_name, role_id) SELECT ?, ?, role.id FROM role WHERE role.title = ?", [resp.firstName, resp.lastName, resp.Role], function (err, results) {
                    //store first & last name 
                    employeeFirstName = resp.firstName
                    employeeLastName = resp.lastName

                    //Get a list of a potential managers
                    db.query("SELECT first_name, last_name, id FROM employee", function (err, result) {
                        const managers = result.map((m) => `${m.first_name} ${m.last_name}`)
                        inquirer
                            .prompt(
                                {
                                    name: "Manager",
                                    type: "list",
                                    message: "Select Manager",
                                    //select manager or null
                                    choices: [...managers, "null"],
                                }
                            )
                            .then((resp) => {
                                //Split selection between first & last name
                                const employSelected = resp.Manager.split(" ")
                                const FIRSTNAME = employSelected[0]
                                const LASTNAME = employSelected[1]
                                //Update manager for newly created employee
                                db.query("UPDATE employee t, (SELECT id FROM employee WHERE first_name = ? AND last_name = ?) t1 SET t.manager_id = t1.id WHERE t.first_name = ? AND t.last_name = ?", [FIRSTNAME, LASTNAME, employeeFirstName, employeeLastName], function (err, results) {
                                    console.log("Successfully Added Employee")
                                    start()
                                })
                            })
                    })
                })
            })
    })
}

//---------------------------Update Employee---------------------------
function updateEmployee() {
    //Get list of employees
    db.query("SELECT first_name, last_name FROM employee", function (err, result) {
        const employees = result.map((m) => `${m.first_name} ${m.last_name}`)
        inquirer
            .prompt(
                {
                    name: "Employ",
                    type: "list",
                    message: "Select Employee",
                    //Select employee
                    choices: [...employees]
                }
            )
            .then((resp) => {
                // Seperate first & last name of employee selected
                const employSelected = resp.Employ.split(" ")
                const FIRSTNAME = employSelected[0]
                const LASTNAME = employSelected[1]

                // Get list of current roles
                db.query("SELECT title from role", function (err, result) {
                    const roles = result.map((r) => `${r.title}`)
                    inquirer
                        .prompt(
                            {
                                name: "role",
                                type: "list",
                                message: "Select New Role",
                                //Select role
                                choices: [...roles]
                            }
                        )
                        .then((resp) => {
                        //Update selected employee with newly selected role
                        db.query("Update employee SET role_id = (SELECT id FROM role WHERE title = ?) WHERE first_name = ? AND last_name = ?", [resp.role, FIRSTNAME, LASTNAME], function (err, result) {
                            console.log("Successfully updated role")
                            start()
                        })
                    })
                })
            })
    })
}

//---------------------------Quit App---------------------------
function Quit() {
    console.log("Bye!!!")
    process.exit()
}

start()
