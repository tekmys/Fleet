const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

const root = __dirname.replace(/[\\/]scripts$/, '')
const backend = path.join(root, 'lms-backend')
const frontend = path.join(root, 'lms-frontend')

function run(cmd, cwd) {
  console.log(`\n> ${cmd}`)
  execSync(cmd, { cwd, stdio: 'inherit' })
}

console.log('╔══════════════════════════════════════════╗')
console.log('║       AI LMS — First-Time Setup         ║')
console.log('╚══════════════════════════════════════════╝')

// 1. Install sub-project dependencies
console.log('\n📦 Installing backend dependencies...')
run('npm install', backend)

console.log('\n📦 Installing frontend dependencies...')
run('npm install --legacy-peer-deps', frontend)

// 2. Create .env files if missing
function ensureEnv(dir, name) {
  const envPath = path.join(dir, '.env')
  const examplePath = path.join(dir, '.env.example')
  if (!fs.existsSync(envPath)) {
    fs.copyFileSync(examplePath, envPath)
    console.log(`  ✔ Created ${name}/.env from .env.example`)
  } else {
    console.log(`  ✔ ${name}/.env already exists`)
  }
}

console.log('\n⚙️  Setting up environment files...')
ensureEnv(backend, 'lms-backend')
ensureEnv(frontend, 'lms-frontend')

// 3. Prisma generate + migrate + seed
console.log('\n🗄️  Setting up database...')
run('npx prisma generate', backend)
run('npx prisma migrate deploy', backend)
run('npm run prisma:seed', backend)

console.log('\n╔══════════════════════════════════════════╗')
console.log('║            ✅ Setup complete!             ║')
console.log('╠══════════════════════════════════════════╣')
console.log('║  Run:  npm run dev                      ║')
console.log('║                                          ║')
console.log('║  Backend:  http://localhost:3000          ║')
console.log('║  Frontend: http://localhost:5173          ║')
console.log('║                                          ║')
console.log('║  Logins (password: password123):          ║')
console.log('║    admin@lms.dev                         ║')
console.log('║    lecturer@lms.dev                      ║')
console.log('║    student@lms.dev                       ║')
console.log('╚══════════════════════════════════════════╝')
