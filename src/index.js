const express = require('express')
const { v4: uuidv4 } = require('uuid')

const customers = [];

const app = express();
app.use(express.json());
/**
 * CPF - STRING
 * NAME - STRING
 * ID - UUID
 * STATEMENT(EXTRATO) - [] -
 */
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


app.listen(3333)