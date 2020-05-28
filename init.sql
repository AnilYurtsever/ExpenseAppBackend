CREATE TABLE Expense (
    OrganizationName VARCHAR(30) NOT NULL,
    TotalAmount DECIMAL(8, 2) NOT NULL,
    VATRate DECIMAL(3, 2) NOT NULL CHECK (VATRate = 0.08 OR VATRate = 0.18),
    VATAmount DECIMAL(10, 4) NOT NULL,
    Currency ENUM ('TRY', 'USD', 'EUR') NOT NULL,
    ReceiptNumber INT NOT NULL CHECK ( ReceiptNumber / 100000 >= 1 ),
    ReceiptDate DATETIME NOT NULL,
    ExpenseEntryDate DATETIME DEFAULT NOW() NOT NULL,
    CONSTRAINT PK_EXPENSE PRIMARY KEY (ReceiptNumber)
);

CREATE TABLE User (
    UserId INT AUTO_INCREMENT,
    UserName VARCHAR(30) NOT NULL UNIQUE,
    Password VARCHAR(30) NOT NULL,
    CONSTRAINT PK_USER PRIMARY KEY (UserId)
);
