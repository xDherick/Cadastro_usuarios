# 🧩 User System — Full Stack

Sistema completo de cadastro, autenticação e gerenciamento de usuários.

**Stack:** React + Node.js (Express) + PostgreSQL + Prisma + JWT

---

## 📁 Estrutura do projeto

```
user-system/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma       # Modelos do banco (User, Session, Role)
│   ├── src/
│   │   ├── controllers/        # Lógica de negócio
│   │   ├── middleware/         # Auth JWT, validação, erros
│   │   ├── routes/             # Endpoints da API
│   │   ├── app.js              # Express + middlewares
│   │   └── server.js           # Entry point
│   ├── .env.example
│   └── package.json
└── frontend/
    ├── src/
    │   ├── contexts/           # AuthContext (estado global)
    │   ├── components/         # PrivateRoute, AdminRoute
    │   ├── pages/              # Register, Login, Dashboard, Admin
    │   ├── services/           # api.js (Axios configurado)
    │   ├── App.jsx             # Rotas
    │   └── main.jsx
    ├── .env.example
    ├── index.html
    └── package.json
```

---

## 🚀 Como rodar

### Pré-requisitos

- Node.js 18+
- PostgreSQL rodando localmente

---

### 1. Backend

```bash
cd backend

# Instala dependências
npm install

# Cria o arquivo de variáveis de ambiente
cp .env.example .env
# Edite o .env com suas credenciais do PostgreSQL e um JWT_SECRET forte

# Cria as tabelas no banco
npx prisma migrate dev --name init

# Inicia o servidor em modo desenvolvimento
npm run dev
# → http://localhost:3001
```

---

### 2. Frontend

```bash
cd frontend

# Instala dependências
npm install

# Cria o arquivo de variáveis de ambiente
cp .env.example .env

# Inicia o servidor de desenvolvimento
npm run dev
# → http://localhost:5173
```

---

## 🔑 Endpoints da API

| Método | Endpoint            | Auth     | Descrição                  |
|--------|---------------------|----------|----------------------------|
| POST   | /api/auth/register  | —        | Cadastrar usuário           |
| POST   | /api/auth/login     | —        | Login e retorno do JWT      |
| GET    | /api/auth/me        | JWT      | Dados do usuário logado     |
| GET    | /api/users          | Admin    | Listar usuários (paginado)  |
| GET    | /api/users/:id      | JWT      | Buscar usuário por ID       |
| PATCH  | /api/users/:id      | JWT      | Atualizar usuário           |
| DELETE | /api/users/:id      | Admin    | Remover usuário             |

---

## 👤 Roles

| Role  | Permissões                                           |
|-------|------------------------------------------------------|
| USER  | Ver e editar o próprio perfil                        |
| ADMIN | Tudo acima + listar, editar e remover outros usuários|

Para criar o primeiro admin, rode no psql ou Prisma Studio:
```sql
UPDATE users SET role = 'ADMIN' WHERE email = 'seu@email.com';
```
Ou via Prisma Studio: `npm run db:studio`