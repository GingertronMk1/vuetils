import { createRouter, createWebHistory } from 'vue-router'
import IndexPage from '@/resources/vue/Pages/IndexPage.vue'
import MovePage from '@/resources/vue/Pages/MovePage.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', component: IndexPage },
    { path: '/move', component: MovePage },
  ],
})

export default router
