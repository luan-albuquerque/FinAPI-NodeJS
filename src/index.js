const { response, application, request } = require('express');
const express = require('express')
const { v4: uuidv4 } = require('uuid')

const customers = [];

const app = express();
app.use(express.json());
// Middleware
function verifyExistsAcountCPG(req, res, next) {

    const { cpf } = req.headers;

    const customer = customers.find((customer) => customer.cpf === cpf);

    if (!customer) {

        return res.status(400).json({ error: "Customer not found" })
    }

    req.customer = customer

    return next();

}

function getBalance(statement) {

    const balance = statement.reduce((acc, operation) => {
        if (operation.type === 'Credit') {
            return acc + operation.amount
        } else {

            return acc - operation.amount
        }
    }, 0);
    return balance;

}

app.post("/account", (req, res) => {
    const { cpf, name } = req.body

    //Verificando CPF Existente
    const customerAlreadyExists = customers.some(
        (customers) => customers.cpf === cpf
    );

    if (customerAlreadyExists) {
        return res.status(400).json({ error: "Customer Already exists!" })
    }

    customers.push({
        cpf,
        name,
        id: uuidv4(),
        statement: []
    });

    return res.status(201).send();
})

//app.use(verifyExistsAcountCPG) //  Middkeware Para todas as rotas

app.get("/statement", verifyExistsAcountCPG, (req, res) => {

    const { customer } = req

    return res.json(customer.statement)

})

app.post("/deposit", verifyExistsAcountCPG, (req, res) => {

    const { customer } = req
    const { description, amount } = req.body

    const statementOperation = {
        description,
        amount,
        created_at: new Date(),
        type: "Credit"

    }

    customer.statement.push(statementOperation);

    return res.status(201).send();
})

app.post("/withdraw", verifyExistsAcountCPG, (req, res) => {
    const { amount } = req.body
    const { customer } = req;

    const balance = getBalance(customer.statement)

    if (balance < amount) {
        return res.status(400).json({ erro: "Insufficient Funds!!" })
    }

    const statementOperation = {
        amount,
        created_at: new Date(),
        type: 'debit'
    }

    customer.statement.push(statementOperation)

    return res.status(200).send();

});

app.get("/statement/date", verifyExistsAcountCPG, (req, res) => {
    const { customer } = req;
    const { date } = req.query
    const dateFormat = new Date(date + " 00:00");

    const statement = customer.statement.filter((statement) =>
        statement.created_at.toDateString() ===
        new Date(dateFormat).toDateString());

    return res.json(statement)

})


app.put("/account", verifyExistsAcountCPG, (req, res) => {

    const { name } = req.body
    const { customer } = req
    customer.name = name;

    return res.status(201).send();
})

app.get('/account',verifyExistsAcountCPG, (req,res) => {

     const { customer } = req;
     
    return res.json(customer);
})

app.delete("/account",verifyExistsAcountCPG, (req,res) => {
    const { customer } = req;
    
    customers.splice(customer, 1)

    return res.status(200).json(customers)
})


app.get('/balance', verifyExistsAcountCPG, (req,res) => {

   const { customer } = req
   const balance = getBalance(customer.statement);

   return res.json(balance)

})

app.listen(3333)