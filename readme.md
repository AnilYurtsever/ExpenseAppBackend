# Expense App

### MySQL database initialization (execute as sudo)
* CREATE DATABASE ExpenseDatabase;
* CREATE USER 'admin'@'localhost' IDENTIFIED BY 'admin';
* GRANT ALL PRIVILEGES ON ExpenseDatabase.* TO 'admin'@'localhost' IDENTIFIED BY 'admin';

### Tables initialization
* Execute init.sql to initialize the tables;

### Server initialization
* Run "npm install"
* Run "npm run start"

##### Server is ready to go, open frontend application
