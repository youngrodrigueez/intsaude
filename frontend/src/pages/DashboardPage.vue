<template>
  <q-page padding style="background: #f0f4f8; min-height: 100vh">
    <div class="page-header q-mb-lg">
      <div class="page-title">Olá, {{ auth.user?.name }}</div>
      <div class="page-sub">Aqui está o resumo de hoje</div>
    </div>

    <!-- Stat Cards -->
    <div class="row q-col-gutter-md q-mb-xl">
      <div class="col-12 col-sm-6 col-md-3" v-for="card in statCards" :key="card.label">
        <div class="stat-card">
          <div class="stat-icon" :style="{ background: card.bg }">
            <q-icon :name="card.icon" size="22px" :style="{ color: card.color }" />
          </div>
          <div class="stat-value">{{ card.value }}</div>
          <div class="stat-label">{{ card.label }}</div>
        </div>
      </div>
    </div>

    <!-- Charts -->
    <div class="row q-col-gutter-md q-mb-xl">
      <div class="col-12 col-md-7">
        <div class="white-card">
          <div class="card-title">Agendamentos por Mês</div>
          <Bar v-if="!loading" :data="monthlyChartData" :options="barOptions" style="max-height: 240px" />
          <div v-else class="chart-loading"><q-spinner color="primary" size="32px" /></div>
        </div>
      </div>
      <div class="col-12 col-md-5">
        <div class="white-card">
          <div class="card-title">Hospitais Mais Utilizados</div>
          <Doughnut v-if="!loading && hospitalChartData.labels.length" :data="hospitalChartData" :options="doughnutOptions" style="max-height: 240px" />
          <div v-else-if="!loading" class="empty-chart">Sem dados suficientes</div>
          <div v-else class="chart-loading"><q-spinner color="primary" size="32px" /></div>
        </div>
      </div>
    </div>

    <!-- Próximos Agendamentos -->
    <div class="section-title q-mb-md">Próximos Agendamentos</div>
    <div class="white-card">
      <div v-if="loading" class="text-center q-py-xl">
        <q-spinner color="primary" size="40px" />
      </div>
      <div v-else-if="upcoming.length === 0" class="empty-state">
        <q-icon name="event_busy" size="48px" style="color: #cbd5e1" />
        <div class="empty-text">Nenhum agendamento próximo</div>
      </div>
      <div v-else>
        <div v-for="appt in upcoming" :key="appt.id" class="appt-row">
          <div class="appt-avatar" :style="{ background: avatarBg(appt.status) }">
            {{ appt.patient_name.charAt(0).toUpperCase() }}
          </div>
          <div class="appt-info">
            <div class="appt-name">{{ appt.patient_name }}</div>
            <div class="appt-hospital">{{ appt.hospital_name }}</div>
          </div>
          <div class="appt-time">
            <div class="appt-date">{{ formatDate(appt.date) }}</div>
            <div class="appt-hour">{{ appt.time }}</div>
          </div>
          <div class="appt-badge" :style="{ background: badgeBg(appt.status), color: badgeColor(appt.status) }">
            {{ statusLabel(appt.status) }}
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import { useAuthStore } from '../stores/auth.js'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js'
import { Bar, Doughnut } from 'vue-chartjs'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement)

const auth = useAuthStore()
const loading = ref(true)
const patients = ref([])
const appointments = ref([])
const hospitals = ref([])

const today = new Date().toISOString().split('T')[0]

const statCards = computed(() => [
  { label: 'Total de Pacientes', value: patients.value.length, icon: 'people', color: '#2563eb', bg: '#eff6ff' },
  { label: 'Agendamentos Hoje', value: appointments.value.filter(a => a.date === today).length, icon: 'today', color: '#0891b2', bg: '#ecfeff' },
  { label: 'Hospitais Disponíveis', value: hospitals.value.filter(h => h.available).length, icon: 'local_hospital', color: '#16a34a', bg: '#f0fdf4' },
  { label: 'Total de Agendamentos', value: appointments.value.length, icon: 'event_note', color: '#d97706', bg: '#fffbeb' }
])

const upcoming = computed(() =>
  appointments.value.filter(a => a.date >= today && a.status === 'scheduled').slice(0, 6)
)

