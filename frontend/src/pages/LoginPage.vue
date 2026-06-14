<template>
  <div class="login-bg">
    <!-- Header / Brand -->
    <div class="brand-section">
      <div class="logo-box">
        <q-icon name="favorite" size="36px" color="white" />
      </div>
      <div class="brand-name">intSaúde</div>
      <div class="brand-sub">Hospitais do DF na palma da mão</div>
      <div class="status-badge">
        <span class="status-dot" />
        15 unidades disponíveis
      </div>
    </div>

    <!-- Tabs -->
    <div class="tab-wrapper">
      <div class="tab-switcher">
        <button class="tab-btn" :class="{ active: tab === 'login' }" @click="tab = 'login'">Entrar</button>
        <button class="tab-btn" :class="{ active: tab === 'register' }" @click="tab = 'register'">Cadastrar</button>
      </div>
    </div>

    <!-- Card Login -->
    <div v-if="tab === 'login'" class="form-card">
      <div class="form-title">Bem-vindo de volta</div>
      <div class="form-sub">Entre com sua conta para continuar</div>

      <form @submit.prevent="handleLogin">
        <div class="field-group">
          <label class="field-label">E-MAIL</label>
          <input v-model="email" type="email" placeholder="seu@email.com" class="field-input" required />
        </div>

        <div class="field-group">
          <label class="field-label">SENHA</label>
          <div class="input-row">
            <input v-model="password" :type="showPass ? 'text' : 'password'" placeholder="••••••••" class="field-input" required />
            <button type="button" class="ver-btn" @click="showPass = !showPass">
              {{ showPass ? 'Ocultar' : 'Ver' }}
            </button>
          </div>
          <div class="forgot-row">
            <a href="#" class="forgot-link">Esqueci minha senha</a>
          </div>
        </div>

        <button type="submit" class="submit-btn" :disabled="loading">
          {{ loading ? 'Entrando...' : 'Entrar' }}
        </button>
      </form>

      <div class="demo-section">
        <div class="demo-label">ACESSO DEMO</div>
        <div class="demo-card">
          <div class="demo-row">
            <span class="demo-key">E-mail</span>
            <span class="demo-val">admin@intsaude.com</span>
          </div>
          <div class="demo-row">
            <span class="demo-key">Senha</span>
            <span class="demo-val">admin123</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Card Cadastro -->
    <div v-else class="form-card">
      <div class="form-title">Criar conta</div>
      <div class="form-sub">Preencha os dados para se cadastrar</div>

      <form @submit.prevent="handleRegister">
        <div class="field-group">
          <label class="field-label">NOME COMPLETO</label>
          <input v-model="regName" type="text" placeholder="Seu nome" class="field-input" required />
        </div>

        <div class="field-group">
          <label class="field-label">E-MAIL</label>
          <input v-model="regEmail" type="email" placeholder="seu@email.com" class="field-input" required />
        </div>

        <div class="field-group">
          <label class="field-label">SENHA</label>
          <div class="input-row">
            <input v-model="regPassword" :type="showRegPass ? 'text' : 'password'" placeholder="••••••••" class="field-input" required />
            <button type="button" class="ver-btn" @click="showRegPass = !showRegPass">
              {{ showRegPass ? 'Ocultar' : 'Ver' }}
            </button>
          </div>
        </div>

        <div class="field-group">
          <label class="field-label">CONFIRMAR SENHA</label>
          <input v-model="regConfirm" :type="showRegPass ? 'text' : 'password'" placeholder="••••••••" class="field-input" required />
        </div>

        <button type="submit" class="submit-btn" :disabled="loadingReg">
          {{ loadingReg ? 'Cadastrando...' : 'Criar conta' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import axios from 'axios'
import { useAuthStore } from '../stores/auth.js'

const tab = ref('login')
const router = useRouter()
const $q = useQuasar()
const auth = useAuthStore()

// Login
const email = ref('')
const password = ref('')
const showPass = ref(false)
const loading = ref(false)

// Cadastro
const regName = ref('')
const regEmail = ref('')
const regPassword = ref('')
const regConfirm = ref('')
const showRegPass = ref(false)
const loadingReg = ref(false)

async function handleLogin() {
  loading.value = true
  try {
    await auth.login(email.value, password.value)
    router.push('/dashboard')
  } catch {
    $q.notify({ type: 'negative', message: 'E-mail ou senha inválidos', position: 'top' })
  } finally {
    loading.value = false
  }
}

async function handleRegister() {
  if (regPassword.value !== regConfirm.value) {
    $q.notify({ type: 'negative', message: 'As senhas não coincidem', position: 'top' })
    return
  }
  if (regPassword.value.length < 6) {
    $q.notify({ type: 'negative', message: 'A senha deve ter pelo menos 6 caracteres', position: 'top' })
    return
  }

  loadingReg.value = true
  try {
    const res = await axios.post('/api/auth/register', {
      name: regName.value,
      email: regEmail.value,
      password: regPassword.value
    })
    auth.token = res.data.token
    auth.user = res.data.user
    localStorage.setItem('token', res.data.token)
    localStorage.setItem('user', JSON.stringify(res.data.user))
    axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`
    $q.notify({ type: 'positive', message: `Bem-vindo, ${res.data.user.name}!`, position: 'top' })
    router.push('/dashboard')
  } catch (err) {
    const msg = err.response?.data?.message || 'Erro ao criar conta'
    $q.notify({ type: 'negative', message: msg, position: 'top' })
  } finally {
    loadingReg.value = false
  }
}
</script>

<style scoped>
.login-bg {
  min-height: 100vh;
  background: #0d2040;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 48px 20px 32px;
}

.brand-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  margin-bottom: 28px;
}

.logo-box {
  width: 72px;
  height: 72px;
  background: rgba(255,255,255,0.12);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
  backdrop-filter: blur(4px);
}

.brand-name {
  font-size: 32px;
  font-weight: 800;
  color: #ffffff;
  letter-spacing: -0.5px;
}

.brand-sub {
  font-size: 14px;
  color: #7eb8f7;
}

.status-badge {
  display: flex;
  align-items: center;
  gap: 7px;
  background: rgba(255,255,255,0.1);
  border-radius: 20px;
  padding: 5px 14px;
  font-size: 13px;
  color: #e0eeff;
  margin-top: 4px;
}

.status-dot {
  width: 8px;
  height: 8px;
  background: #4ade80;
  border-radius: 50%;
  display: inline-block;
}

.tab-wrapper {
  width: 100%;
  max-width: 400px;
  margin-bottom: -1px;
}

.tab-switcher {
  background: rgba(255,255,255,0.08);
  border-radius: 14px;
  padding: 4px;
  display: flex;
  gap: 4px;
}

.tab-btn {
  flex: 1;
  padding: 10px;
  border: none;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  background: transparent;
  color: rgba(255,255,255,0.5);
  transition: all 0.2s;
}

.tab-btn.active {
  background: #ffffff;
  color: #0d2040;
}

.form-card {
  background: #ffffff;
  border-radius: 20px;
  padding: 28px 24px 24px;
  width: 100%;
  max-width: 400px;
  margin-top: 8px;
}

.form-title {
  font-size: 22px;
  font-weight: 700;
  color: #0d2040;
  margin-bottom: 4px;
}

.form-sub {
  font-size: 14px;
  color: #6b7280;
  margin-bottom: 24px;
}

.field-group {
  margin-bottom: 16px;
}

.field-label {
  display: block;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: #374151;
  margin-bottom: 6px;
}

.field-input {
  width: 100%;
  padding: 13px 14px;
  border: none;
  background: #f3f4f6;
  border-radius: 12px;
  font-size: 15px;
  color: #111827;
  outline: none;
  box-sizing: border-box;
  transition: background 0.15s;
}

.field-input:focus {
  background: #e8f0fe;
}

.input-row {
  position: relative;
}

.input-row .field-input {
  padding-right: 70px;
}

.ver-btn {
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #2563eb;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

.forgot-row {
  text-align: right;
  margin-top: 8px;
}

.forgot-link {
  font-size: 13px;
  color: #2563eb;
  text-decoration: none;
  font-weight: 500;
}

.submit-btn {
  width: 100%;
  padding: 15px;
  background: #0d2040;
  color: #ffffff;
  border: none;
  border-radius: 14px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  margin-top: 8px;
  transition: background 0.2s;
}

.submit-btn:hover { background: #1a3560; }
.submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }

.demo-section { margin-top: 24px; }

.demo-label {
  text-align: center;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: #9ca3af;
  margin-bottom: 10px;
  position: relative;
}

.demo-label::before,
.demo-label::after {
  content: '';
  position: absolute;
  top: 50%;
  width: 30%;
  height: 1px;
  background: #e5e7eb;
}

.demo-label::before { left: 0; }
.demo-label::after { right: 0; }

.demo-card {
  background: #f9fafb;
  border-radius: 12px;
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.demo-row {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
}

.demo-key { color: #9ca3af; }
.demo-val { color: #111827; font-weight: 600; }
</style>
