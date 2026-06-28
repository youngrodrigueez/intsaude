<template>
  <q-page padding style="background: #f0f4f8; min-height: 100vh">
    <div class="page-header q-mb-lg">
      <div class="page-title">Sobre Nós</div>
      <div class="page-sub">Conheça o projeto e quem o desenvolveu</div>
    </div>

    <!-- Sobre o projeto -->
    <div class="white-card q-mb-lg">
      <div class="intro-row">
        <div class="intro-icon">
          <q-icon name="favorite" size="28px" color="white" />
        </div>
        <div>
          <div class="card-title">O Projeto</div>
          <p class="intro-text">
            O intSaúde foi desenvolvido com o objetivo de reduzir as burocracias existentes
            na área da saúde, agregando agilidade e dinamismo ao processo.
          </p>
          <p class="intro-text">
            É uma ferramenta que oferece funcionalidades focadas na parte administrativa do
            serviço, trazendo funções como cadastro de pacientes, agendamento de consultas,
            monitoramento e emissão de relatórios.
          </p>
        </div>
      </div>
    </div>

    <!-- Funcionalidades -->
    <div class="section-title q-mb-md">O que oferecemos</div>
    <div class="row q-col-gutter-md q-mb-lg">
      <div class="col-12 col-sm-6 col-md-3" v-for="f in features" :key="f.label">
        <div class="feature-card">
          <div class="feature-icon" :style="{ background: f.bg }">
            <q-icon :name="f.icon" size="22px" :style="{ color: f.color }" />
          </div>
          <div class="feature-label">{{ f.label }}</div>
        </div>
      </div>
    </div>

    <!-- Equipe -->
    <div class="section-title q-mb-md">Equipe de Desenvolvimento</div>
    <div class="row q-col-gutter-md q-mb-lg">
      <div class="col-12 col-sm-6 col-md-4" v-for="dev in team" :key="dev.name">
        <div class="dev-card">
          <div class="dev-avatar">
            <q-icon name="person" size="32px" color="white" />
          </div>
          <div class="dev-name">{{ dev.name }}</div>
          <div class="dev-role">{{ dev.role }}</div>
        </div>
      </div>
    </div>

    <!-- Instituição -->
    <div class="white-card institution-card">
      <q-icon name="school" size="32px" style="color: #0d2040" />
      <div>
        <div class="institution-name">Universidade Católica de Brasília</div>
        <div class="institution-course">Curso de Análise e Desenvolvimento de Sistemas</div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
const features = [
  { label: 'Cadastro de Pacientes', icon: 'person_add', color: '#2563eb', bg: '#eff6ff' },
  { label: 'Agendamento de Consultas', icon: 'calendar_month', color: '#0891b2', bg: '#ecfeff' },
  { label: 'Monitoramento', icon: 'monitor_heart', color: '#16a34a', bg: '#f0fdf4' },
  { label: 'Emissão de Relatórios', icon: 'description', color: '#d97706', bg: '#fffbeb' }
]

const team = [
  { name: 'Samuel Rodrigues', role: 'Desenvolvedor Full Stack' },
  { name: 'Thaylon Pontaleão', role: 'Prototipação e Documentação' },
  { name: 'Arthur Rocha', role: 'Modelagem e Desenvolvimento de Banco de Dados' }
]
</script>

<style scoped>
.page-title { font-size: 24px; font-weight: 700; color: #0d2040; }
.page-sub { font-size: 14px; color: #64748b; margin-top: 2px; }
.section-title { font-size: 16px; font-weight: 700; color: #0d2040; }

.white-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 1px 4px rgba(13,32,64,0.06);
}

.intro-row {
  display: flex;
  gap: 18px;
  align-items: flex-start;
}

.intro-icon {
  width: 52px;
  height: 52px;
  background: #0d2040;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.card-title { font-size: 16px; font-weight: 700; color: #0d2040; margin-bottom: 8px; }

.intro-text {
  font-size: 14px;
  color: #475569;
  line-height: 1.6;
  margin: 0 0 10px;
}

.feature-card {
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 1px 4px rgba(13,32,64,0.06);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 10px;
  height: 100%;
}

.feature-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.feature-label { font-size: 13px; font-weight: 600; color: #0d2040; }

.dev-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 1px 4px rgba(13,32,64,0.06);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  height: 100%;
}

.dev-avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: #0d2040;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
}

.dev-name { font-size: 15px; font-weight: 700; color: #0d2040; }
.dev-role { font-size: 12px; color: #64748b; margin-top: 4px; }

.institution-card {
  display: flex;
  align-items: center;
  gap: 16px;
}

.institution-name { font-size: 16px; font-weight: 700; color: #0d2040; }
.institution-course { font-size: 13px; color: #64748b; margin-top: 2px; }
</style>
