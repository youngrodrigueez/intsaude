<template>
  <q-page padding style="background: #f0f4f8; min-height: 100vh">
    <div class="row items-center q-mb-lg">
      <div>
        <div class="page-title">Pacientes</div>
        <div class="page-sub">Gerencie os pacientes cadastrados</div>
      </div>
      <q-space />
      <div class="row q-gutter-sm">
        <button class="export-btn" @click="exportPDF">
          <q-icon name="picture_as_pdf" size="17px" />
          PDF
        </button>
        <button class="export-btn" @click="exportExcel">
          <q-icon name="grid_on" size="17px" />
          Excel
        </button>
        <button class="add-btn" @click="openDialog()">
          <q-icon name="add" size="18px" />
          Novo Paciente
        </button>
      </div>
    </div>

    <div class="white-card">
      <div class="table-top">
        <div class="search-box">
          <q-icon name="search" size="16px" style="color: #94a3b8" />
          <input v-model="filter" placeholder="Buscar paciente..." class="search-input" />
        </div>
      </div>

      <q-table
        :rows="filteredPatients"
        :columns="columns"
        row-key="id"
        flat
        :loading="loading"
        no-data-label="Nenhum paciente cadastrado"
        hide-bottom
        :rows-per-page-options="[0]"
      >
        <template #body-cell-birth_date="props">
          <q-td :props="props">
            {{ props.row.birth_date ? formatDate(props.row.birth_date) : '—' }}
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
          <div class="dialog-title">{{ editing ? 'Editar Paciente' : 'Novo Paciente' }}</div>
          <button class="close-btn" @click="dialog = false">
            <q-icon name="close" size="18px" />
          </button>
        </div>

        <q-card-section class="q-pt-lg">
          <q-form @submit="savePatient" class="q-gutter-sm">
            <div class="row q-col-gutter-sm">
              <div class="col-12">
                <q-input v-model="form.name" label="Nome completo *" outlined :rules="[req]" />
              </div>
              <div class="col-12 col-sm-6">
                <q-input v-model="form.cpf" label="CPF *" outlined mask="###.###.###-##" unmasked-value :rules="[req]" />
              </div>
              <div class="col-12 col-sm-6">
                <q-input v-model="form.birth_date" label="Data de Nascimento" outlined type="date" stack-label />
              </div>
              <div class="col-12 col-sm-6">
                <q-input v-model="form.phone" label="Telefone" outlined mask="(##) #####-####" />
              </div>
              <div class="col-12 col-sm-6">
                <q-input v-model="form.email" label="E-mail" outlined type="email" />
              </div>
              <div class="col-12">
                <q-input v-model="form.address" label="Endereço" outlined />
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
const patients = ref([])
const filter = ref('')
const loading = ref(false)
const saving = ref(false)
const dialog = ref(false)
const editing = ref(null)

const emptyForm = () => ({ name: '', cpf: '', email: '', phone: '', birth_date: '', address: '' })
const form = ref(emptyForm())
const req = val => !!val || 'Campo obrigatório'

const columns = [
  { name: 'name', label: 'Nome', field: 'name', align: 'left', sortable: true },
  { name: 'cpf', label: 'CPF', field: 'cpf', align: 'left' },
  { name: 'phone', label: 'Telefone', field: 'phone', align: 'left' },
  { name: 'email', label: 'E-mail', field: 'email', align: 'left' },
  { name: 'birth_date', label: 'Nascimento', field: 'birth_date', align: 'left' },
  { name: 'actions', label: 'Ações', field: 'actions', align: 'center', sortable: false }
]

const filteredPatients = computed(() => {
  if (!filter.value) return patients.value
  const s = filter.value.toLowerCase()
  return patients.value.filter(p =>
    p.name?.toLowerCase().includes(s) ||
    p.cpf?.includes(s) ||
    p.email?.toLowerCase().includes(s)
  )
})

function formatDate(d) {
  return new Date(d + 'T00:00:00').toLocaleDateString('pt-BR')
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
  doc.text('Relatorio de Pacientes', 14, 20)
  doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 145, 20)

  doc.setTextColor(0, 0, 0)

  autoTable(doc, {
    startY: 35,
    head: [['Nome', 'CPF', 'Telefone', 'E-mail', 'Nascimento']],
    body: patients.value.map(p => [
      p.name,
      p.cpf,
      p.phone || '—',
      p.email || '—',
      p.birth_date ? formatDate(p.birth_date) : '—'
    ]),
    headStyles: { fillColor: [13, 32, 64], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [240, 244, 248] },
    styles: { fontSize: 10 }
  })

  doc.save('pacientes-intsaude.pdf')
}

function exportExcel() {
  const headers = ['Nome', 'CPF', 'Telefone', 'E-mail', 'Nascimento', 'Endereço']
  const rows = patients.value.map(p => [
    p.name,
    p.cpf,
    p.phone || '',
    p.email || '',
    p.birth_date ? formatDate(p.birth_date) : '',
    p.address || ''
  ])

  const csv = [headers, ...rows]
    .map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(';'))
    .join('\n')

  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'pacientes-intsaude.csv'
  link.click()
  URL.revokeObjectURL(url)
}

function openDialog(row = null) {
  editing.value = row
  form.value = row ? { ...row } : emptyForm()
  dialog.value = true
}

async function load() {
  loading.value = true
  patients.value = (await axios.get('/api/patients')).data
  loading.value = false
}

async function savePatient() {
  saving.value = true
  try {
    if (editing.value) {
      await axios.put(`/api/patients/${editing.value.id}`, form.value)
      $q.notify({ type: 'positive', message: 'Paciente atualizado!' })
    } else {
      await axios.post('/api/patients', form.value)
      $q.notify({ type: 'positive', message: 'Paciente cadastrado!' })
    }
    dialog.value = false
    await load()
  } catch (err) {
    $q.notify({ type: 'negative', message: err.response?.data?.message || 'Erro ao salvar' })
  } finally {
    saving.value = false
  }
}

function confirmDelete(row) {
  $q.dialog({
    title: 'Confirmar exclusão',
    message: `Deseja remover <strong>${row.name}</strong>?`,
    html: true,
    cancel: { label: 'Cancelar', flat: true },
    ok: { label: 'Remover', color: 'negative', unelevated: true },
    persistent: true
  }).onOk(async () => {
    await axios.delete(`/api/patients/${row.id}`)
    $q.notify({ type: 'positive', message: 'Paciente removido!' })
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
  padding: 9px 16px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
}
.export-btn:hover { background: #f0f4f8; }

.white-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 1px 4px rgba(13,32,64,0.06);
  overflow: hidden;
}

.table-top {
  padding: 16px 16px 8px;
}

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
