
INSERT INTO department (dep_name)
VALUES ("Finance"),
       ("Marketing"),
       ("Human Resources"),
       ("Sales"),
       ("Accounting");

INSERT INTO ROLE (title, salary, department_id)
VALUES ("SR Analyst", 75000, 1),
       ("JR Analyst", 30000, 1),
       ("Marketing Manager", 70000, 2),
       ("Marketing Analyst", 20000, 2),
       ("HR Head", 15000, 3),
       ("Sales Manager", 50000, 4),
       ("Sales Rep", 40000, 4),
       ("SR Accoutant", 60000, 5),
       ("JR Accountant", 40000, 5);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES ("Billy", "Kane", 1, NULL),
       ("John", "Lical", 2, 1),
       ("Steph", "Lee", 3, NULL),
       ("Herm", "Bat", 4, 3),
       ("Liv", "Miller", 4, 3),
       ("Jen", "Knoheart", 5, NULL),
       ("Jung", "Kong", 6, NULL),
       ("Kwan", "Gunj", 7, 7),
       ("Steve", "Stone", 8, NULL),
       ("Seth", "Smooth", 9, 9);
