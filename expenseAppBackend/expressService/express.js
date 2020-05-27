const express = require("express");
const database = require("./../databaseService/database");
const app = express();
app.use(express.json());

function createExpenseHandler() {
    app.post("/expense/create", (request, response) => {
        const expense = request.body;
        if (!(expense.organizationName &&
            expense.totalAmount &&
            expense.vatAmount &&
            expense.vatRate &&
            expense.currency &&
            expense.receiptNumber &&
            expense.receiptDate)) {
                response.status(400);
                response.send({
                    status: "Missing property in the request object!"
                });
        } else {
            database.addExpense(expense).then(
                result => {
                    response.status(200);
                    response.send({
                        status: "Expense successfully created!"
                    })
                },
                error => {
                    response.status(500);
                    response.send({
                        status: "Failed to create expense!"
                    })
                }
            )
        }
    });
}

function getExpensesHandler() {
    app.get("/expense/get", (request, response) => {
        console.log(request.headers);
        response.send("g");
    });
}

function updateExpenseHandler() {
    app.put("/expense/update", (request, response) => {
        console.log(request.headers);
        response.send("u");
    });
}

function deleteExpenseHandler() {
    app.delete("/expense/delete", (request, response) => {
        console.log(request.headers);
        response.send("d");
    });
}

function startHandlers() {
    app.listen(3000);
}

module.exports = {
    startHandlers,
    createExpenseHandler,
    getExpensesHandler,
    updateExpenseHandler,
    deleteExpenseHandler};

