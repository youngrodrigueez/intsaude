<template>
  <q-page padding style="background: #f0f4f8; min-height: 100vh">
    <div class="row items-center q-mb-lg">
      <div>
        <div class="page-title">Agendamentos</div>
        <div class="page-sub">Consultas marcadas no sistema</div>
      </div>
      <q-space />
      <div class="row q-gutter-sm">
        <div class="view-toggle">
          <button class="view-btn" :class="{ active: viewMode === 'list' }" @click="viewMode = 'list'">
            <q-icon name="view_list" size="16px" /> Lista
          </button>
          <button class="view-btn" :class="{ active: viewMode === 'calendar' }" @click="viewMode = 'calendar'">
            <q-icon name="calendar_month" size="16px" /> Calendário
          </button>
        </div>
        <button class="export-btn" @click="exportPDF">
          <q-icon name="picture_as_pdf" size="17px" />
          Exportar PDF
        </button>
        <button class="add-btn" @click="openDialog()">
          <q-icon name="add" size="18px" />
          Novo Agendamento
        </button>
      </div>
    </div>

    <!-- Visualização em Lista -->
    <div v-if="viewMode === 'list'" class="white-card">
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
              <button class="icon-btn voucher-btn" @click="downloadVoucher(props.row)">
                <q-icon name="receipt_long" size="16px" />
                <q-tooltip>Baixar comprovante</q-tooltip>
              </button>
              <button class="icon-btn del-btn" @click="confirmDelete(props.row)">
                <q-icon name="delete" size="16px" />
              </button>
            </div>
          </q-td>
        </template>
      </q-table>
    </div>

    <!-- Visualização em Calendário -->
    <div v-else class="white-card calendar-card">
      <div class="calendar-header">
        <button class="cal-nav-btn" @click="prevMonth">
          <q-icon name="chevron_left" size="20px" />
        </button>
        <div class="calendar-month-label">{{ monthLabel }}</div>
        <button class="cal-nav-btn" @click="nextMonth">
          <q-icon name="chevron_right" size="20px" />
        </button>
        <button class="today-btn" @click="goToday">Hoje</button>
      </div>

      <div class="calendar-grid">
        <div v-for="d in weekDays" :key="d" class="cal-weekday">{{ d }}</div>
        <div
          v-for="(day, i) in calendarDays"
          :key="i"
          class="cal-day"
          :class="{ 'cal-day-muted': !day.current, 'cal-day-today': isToday(day.date) }"
        >
          <div class="cal-day-number">{{ day.date.getDate() }}</div>
          <div class="cal-day-appts">
            <div
              v-for="appt in apptsForDay(day.date).slice(0, 3)"
              :key="appt.id"
              class="cal-appt-chip"
              :style="{ background: badgeBg(appt.status), color: badgeColor(appt.status) }"
              @click="openDialog(appt)"
            >
              {{ appt.time }} {{ appt.patient_name }}
            </div>
            <div v-if="apptsForDay(day.date).length > 3" class="cal-more">
              +{{ apptsForDay(day.date).length - 3 }} mais
            </div>
          </div>
        </div>
      </div>
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
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

const $q = useQuasar()
const appointments = ref([])
const patients = ref([])
const hospitals = ref([])
const filter = ref('')
const loading = ref(false)
const saving = ref(false)
const dialog = ref(false)
const editing = ref(null)
const viewMode = ref('list')
const calendarDate = ref(new Date())

const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

const monthLabel = computed(() => {
  const label = calendarDate.value.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
  return label.charAt(0).toUpperCase() + label.slice(1)
})

const calendarDays = computed(() => {
  const year = calendarDate.value.getFullYear()
  const month = calendarDate.value.getMonth()
  const firstDay = new Date(year, month, 1)
  const startOffset = firstDay.getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const daysInPrevMonth = new Date(year, month, 0).getDate()

  const days = []
  for (let i = startOffset - 1; i >= 0; i--) {
    days.push({ date: new Date(year, month - 1, daysInPrevMonth - i), current: false })
  }
  for (let d = 1; d <= daysInMonth; d++) {
    days.push({ date: new Date(year, month, d), current: true })
  }
  while (days.length < 42) {
    const last = days[days.length - 1].date
    const next = new Date(last)
    next.setDate(next.getDate() + 1)
    days.push({ date: next, current: false })
  }
  return days
})

