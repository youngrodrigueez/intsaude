<template>
  <div class="login-bg">
    <div class="blob blob-1" />
    <div class="blob blob-2" />
    <div class="blob blob-3" />

    <!-- Header / Brand -->
    <div class="brand-section fade-in" style="animation-delay: 0s">
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
    <div class="tab-wrapper fade-in" style="animation-delay: 0.1s">
      <div class="tab-switcher">
        <button class="tab-btn" :class="{ active: tab === 'login' }" @click="tab = 'login'">Entrar</button>
        <button class="tab-btn" :class="{ active: tab === 'register' }" @click="tab = 'register'">Cadastrar</button>
      </div>
    </div>

    <!-- Card Login -->
    <div v-if="tab === 'login'" class="form-card fade-in" style="animation-delay: 0.18s">
      <div class="form-title">Bem-vindo de volta</div>
      <div class="form-sub">Entre com sua conta para continuar</div>

      <form @submit.prevent="handleLogin">
        <div class="field-group">
          <label class="field-label">E-MAIL</label>
          <div class="input-row">
            <q-icon name="mail" size="18px" class="field-icon" />
            <input v-model="email" type="email" placeholder="seu@email.com" class="field-input has-icon" required />
          </div>
        </div>

        <div class="field-group">
          <label class="field-label">SENHA</label>
          <div class="input-row">
            <q-icon name="lock" size="18px" class="field-icon" />
            <input v-model="password" :type="showPass ? 'text' : 'password'" placeholder="••••••••" class="field-input has-icon has-action" required />
            <button type="button" class="ver-btn" @click="showPass = !showPass">
              {{ showPass ? 'Ocultar' : 'Ver' }}
            </button>
          </div>
          <div class="forgot-row">
            <a href="#" class="forgot-link">Esqueci minha senha</a>
          </div>
        </div>

        <button type="submit" class="submit-btn" :disabled="loading">
          <q-spinner v-if="loading" size="18px" color="white" />
          <span v-else>Entrar</span>
        </button>
      </form>
    </div>

    <!-- Card Cadastro -->
    <div v-else class="form-card fade-in" style="animation-delay: 0.18s">
      <div class="form-title">Criar conta</div>
      <div class="form-sub">Preencha os dados para se cadastrar</div>

      <form @submit.prevent="handleRegister">
        <div class="field-group">
          <label class="field-label">NOME COMPLETO</label>
          <div class="input-row">
            <q-icon name="person" size="18px" class="field-icon" />
            <input v-model="regName" type="text" placeholder="Seu nome" class="field-input has-icon" required />
          </div>
        </div>

        <div class="field-group">
          <label class="field-label">E-MAIL</label>
          <div class="input-row">
            <q-icon name="mail" size="18px" class="field-icon" />
            <input v-model="regEmail" type="email" placeholder="seu@email.com" class="field-input has-icon" required />
          </div>
        </div>

        <div class="field-group">
          <label class="field-label">SENHA</label>
          <div class="input-row">
            <q-icon name="lock" size="18px" class="field-icon" />
            <input v-model="regPassword" :type="showRegPass ? 'text' : 'password'" placeholder="••••••••" class="field-input has-icon has-action" required />
            <button type="button" class="ver-btn" @click="showRegPass = !showRegPass">
              {{ showRegPass ? 'Ocultar' : 'Ver' }}
            </button>
          </div>
        </div>

        <div class="field-group">
          <label class="field-label">CONFIRMAR SENHA</label>
          <div class="input-row">
            <q-icon name="lock" size="18px" class="field-icon" />
            <input v-model="regConfirm" :type="showRegPass ? 'text' : 'password'" placeholder="••••••••" class="field-input has-icon" required />
          </div>
        </div>

        <button type="submit" class="submit-btn" :disabled="loadingReg">
          <q-spinner v-if="loadingReg" size="18px" color="white" />
          <span v-else>Criar conta</span>
        </button>
      </form>
    </div>

    <div class="footer-note fade-in" style="animation-delay: 0.3s">
      © 2026 intSaúde — Curso Análise e Desenvolvimento de Sistemas - UCB
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
  background: linear-gradient(160deg, #0a1830 0%, #0d2040 45%, #123158 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 48px 20px 32px;
  position: relative;
  overflow: hidden;
}

.blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(60px);
  pointer-events: none;
  z-index: 0;
}

.blob-1 {
  width: 320px;
  height: 320px;
  background: rgba(37, 99, 235, 0.25);
  top: -120px;
  left: -100px;
}

.blob-2 {
  width: 280px;
  height: 280px;
  background: rgba(74, 222, 128, 0.12);
  bottom: -80px;
  right: -80px;
}

.blob-3 {
  width: 220px;
  height: 220px;
  background: rgba(126, 184, 247, 0.15);
  top: 40%;
  right: -60px;
}

.fade-in {
  position: relative;
  z-index: 1;
  animation: fadeInUp 0.5s ease both;
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(14px); }
  to { opacity: 1; transform: translateY(0); }
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
  box-shadow: 0 20px 50px rgba(0,0,0,0.35), 0 4px 12px rgba(0,0,0,0.15);
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

.field-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
  pointer-events: none;
}

.field-input.has-icon {
  padding-left: 42px;
}

.field-input.has-action {
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
  background: linear-gradient(135deg, #123158 0%, #0d2040 100%);
  color: #ffffff;
  border: none;
  border-radius: 14px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  margin-top: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s;
  box-shadow: 0 4px 14px rgba(13,32,64,0.3);
}

.submit-btn:hover {
  background: linear-gradient(135deg, #1a3560 0%, #163056 100%);
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(13,32,64,0.4);
}

.submit-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

.footer-note {
  margin-top: 24px;
  font-size: 12px;
  color: rgba(255,255,255,0.35);
  text-align: center;
}
</style>
