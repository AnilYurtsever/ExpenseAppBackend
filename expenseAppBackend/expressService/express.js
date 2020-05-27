const express = require("express");
const database = require("./../databaseService/database");
const app = express();
app.use(express.json());

function createExpenseHandler() {
    app.post("/expense/create", (request, response) => {
        const expense = request.body.expense;
        if (!isExpenseDataValidForCreate(expense)) {
            response.status(400);
            response.send({
                status: "Missing property in the request object!"
            });
        } else {
            if (!isExpenseValid(expense)) {
                response.status(400);
                response.send({
                   status: "Wrong/inconsistent expense data!"
                });
            } else {
                database.addExpense(expense).then(
                    () => {
                        response.status(200);
                        response.send({
                            status: "Expense successfully created!"
                        })
                    }
                ).catch(
                    () => {
                        response.status(500);
                        response.send({
                            status: "Failed to create expense!"
                        });
                    }
                );
            }
        }
    });
}

function getExpensesHandler() {
    app.get("/expense/get", (request, response) => {
        const expenseFilter = request.body.expenseFilter;

        if (!isExpenseFilterValid(expenseFilter)) {
            response.status(400);
            response.send({
                status: "Missing property in the request object!"
            });
        } else {
            database.getExpenses(expenseFilter).then(
                (result) => {
                    response.status(200);
                    response.send(result);
                }
            ).catch(
                () => {
                    response.status(500);
                    response.send({
                        status: "Failed to get expenses!"
                    });
                }
            );
        }
    });
}

function updateExpenseHandler() {
    app.put("/expense/update", (request, response) => {
        const receiptNumber = request.headers.receiptNumber;
        const expense = request.body.updatedExpense;
        if (!isExpenseDataValidForUpdate(expense)) {
            response.status(400);
            response.send({
                status: "Missing property in the request object!"
            });
        } else {
            if (!isExpenseValid(expense)) {
                response.status(400);
                response.send({
                    status: "Wrong/inconsistent expense data!"
                });
            } else {
                database.updateExpense(receiptNumber, expense).then(
                    () => {
                        response.status(200);
                        response.send({
                            status: "Expense successfully updated!"
                        });
                    }
                ).catch(
                    () => {
                        response.status(500);
                        response.send({
                            status: "Failed to update expense!"
                        });
                    }
                )
            }
        }
    });
}

function deleteExpenseHandler() {
    app.delete("/expense/delete", (request, response) => {
        const receiptNumber = request.headers.receiptNumber;
        if (!isReceiptNumberValid(receiptNumber)) {
            response.status(400);
            response.send({
                status: "Invalid receipt number!"
            })
        } else {
            database.deleteExpense(receiptNumber).then(
                () => {
                    response.status(200);
                    response.send({
                        status: "Expense successfully deleted!"
                    });
                }
            ).catch(
                () => {
                    response.status(500);
                    response.send({
                        status: "Failed to delete expense!"
                    });
                }
            )
        }
    });
}

function startHandlers() {
    createExpenseHandler();
    getExpensesHandler();
    updateExpenseHandler();
    deleteExpenseHandler();
    app.listen(3000);
}

function isExpenseValid(expense) {
    return ((expense.vatAmount === expense.totalAmount * expense.vatRate) &&
    (expense.currency === "TRY" || expense.currency === "EUR" || expense.currency === "USD") &&
    isReceiptNumberValid(expense.receiptNumber));
}

function isExpenseDataValidForCreate(expense) {
    return (
        isExpenseDataValidForUpdate(expense) &&
        expense.receiptNumber);
}

function isExpenseDataValidForUpdate(expense) {
    return (
        expense.organizationName &&
        expense.totalAmount &&
        expense.vatAmount &&
        expense.vatRate &&
        expense.currency &&
        expense.receiptDate);
}

function isExpenseFilterValid(expenseFilter) {
    return (
        expenseFilter.receiptNumber ||
        expenseFilter.organizationName ||
        expenseFilter.totalAmount ||
        expenseFilter.vatRate ||
        expenseFilter.currency ||
        expenseFilter.receiptDate);
}

function isReceiptNumberValid(receiptNumber) {
    return receiptNumber / 100000 >= 1;
}

module.exports = {startHandlers};