const monthlyChartData = computed(() => {
  const labels = []
  const data = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date()
    d.setMonth(d.getMonth() - i)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    labels.push(d.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }))
    data.push(appointments.value.filter(a => a.date?.startsWith(key)).length)
  }
  return {
    labels,
    datasets: [{
      label: 'Agendamentos',
      data,
      backgroundColor: '#0d2040',
      borderRadius: 8,
      borderSkipped: false
    }]
  }
})

const hospitalChartData = computed(() => {
  const counts = {}
  appointments.value.forEach(a => {
    if (a.hospital_name) counts[a.hospital_name] = (counts[a.hospital_name] || 0) + 1
  })
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5)
  const colors = ['#0d2040', '#2563eb', '#0891b2', '#16a34a', '#d97706']
  return {
    labels: sorted.map(([name]) => name.length > 22 ? name.slice(0, 22) + '...' : name),
    datasets: [{
      data: sorted.map(([, v]) => v),
      backgroundColor: colors,
      borderWidth: 0
    }]
  }
})

const barOptions = {
  responsive: true,
  plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => ` ${ctx.raw} agendamentos` } } },
  scales: { y: { beginAtZero: true, ticks: { stepSize: 1 }, grid: { color: '#f1f5f9' } }, x: { grid: { display: false } } }
}

const doughnutOptions = {
  responsive: true,
  plugins: { legend: { position: 'bottom', labels: { padding: 16, font: { size: 11 } } } },
  cutout: '65%'
}

function formatDate(d) {
  return new Date(d + 'T00:00:00').toLocaleDateString('pt-BR')
}

function avatarBg(s) {
  return s === 'scheduled' ? '#dbeafe' : s === 'completed' ? '#dcfce7' : '#fee2e2'
}

function badgeBg(s) {
  return s === 'scheduled' ? '#eff6ff' : s === 'completed' ? '#f0fdf4' : '#fef2f2'
}

function badgeColor(s) {
  return s === 'scheduled' ? '#2563eb' : s === 'completed' ? '#16a34a' : '#dc2626'
}

function statusLabel(s) {
  return s === 'scheduled' ? 'Agendado' : s === 'completed' ? 'Concluído' : 'Cancelado'
}

onMounted(async () => {
  const [pRes, aRes, hRes] = await Promise.all([
    axios.get('/api/patients'),
    axios.get('/api/appointments'),
    axios.get('/api/hospitals')
  ])
  patients.value = pRes.data
  appointments.value = aRes.data
  hospitals.value = hRes.data
  loading.value = false
})
</script>

<style scoped>
.page-title { font-size: 24px; font-weight: 700; color: #0d2040; }
.page-sub { font-size: 14px; color: #64748b; margin-top: 2px; }
.section-title { font-size: 16px; font-weight: 700; color: #0d2040; }

.stat-card {
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 1px 4px rgba(13,32,64,0.06);
}
.stat-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 14px;
}
.stat-value { font-size: 28px; font-weight: 800; color: #0d2040; line-height: 1; margin-bottom: 4px; }
.stat-label { font-size: 13px; color: #64748b; font-weight: 500; }

.white-card {
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 1px 4px rgba(13,32,64,0.06);
  height: 100%;
}

.card-title { font-size: 15px; font-weight: 700; color: #0d2040; margin-bottom: 16px; }

.chart-loading { display: flex; align-items: center; justify-content: center; height: 200px; }
.empty-chart { display: flex; align-items: center; justify-content: center; height: 200px; font-size: 14px; color: #94a3b8; }

.appt-row {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 0;
  border-bottom: 1px solid #f1f5f9;
}
.appt-row:last-child { border-bottom: none; }
.appt-row:hover { background: #f8fafc; margin: 0 -20px; padding: 14px 20px; }

.appt-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 15px;
  color: #0d2040;
  flex-shrink: 0;
}
.appt-info { flex: 1; min-width: 0; }
.appt-name { font-size: 14px; font-weight: 600; color: #0d2040; }
.appt-hospital { font-size: 12px; color: #64748b; margin-top: 2px; }
.appt-time { text-align: right; }
.appt-date { font-size: 13px; color: #334155; font-weight: 500; }
.appt-hour { font-size: 12px; color: #94a3b8; margin-top: 2px; }
.appt-badge { font-size: 12px; font-weight: 600; padding: 4px 10px; border-radius: 20px; white-space: nowrap; }

.empty-state { display: flex; flex-direction: column; align-items: center; padding: 48px 0; gap: 12px; }
.empty-text { font-size: 14px; color: #94a3b8; }
</style>
