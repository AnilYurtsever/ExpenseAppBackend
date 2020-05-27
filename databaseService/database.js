const mysql = require("mysql");

const config = {
    host: 'localhost',
    user: 'admin',
    password: 'admin',
    database: 'ExpenseDatabase'
};

async function sendQuery(query) {
    const connection = mysql.createConnection(config);
    connection.connect();
    return new Promise((resolve, reject) => {
        connection.query(query, async (error, result) => {
            if (error) {
                connection.destroy();
                reject(error);
            }
            connection.destroy();
            resolve(result);
        });
    });
}

async function addExpense(expense) {
    const query = `
    INSERT INTO Expense
        (
        OrganizationName,
        TotalAmount,
        VATAmount,
        VATRate,
        Currency,
        ReceiptNumber,
        ReceiptDate
        )
    VALUES
        (
        '${expense.organizationname}',
        ${expense.totalamount},
        ${expense.vatamount},
        ${expense.vatrate},
        '${expense.currency}',
        ${expense.receiptnumber},
        '${convertToMySQLDate(expense.receiptdate)}'
    );`;
    return sendQuery(query);
}

function getExpenses(expenseFilter) {

    let query;
    if (expenseFilter.receiptnumber) {
        if (expenseFilter.receiptnumber === "*") {
            query = `SELECT * FROM Expense;`;
        } else {
            query = `
                SELECT * FROM Expense
                WHERE
                    ReceiptNumber = ${expenseFilter.receiptnumber}
            ;`;
        }
    } else {
        query = `
        SELECT * FROM Expense
        WHERE
        `;
        if (expenseFilter.organizationname) {
            query += `OrganizationName LIKE '%${expenseFilter.organizationname}%' AND `;
        }
        if (expenseFilter.totalamount) {
            const min = expenseFilter.totalamountmin;
            const max = expenseFilter.totalamountmax;
            query += `TotalAmount BETWEEN ${min} AND ${max} AND `;
        }
        if (expenseFilter.vatRate) {
            query += `VATRate = ${expenseFilter.vatrate} AND `;
        }
        if (expenseFilter.currency) {
            query += `Currency = '${expenseFilter.currency}' AND `;
        }
        if (expenseFilter.receiptdate) {
            const earliestDate = convertToMySQLDate(expenseFilter.receiptdateearliest);
            const latestDate = convertToMySQLDate(expenseFilter.receiptdatelatest);
            query += `ReceiptDate BETWEEN CAST('${earliestDate}' AS DATE) AND CAST('${latestDate}' AS DATE) AND `;
        }
        query = query.substr(0, query.length - 5);
    }
    return sendQuery(query);
}

function updateExpense(updatedExpense) {
    const query = `
        UPDATE Expense
        SET
            OrganizationName = '${updatedExpense.organizationname}',
            TotalAmount = ${updatedExpense.totalamount},
            VATAmount = ${updatedExpense.vatamount},
            VATRate = ${updatedExpense.vatrate},
            Currency = '${updatedExpense.currency}',
            ReceiptDate = '${convertToMySQLDate(updatedExpense.receiptdate)}'
        WHERE ReceiptNumber = ${updatedExpense.receiptnumber};`;
    return sendQuery(query);
}

function deleteExpense(receiptNumber) {
    const query = `DELETE FROM Expense WHERE ReceiptNumber = ${receiptNumber};`;
    return sendQuery(query);
}

function convertToMySQLDate(date) {
    date = new Date(date);
    return date.toISOString().slice(0, 10);
}

module.exports = {addExpense, getExpenses, updateExpense, deleteExpense};
