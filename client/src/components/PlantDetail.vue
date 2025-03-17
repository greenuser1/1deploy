<template>
  <div class="container">
    <div v-if="loading" class="loading">
      <div class="loading-spinner"></div>
      <p>Loading plant data...</p>
    </div>
    <div v-else-if="error" class="error">
      <p>{{ error }}</p>
      <button class="btn btn-primary" @click="fetchPlantData">Try Again</button>
    </div>
    <div v-else class="plant-detail">
      <div class="header">
        <h1>{{ plant.name }}</h1>
        <div class="actions">
          <button class="btn btn-outline" @click="goBack">Back</button>
          <button class="btn btn-primary" @click="showAddCareLogModal = true">Add Care Log</button>
        </div>
      </div>

      <div class="card">
        <h2>Plant Details</h2>
        <div class="plant-info">
          <p><strong>Species:</strong> {{ plant.species || 'Not specified' }}</p>
          <p><strong>Added:</strong> {{ formatDate(plant.createdAt) }}</p>
        </div>
      </div>

      <div class="card">
        <h2>Care Logs</h2>
        <div v-if="careLogsLoading" class="loading-inline">
          <div class="loading-spinner-small"></div>
          <p>Loading care logs...</p>
        </div>
        <div v-else-if="careLogs.length === 0" class="empty-state">
          <div class="empty-state-icon">📝</div>
          <div class="empty-state-text">No care logs yet.</div>
        </div>
        <div v-else class="care-logs">
          <div v-for="log in careLogs" :key="log._id" class="care-log-item">
            <div class="care-log-header">
              <span class="badge badge-primary">{{ formatCareType(log.type) }}</span>
              <span class="care-log-date">{{ formatDate(log.createdAt) }}</span>
            </div>
            <div class="care-log-body">
              <p>{{ log.notes || 'No notes' }}</p>
            </div>
          </div>
        </div>
      </div>

     
      <div v-if="showAddCareLogModal" class="modal">
        <div class="modal-content">
          <div class="modal-header">
            <h2>Add Care Log</h2>
            <button class="btn btn-text" @click="showAddCareLogModal = false">&times;</button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label class="form-label" for="care-type">Care Type</label>
              <select id="care-type" v-model="newCareLog.type" class="form-input">
                <option value="watering">Watering</option>
                <option value="fertilizing">Fertilizing</option>
                <option value="pruning">Pruning</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label" for="care-notes">Notes</label>
              <textarea
                id="care-notes"
                v-model="newCareLog.notes"
                class="form-input"
                rows="4"
                placeholder="Add any notes about this care activity..."
              ></textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-outline" @click="showAddCareLogModal = false">Cancel</button>
            <button 
              class="btn btn-primary" 
              @click="addCareLog"
              :disabled="addingCareLog"
            >
              {{ addingCareLog ? 'Saving...' : 'Save' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/services/api.js';

export default {
  name: 'PlantDetail',
  props: {
    id: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      plant: {},
      careLogs: [],
      loading: true,
      careLogsLoading: false,
      addingCareLog: false,
      error: null,
      showAddCareLogModal: false,
      newCareLog: {
        type: 'watering',
        notes: '',
        plant: ''
      }
    };
  },
  created() {
    this.fetchPlantData();
    window.addEventListener('beforeunload', this.handleBeforeUnload);
  },
  beforeUnmount() {
    window.removeEventListener('beforeunload', this.handleBeforeUnload);
  },
  methods: {
    handleBeforeUnload(event) {
      if (this.showAddCareLogModal && (this.newCareLog.notes || this.newCareLog.type !== 'watering')) {
        event.preventDefault();
        event.returnValue = '';
        return '';
      }
    },
    async fetchPlantData() {
      try {
        this.loading = true;
        this.error = null;
        
        const plantData = await api.get(`/plants/${this.id}`);
        this.plant = plantData;
        this.newCareLog.plant = this.id;
        
        await this.fetchCareLogs();
        this.loading = false;
      } catch (error) {
        this.error = `Failed to load plant: ${error.message}`;
        this.loading = false;
      }
    },
    async fetchCareLogs() {
      try {
        this.careLogsLoading = true;
        
        const allCareLogs = await api.getCareLogs();
        const plantId = this.id;
        
        this.careLogs = allCareLogs.filter(log => {
          return String(log.plant) === String(plantId);
        });
        
        this.careLogs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        this.careLogsLoading = false;
      } catch (error) {
        this.careLogsLoading = false;
      }
    },
    async addCareLog() {
      try {
        this.addingCareLog = true;
        
        const response = await api.createCareLog(this.newCareLog);
        this.careLogs.unshift(response);
        
        this.newCareLog.notes = '';
        this.newCareLog.type = 'watering';
        this.showAddCareLogModal = false;
        this.addingCareLog = false;
      } catch (error) {
        alert(`Failed to add care log: ${error.message}`);
        this.addingCareLog = false;
      }
    },
    formatDate(dateString) {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    },
    formatCareType(type) {
      const types = {
        watering: 'Watering',
        fertilizing: 'Fertilizing',
        pruning: 'Pruning',
        other: 'Other'
      };
      return types[type] || type;
    },
    goBack() {
      this.$router.push('/plants');
    }
  }
};
</script>

<style scoped>
.plant-detail {
  max-width: 800px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.actions {
  display: flex;
  gap: 0.5rem;
}

.card {
  margin-bottom: 1.5rem;
  padding: 1.5rem;
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  background-color: var(--background);
}

.plant-info {
  margin-top: 1rem;
}

.care-logs {
  margin-top: 1rem;
}

.care-log-item {
  padding: 1rem;
  border-bottom: 1px solid var(--border);
}

.care-log-item:last-child {
  border-bottom: none;
}

.care-log-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.care-log-date {
  font-size: 0.875rem;
  color: var(--text-light);
}

.care-log-body {
  margin-top: 0.5rem;
}

.loading, .error {
  text-align: center;
  padding: 2rem;
}

.loading-inline {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  gap: 0.5rem;
}

.loading-spinner {
  border: 3px solid var(--border);
  border-top: 3px solid var(--primary);
  border-radius: 50%;
  width: 30px;
  height: 30px;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

.loading-spinner-small {
  border: 2px solid var(--border);
  border-top: 2px solid var(--primary);
  border-radius: 50%;
  width: 20px;
  height: 20px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error {
  color: var(--error);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem 1rem;
  text-align: center;
}
</style>

