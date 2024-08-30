<h1>Projeto de processamento de imagens com Gemini AI</h1>

<h2>Sobre o projeto:</h2>
<p>É o back-end de um serviço que gerencia a leitura individualizada de 
consumo de água e gás. Para facilitar a coleta da informação, o serviço utilizará IA para 
obter a medição através da foto de um medidor.
</p>

<h2>Como executar o projeto:</h2>
1. Primeiramente, é necessário ter o docker instalado.<br/>
2. Clonar este repositório.<br/>
3. Criar na pasta raíz do projeto (a mesma pasta deste README) um arquivo '.env'  contendo a variável de ambiente GEMINI_API_KEY .<br/>
4. Executar o comando <code>docker compose up --build</code><br/>
5. O comando acima deverá:<br/> 
    <li> Criar um container contendo o postgres e as configurações do banco dados necessárias;</li>
    <li> Criar um outro container contendo a build do projeto;</li>
6. Ao terminar a build com sucesso, a API poderá ser acessada em <b>localhost:3000</b>.<br/>
7. Se deseja executar o projeto em ambiente de desenvolvimento, de forma que alterações no código afetem o projeto (nodemon), execute o comando: <code>docker compose -f docker-compose.dev.yml up --build</code><br/>

<h2>Rotas disponibilizadas: </h2>
1. POST  localhost:3000/upload<br/>
2. PATCH localhost:3000/confirm<br/>
3. GET   localhost:3000/customers/:customer_code/list (opcionalmente seguido de ?measure_type=WATER OU ?measure_type=GAS)<br/>
4. POST  localhost:3000/customers<br/>

<h2>Testes Unitários</h2>
1. Criei os casos de teste principais para todas as rotas utilizando Jest.<br/>
2. A variável de ambiente GEMINI_API_KEY é necessária para alguns teses!<br/>
3. Os testes podem ser realizados:<br/>
  <li> Localmente: <code>npm test</code></li><br/>
  <li> Docker: <code>docker compose -f docker-compose.dev.yml run test</code></li><br/>
4. Em algumas vezes eu tive o problema de TIMEDOUT, pois as dependências demoraram (+83s) para instalar no Docker. Esse problema ocorreu apenas em teste. Após algumas tentativas, funciona normalmente.

<hr />
  <h4>Mateus Rossi, 2024</h4>
  <h4>rossijf2@gmail.com</h4>

