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
        <template #body-cell-name="props">
          <q-td :props="props">
            <div class="row items-center q-gutter-sm no-wrap">
              <q-avatar size="28px">
                <img v-if="props.row.photo" :src="props.row.photo" />
                <q-icon v-else name="person" size="16px" style="color: #94a3b8" />
              </q-avatar>
              <span>{{ props.row.name }}</span>
              <q-icon v-if="props.row.has_allergy" name="warning" size="16px" color="orange">
                <q-tooltip>Possui alergia a medicamento</q-tooltip>
              </q-icon>
            </div>
          </q-td>
        </template>

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
              <button class="icon-btn sheet-btn" @click="downloadSheet(props.row)">
                <q-icon name="download" size="16px" />
                <q-tooltip>Baixar ficha do paciente</q-tooltip>
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
            <div class="photo-section">
              <div class="photo-preview" @click="triggerFileInput">
                <img v-if="form.photo" :src="form.photo" class="photo-img" />
                <q-icon v-else name="add_a_photo" size="26px" style="color: #94a3b8" />
              </div>
              <div class="photo-actions">
                <button type="button" class="photo-btn" @click="triggerFileInput">
                  {{ form.photo ? 'Trocar foto' : 'Anexar foto' }}
                </button>
                <button v-if="form.photo" type="button" class="photo-remove" @click="form.photo = ''">
                  Remover
                </button>
              </div>
              <input ref="fileInput" type="file" accept="image/*" class="hidden-input" @change="onPhotoSelected" />
            </div>

            <div class="row q-col-gutter-sm">
              <div class="col-12">
                <q-input v-model="form.name" label="Nome completo *" outlined :rules="[req]" />
              </div>
              <div class="col-12 col-sm-6">
                <q-input v-model="form.cpf" label="CPF *" outlined mask="###.###.###-##" unmasked-value :rules="[req]">
                  <template v-if="cpfDuplicate" #hint>
                    <span class="cpf-warning">
                      <q-icon name="warning" size="14px" /> CPF já cadastrado para {{ cpfDuplicate.name }}
                    </span>
                  </template>
                </q-input>
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

            <div class="checklist-title">Informações de Saúde</div>
            <div class="checklist-box">
              <q-checkbox v-model="form.has_allergy" label="Possui alergia a algum medicamento?" />
              <q-checkbox v-model="form.has_chronic_disease" label="Possui doença crônica (diabetes, hipertensão, etc.)?" />
              <q-checkbox v-model="form.takes_medication" label="Faz uso de medicação contínua?" />
              <q-checkbox v-model="form.had_surgery" label="Já realizou cirurgia anteriormente?" />
              <q-checkbox v-model="form.is_smoker" label="Fumante?" />
              <q-checkbox v-model="form.has_health_plan" label="Possui plano de saúde?" />
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

const emptyForm = () => ({
  name: '', cpf: '', email: '', phone: '', birth_date: '', address: '',
  has_allergy: false, has_chronic_disease: false, takes_medication: false,
  had_surgery: false, is_smoker: false, has_health_plan: false, photo: ''
})
const form = ref(emptyForm())
const fileInput = ref(null)
const req = val => !!val || 'Campo obrigatório'

function triggerFileInput() {
  fileInput.value.click()
}

function onPhotoSelected(e) {
  const file = e.target.files[0]
  if (!file) return
  if (file.size > 2 * 1024 * 1024) {
    $q.notify({ type: 'negative', message: 'A imagem deve ter no máximo 2MB' })
    return
  }
  const reader = new FileReader()
  reader.onload = () => { form.value.photo = reader.result }
  reader.readAsDataURL(file)
}

const columns = [
  { name: 'name', label: 'Nome', field: 'name', align: 'left', sortable: true },
  { name: 'cpf', label: 'CPF', field: 'cpf', align: 'left' },
  { name: 'phone', label: 'Telefone', field: 'phone', align: 'left' },
  { name: 'email', label: 'E-mail', field: 'email', align: 'left' },
  { name: 'birth_date', label: 'Nascimento', field: 'birth_date', align: 'left' },
  { name: 'actions', label: 'Ações', field: 'actions', align: 'center', sortable: false }
]

