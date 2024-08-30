<h1>Projeto de processamento de imagens com Gemini AI</h1>

<h2>Sobre o projeto:</h2>
<p>É o back-end de um serviço que gerencia a leitura individualizada de 
consumo de água e gás. Para facilitar a coleta da informação, o serviço utilizará IA para 
obter a medição através da foto de um medidor.
</p>

<h2>Como executar o projeto:</h2>
<p>Primeiramente, é necessário ter o docker instalado.</p>
<p>Para executar o projeto, deve-se clonar o repositório e criar na pasta raíz do projeto um arquivo '.env' contendo a variável de ambiente GEMINI_API_KEY.</p>
<p>Feito isso, basta executar o comando <code>docker compose up --build</code></p>
<p>O comando acima deverá: criar um container contendo o postgres e outro com a build do projeto.</p>

<p>Com isso, deve ser possível testar à partir da rota localhost:3000</p>

<p>As rotas disponíveis são: </p>