require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
const { Sequelize } = require('sequelize');

// Configuração do Sequelize com PostgreSQL
const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        dialect: 'postgres',
        port: process.env.DB_PORT,
    }
);

// Verifica a conexão com o banco de dados
sequelize.authenticate().then(() => {
    console.log('Conexão com o banco de dados foi bem-sucedida.');
}).catch(err => {
    console.error('Não foi possível conectar ao banco de dados:', err);
});

const app = express();

app.use(bodyParser.json());

// Rota para a documentação Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Rota de instalação para criar tabelas e popular o banco
app.get('/install', async (req, res) => {
    try {
        await sequelize.sync({ force: true });

        // Popule o banco de dados com dados iniciais
        await User.create({ username: 'admin', password: 'admin', isAdmin: true });

        res.status(200).send('Banco de dados configurado com sucesso!');
    } catch (err) {
        res.status(500).send('Erro ao configurar o banco de dados.');
    }
});

app.listen(3000, () => {
    console.log('Servidor rodando na porta 3000');
});
