<template>
  <q-page padding style="background: #f0f4f8; min-height: 100vh">
    <div class="row items-center q-mb-lg">
      <div>
        <div class="page-title">Hospitais</div>
        <div class="page-sub">Unidades disponíveis na região</div>
      </div>
      <q-space />
      <div class="search-box">
        <q-icon name="search" size="18px" style="color: #94a3b8" />
        <input
          v-model="search"
          placeholder="Buscar hospital, especialidade..."
          class="search-input"
        />
      </div>
    </div>

    <div v-if="loading" class="text-center q-mt-xl">
      <q-spinner size="48px" style="color: #0d2040" />
    </div>

    <div v-else-if="filtered.length === 0" class="empty-state">
      <q-icon name="search_off" size="56px" style="color: #cbd5e1" />
      <div class="empty-text">Nenhum hospital encontrado</div>
    </div>

    <div v-else class="row q-col-gutter-md">
      <div v-for="h in filtered" :key="h.id" class="col-12 col-sm-6 col-md-4">
        <div class="hospital-card">
          <div class="card-top">
            <div class="hospital-icon-box">
              <q-icon name="local_hospital" size="22px" color="white" />
            </div>
            <div class="avail-badge" :class="h.available ? 'avail-yes' : 'avail-no'">
              <span class="avail-dot" :class="h.available ? 'dot-green' : 'dot-gray'" />
              {{ h.available ? 'Disponível' : 'Indisponível' }}
            </div>
          </div>

          <div class="hospital-name">{{ h.name }}</div>
          <div class="specialty-tag">{{ h.specialty }}</div>

          <div class="info-list">
            <div class="info-row">
              <q-icon name="place" size="15px" style="color: #94a3b8" />
              <span>{{ h.address }}, {{ h.city }}</span>
            </div>
            <div class="info-row">
              <q-icon name="phone" size="15px" style="color: #94a3b8" />
              <span>{{ h.phone }}</span>
            </div>
          </div>

          <div class="card-footer">
            <div class="rating-row">
              <q-rating :model-value="h.rating" size="16px" color="warning" readonly />
              <span class="rating-val">{{ h.rating.toFixed(1) }}</span>
            </div>
            <button
              class="schedule-btn"
              :disabled="!h.available"
              @click="$router.push('/appointments')"
            >
              Agendar
            </button>
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'

const hospitals = ref([])
const search = ref('')
const loading = ref(true)

const filtered = computed(() => {
  if (!search.value) return hospitals.value
  const s = search.value.toLowerCase()
  return hospitals.value.filter(h =>
    h.name.toLowerCase().includes(s) ||
    h.specialty.toLowerCase().includes(s) ||
    h.city.toLowerCase().includes(s)
  )
})

onMounted(async () => {
  hospitals.value = (await axios.get('/api/hospitals')).data
  loading.value = false
})
</script>

<style scoped>
.page-title { font-size: 24px; font-weight: 700; color: #0d2040; }
.page-sub { font-size: 14px; color: #64748b; margin-top: 2px; }

.search-box {
  display: flex;
  align-items: center;
  gap: 8px;
  background: white;
  border-radius: 12px;
  padding: 10px 16px;
  box-shadow: 0 1px 4px rgba(13,32,64,0.06);
  width: 300px;
}

.search-input {
  border: none;
  outline: none;
  font-size: 14px;
  color: #334155;
  width: 100%;
  background: transparent;
}

.hospital-card {
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 1px 4px rgba(13,32,64,0.06);
  height: 100%;
  transition: box-shadow 0.2s;
  display: flex;
  flex-direction: column;
}

.hospital-card:hover {
  box-shadow: 0 4px 16px rgba(13,32,64,0.12);
}

.card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
}

.hospital-icon-box {
  width: 44px;
  height: 44px;
  background: #0d2040;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avail-badge {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 20px;
}

.avail-yes { background: #f0fdf4; color: #16a34a; }
.avail-no { background: #f8fafc; color: #94a3b8; }

.avail-dot { width: 6px; height: 6px; border-radius: 50%; display: inline-block; }
.dot-green { background: #4ade80; }
.dot-gray { background: #cbd5e1; }

.hospital-name {
  font-size: 16px;
  font-weight: 700;
  color: #0d2040;
  margin-bottom: 6px;
}

.specialty-tag {
  display: inline-block;
  background: #eff6ff;
  color: #2563eb;
  font-size: 12px;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 20px;
  margin-bottom: 14px;
}

.info-list { display: flex; flex-direction: column; gap: 6px; flex: 1; }

.info-row {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 13px;
  color: #64748b;
}

.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 16px;
  padding-top: 14px;
  border-top: 1px solid #f1f5f9;
}

.rating-row { display: flex; align-items: center; gap: 6px; }
.rating-val { font-size: 13px; color: #64748b; font-weight: 600; }

.schedule-btn {
  background: #0d2040;
  color: white;
  border: none;
  border-radius: 10px;
  padding: 8px 16px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;
}

.schedule-btn:hover { background: #1a3560; }
.schedule-btn:disabled { background: #e2e8f0; color: #94a3b8; cursor: not-allowed; }

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 80px 0;
  gap: 12px;
}

.empty-text { font-size: 15px; color: #94a3b8; }
</style>
