<template>
  <q-layout view="lHh Lpr lFf">
    <q-header style="background: #0d2040; border-bottom: 1px solid rgba(255,255,255,0.08)">
      <q-toolbar style="height: 60px">
        <q-btn flat dense round icon="menu" color="white" @click="drawer = !drawer" />
        <div class="logo-inline q-ml-sm">
          <div class="logo-icon-sm">
            <q-icon name="favorite" size="16px" color="white" />
          </div>
          <span class="logo-text-sm">intSaúde</span>
        </div>
        <q-space />
        <div class="user-chip">
          <q-icon name="person" size="16px" />
          <span>{{ auth.user?.name }}</span>
        </div>
        <q-btn flat round icon="logout" color="white" @click="handleLogout" size="sm" class="q-ml-sm">
          <q-tooltip>Sair</q-tooltip>
        </q-btn>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="drawer" show-if-above bordered :width="230" style="background: #0d2040">
      <div class="column full-height">
        <div class="sidebar-brand">
          <div class="sidebar-logo-box">
            <q-icon name="favorite" size="22px" color="white" />
          </div>
          <div>
            <div class="sidebar-name">intSaúde</div>
            <div class="sidebar-sub">Gestão em Saúde</div>
          </div>
        </div>

        <q-separator color="white" style="opacity: 0.08" />

        <q-list padding class="col q-pt-sm">
          <q-item
            v-for="item in navItems"
            :key="item.to"
            clickable v-ripple
            :to="item.to"
            :exact="item.exact"
            active-class="nav-active"
            class="nav-item rounded-borders q-mb-xs"
          >
            <q-item-section avatar>
              <q-icon :name="item.icon" size="20px" />
            </q-item-section>
            <q-item-section>{{ item.label }}</q-item-section>
          </q-item>
        </q-list>

        <div class="sidebar-footer">
          <q-separator color="white" style="opacity: 0.08; margin-bottom: 12px" />
          <div class="footer-badge">
            <span class="status-dot-sm" />
            15 unidades ativas
          </div>
        </div>
      </div>
    </q-drawer>

    <q-page-container style="background: #f0f4f8">
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'

const drawer = ref(false)
const router = useRouter()
const auth = useAuthStore()

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: 'dashboard', exact: true },
  { to: '/hospitals', label: 'Hospitais', icon: 'local_hospital', exact: false },
  { to: '/patients', label: 'Pacientes', icon: 'people', exact: false },
  { to: '/appointments', label: 'Agendamentos', icon: 'calendar_today', exact: false }
]

function handleLogout() {
  auth.logout()
  router.push('/login')
}
</script>

<style scoped>
.logo-inline {
  display: flex;
  align-items: center;
  gap: 8px;
}

.logo-icon-sm {
  width: 28px;
  height: 28px;
  background: rgba(255,255,255,0.12);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-text-sm {
  font-size: 17px;
  font-weight: 800;
  color: white;
  letter-spacing: -0.3px;
}

.user-chip {
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(255,255,255,0.1);
  border-radius: 20px;
  padding: 5px 12px;
  font-size: 13px;
  color: white;
  font-weight: 500;
}

.sidebar-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px 16px;
}

.sidebar-logo-box {
  width: 40px;
  height: 40px;
  background: rgba(255,255,255,0.12);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.sidebar-name {
  font-size: 17px;
  font-weight: 800;
  color: white;
  letter-spacing: -0.3px;
}

.sidebar-sub {
  font-size: 11px;
  color: rgba(255,255,255,0.45);
}

.nav-item {
  color: rgba(255,255,255,0.6);
  border-radius: 10px;
  margin: 0 8px;
  transition: background 0.15s;
}

.nav-item:hover {
  background: rgba(255,255,255,0.07);
  color: white;
}

:deep(.nav-active) {
  background: rgba(255,255,255,0.12) !important;
  color: white !important;
}

.sidebar-footer {
  padding: 0 16px 20px;
}

.footer-badge {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 12px;
  color: rgba(255,255,255,0.45);
}

.status-dot-sm {
  width: 7px;
  height: 7px;
  background: #4ade80;
  border-radius: 50%;
  display: inline-block;
}
</style>
