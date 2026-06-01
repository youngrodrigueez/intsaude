<template>
  <q-page padding style="background: #f0f4f8; min-height: 100vh">
    <div class="row items-center q-mb-lg">
      <div>
        <div class="page-title">Agendamentos</div>
        <div class="page-sub">Consultas marcadas no sistema</div>
      </div>
      <q-space />
      <button class="add-btn" @click="openDialog()">
        <q-icon name="add" size="18px" />
        Novo Agendamento
      </button>
    </div>

    <div class="white-card">
      <div class="table-top">
        <div class="search-box">
          <q-icon name="search" size="16px" style="color: #94a3b8" />
          <input v-model="filter" placeholder="Buscar agendamento..." class="search-input" />
        </div>
      </div>

      <q-table
        :rows="filteredAppts"
        :columns="columns"
        row-key="id"
        flat
        :loading="loading"
        no-data-label="Nenhum agendamento cadastrado"
        hide-bottom
        :rows-per-page-options="[0]"
      >
        <template #body-cell-date="props">
          <q-td :props="props">{{ formatDate(props.row.date) }}</q-td>
        </template>

        <template #body-cell-status="props">
          <q-td :props="props">
            <div class="status-badge" :style="{ background: badgeBg(props.row.status), color: badgeColor(props.row.status) }">
              {{ statusLabel(props.row.status) }}
            </div>
          </q-td>
        </template>

        <template #body-cell-actions="props">
          <q-td :props="props">
            <div class="action-btns">
              <button class="icon-btn edit-btn" @click="openDialog(props.row)">
                <q-icon name="edit" size="16px" />
              </button>
              <button class="icon-btn del-btn" @click="confirmDelete(props.row)">
                <q-icon name="delete" size="16px" />
              </button>
            </div>
          </q-td>
        </template>
      </q-table>
    </div>

    <q-dialog v-model="dialog" persistent>
      <q-card style="width: 560px; max-width: 95vw; border-radius: 16px; overflow: hidden">
        <div class="dialog-header">
          <div class="dialog-title">{{ editing ? 'Editar Agendamento' : 'Novo Agendamento' }}</div>
          <button class="close-btn" @click="dialog = false">
            <q-icon name="close" size="18px" />
          </button>
        </div>

        <q-card-section class="q-pt-lg">
          <q-form @submit="saveAppointment" class="q-gutter-sm">
            <div class="row q-col-gutter-sm">
              <div class="col-12">
                <q-select v-model="form.patient_id" label="Paciente *" outlined :options="patientOptions" emit-value map-options :rules="[req]" />
              </div>
              <div class="col-12">
                <q-select v-model="form.hospital_id" label="Hospital *" outlined :options="hospitalOptions" emit-value map-options :rules="[req]" />
              </div>
              <div class="col-12 col-sm-6">
                <q-input v-model="form.date" label="Data *" outlined type="date" stack-label :rules="[req]" />
              </div>
              <div class="col-12 col-sm-6">
                <q-input v-model="form.time" label="Hora *" outlined type="time" stack-label :rules="[req]" />
              </div>
              <div class="col-12">
                <q-select v-model="form.status" label="Status" outlined :options="statusOptions" emit-value map-options />
              </div>
              <div class="col-12">
                <q-input v-model="form.notes" label="Observações" outlined type="textarea" rows="3" />
              </div>
            </div>
            <div class="row justify-end q-mt-sm q-gutter-sm">
              <q-btn label="Cancelar" flat v-close-popup />
              <q-btn label="Salvar" type="submit" unelevated :loading="saving" style="background: #0d2040; color: white" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const appointments = ref([])
const patients = ref([])
const hospitals = ref([])
const filter = ref('')
const loading = ref(false)
const saving = ref(false)
const dialog = ref(false)
const editing = ref(null)

const emptyForm = () => ({ patient_id: null, hospital_id: null, date: '', time: '', status: 'scheduled', notes: '' })
const form = ref(emptyForm())
const req = val => !!val || 'Campo obrigatório'

const patientOptions = computed(() => patients.value.map(p => ({ label: p.name, value: p.id })))
const hospitalOptions = computed(() => hospitals.value.map(h => ({ label: h.name, value: h.id })))
const statusOptions = [
  { label: 'Agendado', value: 'scheduled' },
  { label: 'Concluído', value: 'completed' },
  { label: 'Cancelado', value: 'cancelled' }
]

