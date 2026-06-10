# Guia de Execução Rápida com Docker - PDV Cantina

Este guia orienta o passo a passo para colocar a aplicação (Banco de Dados, Backend e Frontend) para rodar na sua máquina utilizando o Docker.

---

## 📋 Pré-requisitos

Antes de iniciar, certifique-se de que você possui o **Docker** e o **Docker Compose** instalados na sua máquina:
* [Download do Docker Desktop para Windows/Mac/Linux](https://www.docker.com/products/docker-desktop/)

---

## 🚀 Como Executar a Aplicação

Siga os passos abaixo no terminal do seu sistema operacional (Prompt de Comando, PowerShell ou Terminal do Linux/Mac):

### Passo 1: Acessar a pasta do projeto no terminal
Abra o terminal e navegue até a pasta onde os arquivos do projeto foram extraídos/baixados:
```bash
cd "caminho/para/a/pasta/pdv_byte"
```
*(Substitua `caminho/para/a/pasta/pdv_byte` pelo caminho real da pasta no seu computador)*.

### Passo 2: Executar o comando do Docker Compose
Para baixar as dependências, construir os containers e iniciar toda a aplicação de uma vez, execute o seguinte comando:
```bash
docker compose up --build
```
> 💡 **Dica:** Se você preferir rodar a aplicação em segundo plano (liberando o terminal atual para uso), adicione a flag `-d`:
> ```bash
> docker compose up -d --build
> ```

### Passo 3: Acessar a aplicação no navegador
Depois que o terminal mostrar que os serviços subiram com sucesso, você já pode acessar a interface no seu navegador:

* **Frontend (Interface do Usuário):** [http://localhost:5173](http://localhost:5173)
* **Backend (API):** [http://localhost:3001](http://localhost:3001)

---

## 🔑 Login do Administrador Mestre

A primeira inicialização do banco de dados cria automaticamente o usuário mestre para acesso total ao sistema:

* **E-mail:** `admincantina@gmail.com`
* **Senha:** `123456`

---

## 🛠️ Comandos Úteis do Docker

Caso precise controlar os containers em execução, utilize os comandos abaixo dentro da pasta do projeto:

* **Parar a aplicação:**
  ```bash
  docker compose down
  ```
* **Visualizar os logs (mensagens de erro e conexões):**
  ```bash
  docker compose logs -f
  ```
* **Reiniciar o banco de dados do zero (limpar todos os dados cadastrados):**
  ```bash
  docker compose down -v
  docker compose up --build
  ```
