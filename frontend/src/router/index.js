import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'

const routes = [
  { path: '/', redirect: '/dashboard' },
  {
    path: '/login',
    component: () => import('../pages/LoginPage.vue'),
    meta: { public: true }
  },
  {
    path: '/',
    component: () => import('../layouts/MainLayout.vue'),
    children: [
      { path: 'dashboard', component: () => import('../pages/DashboardPage.vue') },
      { path: 'hospitals', component: () => import('../pages/HospitalsPage.vue') },
      { path: 'patients', component: () => import('../pages/PatientsPage.vue') },
      { path: 'appointments', component: () => import('../pages/AppointmentsPage.vue') },
      { path: 'profile', component: () => import('../pages/ProfilePage.vue') }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to) => {
  const auth = useAuthStore()
  if (!to.meta.public && !auth.token) return '/login'
  if (to.path === '/login' && auth.token) return '/dashboard'
})

export default router