const columns = [
  { name: 'patient_name', label: 'Paciente', field: 'patient_name', align: 'left', sortable: true },
  { name: 'hospital_name', label: 'Hospital', field: 'hospital_name', align: 'left', sortable: true },
  { name: 'date', label: 'Data', field: 'date', align: 'left', sortable: true },
  { name: 'time', label: 'Hora', field: 'time', align: 'left' },
  { name: 'status', label: 'Status', field: 'status', align: 'center' },
  { name: 'actions', label: 'Ações', field: 'actions', align: 'center', sortable: false }
]

const filteredAppts = computed(() => {
  if (!filter.value) return appointments.value
  const s = filter.value.toLowerCase()
  return appointments.value.filter(a =>
    a.patient_name?.toLowerCase().includes(s) ||
    a.hospital_name?.toLowerCase().includes(s)
  )
})

function formatDate(d) {
  return new Date(d + 'T00:00:00').toLocaleDateString('pt-BR')
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

function openDialog(row = null) {
  editing.value = row
  form.value = row
    ? { patient_id: row.patient_id, hospital_id: row.hospital_id, date: row.date, time: row.time, status: row.status, notes: row.notes || '' }
    : emptyForm()
  dialog.value = true
}

async function load() {
  loading.value = true
  const [aRes, pRes, hRes] = await Promise.all([
    axios.get('/api/appointments'),
    axios.get('/api/patients'),
    axios.get('/api/hospitals')
  ])
  appointments.value = aRes.data
  patients.value = pRes.data
  hospitals.value = hRes.data
  loading.value = false
}

async function saveAppointment() {
  saving.value = true
  try {
    if (editing.value) {
      await axios.put(`/api/appointments/${editing.value.id}`, form.value)
      $q.notify({ type: 'positive', message: 'Agendamento atualizado!' })
    } else {
      await axios.post('/api/appointments', form.value)
      $q.notify({ type: 'positive', message: 'Agendamento criado!' })
    }
    dialog.value = false
    await load()
  } catch {
    $q.notify({ type: 'negative', message: 'Erro ao salvar agendamento' })
  } finally {
    saving.value = false
  }
}

function confirmDelete(row) {
  $q.dialog({
    title: 'Confirmar exclusão',
    message: `Deseja remover o agendamento de <strong>${row.patient_name}</strong>?`,
    html: true,
    cancel: { label: 'Cancelar', flat: true },
    ok: { label: 'Remover', color: 'negative', unelevated: true },
    persistent: true
  }).onOk(async () => {
    await axios.delete(`/api/appointments/${row.id}`)
    $q.notify({ type: 'positive', message: 'Agendamento removido!' })
    await load()
  })
}

onMounted(load)
</script>

<style scoped>
.page-title { font-size: 24px; font-weight: 700; color: #0d2040; }
.page-sub { font-size: 14px; color: #64748b; margin-top: 2px; }

.add-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #0d2040;
  color: white;
  border: none;
  border-radius: 12px;
  padding: 10px 18px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;
}

.add-btn:hover { background: #1a3560; }

.white-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 1px 4px rgba(13,32,64,0.06);
  overflow: hidden;
}

.table-top { padding: 16px 16px 8px; }

.search-box {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #f8fafc;
  border-radius: 10px;
  padding: 9px 14px;
  width: 260px;
}

.search-input {
  border: none;
  outline: none;
  font-size: 14px;
  color: #334155;
  background: transparent;
  width: 100%;
}

.status-badge {
  display: inline-block;
  font-size: 12px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 20px;
}

.action-btns { display: flex; gap: 6px; justify-content: center; }

.icon-btn {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.15s;
}

.edit-btn { background: #eff6ff; color: #2563eb; }
.edit-btn:hover { background: #dbeafe; }
.del-btn { background: #fef2f2; color: #dc2626; }
.del-btn:hover { background: #fee2e2; }

.dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  background: #0d2040;
}

.dialog-title { font-size: 17px; font-weight: 700; color: white; }

.close-btn {
  background: rgba(255,255,255,0.12);
  border: none;
  border-radius: 8px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: white;
}
</style>