const cpfDuplicate = computed(() => {
  const clean = (form.value.cpf || '').replace(/\D/g, '')
  if (clean.length < 11) return null
  return patients.value.find(p =>
    p.cpf?.replace(/\D/g, '') === clean && p.id !== editing.value?.id
  ) || null
})

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

function downloadSheet(p) {
  const doc = new jsPDF()

  doc.setFillColor(13, 32, 64)
  doc.rect(0, 0, 210, 32, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text('intSaude', 14, 14)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  doc.text('Ficha do Paciente', 14, 23)
  doc.setFontSize(9)
  doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 160, 23)

  if (p.photo) {
    try {
      doc.addImage(p.photo, 'JPEG', 175, 6, 22, 22)
    } catch {}
  }

  doc.setTextColor(0, 0, 0)
  let y = 45

  doc.setFontSize(13)
  doc.setFont('helvetica', 'bold')
  doc.text('Dados Pessoais', 14, y)
  y += 8

  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  const personal = [
    ['Nome completo', p.name],
    ['CPF', p.cpf],
    ['Telefone', p.phone || '—'],
    ['E-mail', p.email || '—'],
    ['Data de nascimento', p.birth_date ? formatDate(p.birth_date) : '—'],
    ['Endereço', p.address || '—']
  ]
  personal.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold')
    doc.text(`${label}:`, 14, y)
    doc.setFont('helvetica', 'normal')
    doc.text(String(value), 70, y)
    y += 8
  })

  y += 4
  doc.setFontSize(13)
  doc.setFont('helvetica', 'bold')
  doc.text('Informações de Saúde', 14, y)
  y += 8

  doc.setFontSize(11)
  const health = [
    ['Possui alergia a medicamento?', p.has_allergy],
    ['Possui doença crônica?', p.has_chronic_disease],
    ['Faz uso de medicação contínua?', p.takes_medication],
    ['Já realizou cirurgia anteriormente?', p.had_surgery],
    ['Fumante?', p.is_smoker],
    ['Possui plano de saúde?', p.has_health_plan]
  ]
  health.forEach(([label, value]) => {
    doc.setFont('helvetica', 'normal')
    doc.text(`• ${label}`, 14, y)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(value ? 16 : 220, value ? 163 : 38, value ? 74 : 38)
    doc.text(value ? 'Sim' : 'Não', 150, y)
    doc.setTextColor(0, 0, 0)
    y += 8
  })

  doc.save(`ficha-${p.name.toLowerCase().replace(/\s+/g, '-')}.pdf`)
}

function openDialog(row = null) {
  editing.value = row
  form.value = row
    ? {
        ...row,
        has_allergy: !!row.has_allergy,
        has_chronic_disease: !!row.has_chronic_disease,
        takes_medication: !!row.takes_medication,
        had_surgery: !!row.had_surgery,
        is_smoker: !!row.is_smoker,
        has_health_plan: !!row.has_health_plan
      }
    : emptyForm()
  dialog.value = true
}

async function load() {
  loading.value = true
  patients.value = (await axios.get('/api/patients')).data
  loading.value = false
}

async function savePatient() {
  if (cpfDuplicate.value) {
    $q.notify({ type: 'negative', message: `CPF já cadastrado para ${cpfDuplicate.value.name}` })
    return
  }
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
.sheet-btn { background: #f0fdf4; color: #16a34a; }
.sheet-btn:hover { background: #dcfce7; }
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

.checklist-title {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.06em;
  color: #64748b;
  text-transform: uppercase;
  margin-top: 16px;
  margin-bottom: 6px;
}

.checklist-box {
  background: #f8fafc;
  border-radius: 12px;
  padding: 8px 14px;
  display: flex;
  flex-direction: column;
}

.photo-section {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 12px;
}

.photo-preview {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: #f1f5f9;
  border: 2px dashed #cbd5e1;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  overflow: hidden;
  flex-shrink: 0;
  transition: border-color 0.15s;
}
.photo-preview:hover { border-color: #2563eb; }

.photo-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.photo-actions {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.photo-btn {
  background: none;
  border: none;
  color: #2563eb;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  text-align: left;
  padding: 0;
}

.photo-remove {
  background: none;
  border: none;
  color: #dc2626;
  font-size: 12px;
  cursor: pointer;
  text-align: left;
  padding: 0;
}

.hidden-input {
  display: none;
}

.cpf-warning {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #dc2626;
  font-size: 12px;
  font-weight: 600;
}
</style>