function dayKey(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function apptsForDay(date) {
  const key = dayKey(date)
  return appointments.value.filter(a => a.date === key)
}

function isToday(date) {
  return dayKey(date) === dayKey(new Date())
}

function prevMonth() {
  calendarDate.value = new Date(calendarDate.value.getFullYear(), calendarDate.value.getMonth() - 1, 1)
}

function nextMonth() {
  calendarDate.value = new Date(calendarDate.value.getFullYear(), calendarDate.value.getMonth() + 1, 1)
}

function goToday() {
  calendarDate.value = new Date()
}

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

function downloadVoucher(appt) {
  const hospital = hospitals.value.find(h => h.id === appt.hospital_id)
  const doc = new jsPDF()

  doc.setFillColor(13, 32, 64)
  doc.rect(0, 0, 210, 36, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text('intSaude', 14, 16)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  doc.text('Comprovante de Agendamento', 14, 26)

  doc.setTextColor(0, 0, 0)

  doc.setDrawColor(226, 232, 240)
  doc.setLineWidth(0.5)
  doc.roundedRect(14, 46, 182, 110, 4, 4)

  let y = 60
  const statusTxt = statusLabel(appt.status)
  const statusColor = appt.status === 'scheduled' ? [37, 99, 235] : appt.status === 'completed' ? [22, 163, 74] : [220, 38, 38]

  doc.setFontSize(10)
  doc.setTextColor(148, 163, 184)
  doc.text('STATUS', 24, y)
  doc.setFontSize(13)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...statusColor)
  doc.text(statusTxt, 24, y + 7)
  y += 24

  doc.setTextColor(0, 0, 0)
  const rows = [
    ['Paciente', appt.patient_name],
    ['Hospital', appt.hospital_name],
    ['Endereço', hospital ? `${hospital.address}, ${hospital.city}` : '—'],
    ['Telefone', hospital?.phone || '—'],
    ['Data', formatDate(appt.date)],
    ['Horário', appt.time],
    ['Observações', appt.notes || '—']
  ]

  rows.forEach(([label, value]) => {
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(100, 116, 139)
    doc.text(label.toUpperCase(), 24, y)
    doc.setFontSize(12)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(15, 23, 42)
    const lines = doc.splitTextToSize(String(value), 160)
    doc.text(lines, 24, y + 6)
    y += 6 + lines.length * 6
  })

  doc.setFontSize(9)
  doc.setTextColor(148, 163, 184)
  doc.text('Apresente este comprovante e um documento com foto no dia da consulta.', 14, 168)
  doc.text(`Emitido em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`, 14, 174)

  doc.save(`comprovante-${appt.patient_name.toLowerCase().replace(/\s+/g, '-')}.pdf`)
}

function exportPDF() {
  const doc = new jsPDF()

  doc.setFillColor(13, 32, 64)
  doc.rect(0, 0, 210, 28, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text('intSaude', 14, 12)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text('Relatorio de Agendamentos', 14, 20)
  doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 145, 20)

  doc.setTextColor(0, 0, 0)

  autoTable(doc, {
    startY: 35,
    head: [['Paciente', 'Hospital', 'Data', 'Hora', 'Status']],
    body: appointments.value.map(a => [
      a.patient_name,
      a.hospital_name,
      formatDate(a.date),
      a.time,
      statusLabel(a.status)
    ]),
    headStyles: { fillColor: [13, 32, 64], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [240, 244, 248] },
    styles: { fontSize: 10 }
  })

  doc.save('agendamentos-intsaude.pdf')
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

.export-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: white;
  color: #0d2040;
  border: 2px solid #0d2040;
  border-radius: 12px;
  padding: 9px 18px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
}
.export-btn:hover { background: #f0f4f8; }

.view-toggle {
  display: flex;
  background: white;
  border-radius: 12px;
  padding: 4px;
  box-shadow: 0 1px 4px rgba(13,32,64,0.06);
  gap: 2px;
}

.view-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: transparent;
  border: none;
  border-radius: 9px;
  padding: 7px 14px;
  font-size: 13px;
  font-weight: 600;
  color: #64748b;
  cursor: pointer;
  transition: all 0.15s;
}

.view-btn.active {
  background: #0d2040;
  color: white;
}

.calendar-card { padding: 18px; }

.calendar-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.calendar-month-label {
  font-size: 16px;
  font-weight: 700;
  color: #0d2040;
  flex: 1;
  text-align: center;
}

.cal-nav-btn {
  background: #f0f4f8;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #0d2040;
  transition: background 0.15s;
}
.cal-nav-btn:hover { background: #e2e8f0; }

.today-btn {
  background: #0d2040;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 7px 14px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 6px;
}

.cal-weekday {
  text-align: center;
  font-size: 12px;
  font-weight: 700;
  color: #94a3b8;
  padding-bottom: 6px;
  text-transform: uppercase;
}

.cal-day {
  background: #f8fafc;
  border-radius: 10px;
  padding: 6px;
  min-height: 92px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  border: 2px solid transparent;
}

.cal-day-muted { opacity: 0.4; }
.cal-day-today { border-color: #2563eb; }

.cal-day-number {
  font-size: 12px;
  font-weight: 700;
  color: #334155;
}

.cal-day-appts {
  display: flex;
  flex-direction: column;
  gap: 2px;
  overflow: hidden;
}

.cal-appt-chip {
  font-size: 10px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 6px;
  cursor: pointer;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: opacity 0.15s;
}
.cal-appt-chip:hover { opacity: 0.7; }

.cal-more {
  font-size: 10px;
  color: #94a3b8;
  padding-left: 4px;
}

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
.voucher-btn { background: #f0fdf4; color: #16a34a; }
.voucher-btn:hover { background: #dcfce7; }
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
