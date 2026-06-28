<template>
  <q-page padding style="background: #f0f4f8; min-height: 100vh">
    <div class="page-header q-mb-lg">
      <div class="page-title">Meu Perfil</div>
      <div class="page-sub">Gerencie suas informações de conta</div>
    </div>

    <div class="profile-layout">
      <!-- Card de resumo -->
      <div class="white-card summary-card">
        <div class="avatar-circle">
          <q-icon name="person" size="40px" color="white" />
        </div>
        <div class="summary-name">{{ profile.name }}</div>
        <div class="summary-email">{{ profile.email }}</div>
        <div class="summary-role">{{ profile.role === 'admin' ? 'Administrador' : 'Usuário' }}</div>

        <div class="summary-divider" />

        <div class="summary-row">
          <q-icon name="calendar_today" size="16px" style="color: #94a3b8" />
          <span>Conta criada em {{ createdAtFormatted }}</span>
        </div>
      </div>

      <!-- Card de edição -->
      <div class="white-card form-card-profile">
        <div class="card-title">Editar Informações</div>

        <q-form @submit="saveProfile" class="q-gutter-md q-mt-sm">
          <q-input v-model="form.name" label="Nome completo" outlined :rules="[req]" />
          <q-input :model-value="profile.email" label="E-mail" outlined disable />

          <div class="section-divider">
            <span>Alterar senha (opcional)</span>
          </div>

          <q-input
            v-model="form.currentPassword"
            label="Senha atual"
            outlined
            :type="showPass ? 'text' : 'password'"
          >
            <template #append>
              <q-icon :name="showPass ? 'visibility_off' : 'visibility'" class="cursor-pointer" @click="showPass = !showPass" />
            </template>
          </q-input>
          <q-input
            v-model="form.newPassword"
            label="Nova senha"
            outlined
            :type="showPass ? 'text' : 'password'"
            hint="Deixe em branco para não alterar"
          />
          <q-input
            v-model="form.confirmPassword"
            label="Confirmar nova senha"
            outlined
            :type="showPass ? 'text' : 'password'"
          />

          <div class="row justify-end q-mt-md">
            <q-btn label="Salvar Alterações" type="submit" unelevated :loading="saving" style="background: #0d2040; color: white" />
          </div>
        </q-form>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import { useQuasar } from 'quasar'
import { useAuthStore } from '../stores/auth.js'

const $q = useQuasar()
const auth = useAuthStore()

const profile = ref({ name: '', email: '', role: '', created_at: '' })
const form = ref({ name: '', currentPassword: '', newPassword: '', confirmPassword: '' })
const showPass = ref(false)
const saving = ref(false)
const req = val => !!val || 'Campo obrigatório'

const createdAtFormatted = computed(() => {
  if (!profile.value.created_at) return '—'
  return new Date(profile.value.created_at).toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'long', year: 'numeric'
  })
})

async function load() {
  const res = await axios.get('/api/auth/me')
  profile.value = res.data
  form.value.name = res.data.name
}

async function saveProfile() {
  if (form.value.newPassword || form.value.confirmPassword) {
    if (form.value.newPassword !== form.value.confirmPassword) {
      $q.notify({ type: 'negative', message: 'As senhas não coincidem' })
      return
    }
    if (form.value.newPassword.length < 6) {
      $q.notify({ type: 'negative', message: 'A nova senha deve ter pelo menos 6 caracteres' })
      return
    }
  }

  saving.value = true
  try {
    const res = await axios.put('/api/auth/me', {
      name: form.value.name,
      currentPassword: form.value.currentPassword || undefined,
      newPassword: form.value.newPassword || undefined
    })
    auth.setSession(res.data.token, res.data.user)
    profile.value = res.data.user
    form.value.currentPassword = ''
    form.value.newPassword = ''
    form.value.confirmPassword = ''
    $q.notify({ type: 'positive', message: 'Perfil atualizado com sucesso!' })
  } catch (err) {
    $q.notify({ type: 'negative', message: err.response?.data?.message || 'Erro ao atualizar perfil' })
  } finally {
    saving.value = false
  }
}

onMounted(load)
</script>

<style scoped>
.page-title { font-size: 24px; font-weight: 700; color: #0d2040; }
.page-sub { font-size: 14px; color: #64748b; margin-top: 2px; }

.profile-layout {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 20px;
  align-items: start;
}

@media (max-width: 720px) {
  .profile-layout { grid-template-columns: 1fr; }
}

.white-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 1px 4px rgba(13,32,64,0.06);
  padding: 24px;
}

.summary-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.avatar-circle {
  width: 76px;
  height: 76px;
  border-radius: 50%;
  background: #0d2040;
  color: white;
  font-size: 26px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 14px;
}

.summary-name { font-size: 17px; font-weight: 700; color: #0d2040; }
.summary-email { font-size: 13px; color: #64748b; margin-top: 2px; }

.summary-role {
  display: inline-block;
  margin-top: 10px;
  background: #eff6ff;
  color: #2563eb;
  font-size: 12px;
  font-weight: 600;
  padding: 4px 12px;
  border-radius: 20px;
}

.summary-divider {
  width: 100%;
  height: 1px;
  background: #f1f5f9;
  margin: 18px 0;
}

.summary-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #64748b;
}

.card-title { font-size: 16px; font-weight: 700; color: #0d2040; }

.section-divider {
  position: relative;
  text-align: center;
  margin: 8px 0;
}

.section-divider span {
  background: white;
  padding: 0 10px;
  font-size: 12px;
  font-weight: 600;
  color: #94a3b8;
  position: relative;
  z-index: 1;
}

.section-divider::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background: #f1f5f9;
}
</style>
