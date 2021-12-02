const { response } = require('express');
const express = require('express')
const { v4: uuidv4 } = require('uuid')

const customers = [];

const app = express();
app.use(express.json());
// Middleware
function verifyExistsAcountCPG(req,res,next){


    const { cpf } = req.headers;
     
    const customer = customers.find(customer => customer.cpf === cpf);
  
    if(!customer){

        return res.status(400).json({error: "Customer not found"})
    }

    req.customer = customer

    return next();

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

app.get("/statement", verifyExistsAcountCPG, (req,res) =>{
      
      const { customer } = req

    return res.json(customer.statement)

})


app.listen(3333)