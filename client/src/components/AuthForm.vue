<template>
  <div class="auth-container">
    <div class="auth-card">
      <div class="auth-header">
        <div class="logo">
          <span>GreenTrack</span>
        </div>
        <p class="auth-subtitle">Keep your plants happy and healthy</p>
      </div>
      
      <div class="tabs">
        <div 
          class="tab" 
          :class="{ active: isLogin }" 
          @click="isLogin = true"
        >
          Login
        </div>
        <div 
          class="tab" 
          :class="{ active: !isLogin }" 
          @click="isLogin = false"
        >
          Register
        </div>
      </div>
      
      <form @submit.prevent="submitForm" class="auth-form">
        <div v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>
        
        <div v-if="!isLogin" class="form-group">
          <label for="username" class="form-label">Username</label>
          <input
            id="username"
            v-model="form.username"
            type="text"
            class="form-input"
            placeholder="Enter your username"
            required
          />
        </div>
        
        <div class="form-group">
          <label for="email" class="form-label">Email</label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            class="form-input"
            placeholder="Enter your email"
            required
          />
        </div>
        
        <div class="form-group">
          <label for="password" class="form-label">Password</label>
          <input
            id="password"
            v-model="form.password"
            type="password"
            class="form-input"
            placeholder="Enter your password"
            required
          />
        </div>
        
        <button type="submit" class="btn btn-primary auth-submit">
          {{ isLogin ? 'Login' : 'Register' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script>
import api from '@/services/api';

export default {
  name: 'AuthForm',
  data() {
    return {
      isLogin: true,
      form: {
        username: '',
        email: '',
        password: ''
      },
      errorMessage: ''
    };
  },
  methods: {
    async submitForm() {
      try {
        this.errorMessage = '';
        const endpoint = this.isLogin ? '/auth/login' : '/auth/register';
        const data = this.isLogin 
          ? { email: this.form.email, password: this.form.password }
          : this.form;
          
        await api.request('POST', endpoint, data);
        this.$router.push('/plants');
      } catch (error) {
        this.errorMessage = error.message || 'An error occurred';
      }
    }
  }
};
</script>

<style scoped>
.auth-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background-color: var(--background-alt);
}

.auth-card {
  width: 100%;
  max-width: 400px;
  background-color: var(--background);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  overflow: hidden;
}

.auth-header {
  padding: 2rem;
  text-align: center;
}

.auth-subtitle {
  margin-top: 0.5rem;
  color: var(--text-light);
  font-size: 0.875rem;
}

.auth-form {
  padding: 1.5rem;
}

.auth-submit {
  width: 100%;
  margin-top: 1rem;
}

.tabs {
  display: flex;
  border-bottom: 1px solid var(--border);
}

.tab {
  flex: 1;
  text-align: center;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tab.active {
  border-bottom: 2px solid var(--primary);
  color: var(--primary);
  font-weight: 500;
}
</style>

