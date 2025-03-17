<template>
  <div class="plant-manager">
    <header class="header container">
      <div class="logo">
        <span>GreenTrack</span>
      </div>
      <div class="nav">
        <button class="btn btn-text" @click="goToCalculator">
          Watering Calculator
        </button>
        <button class="btn btn-text" @click="logout">
          Logout
        </button>
      </div>
    </header>
    
    <main class="container">
      <div class="dashboard-header">
        <h1>My Plants</h1>
      </div>
      
      <div v-if="loading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>Loading plants...</p>
      </div>
      
      <div v-else-if="plants.length === 0" class="empty-state">
        <div class="empty-state-icon">🌱</div>
        <h3>No plants yet</h3>
        <p class="empty-state-text">Start by adding your first plant to track</p>
        <button class="btn btn-primary" @click="showAddPlantModal = true">
          Add Your First Plant
        </button>
      </div>
      
      <div v-else>
        <div class="add-plant-button-container">
          <button class="btn btn-primary" @click="showAddPlantModal = true">
            Add New Plant
          </button>
        </div>
        
        <div class="grid">
          <div v-for="plant in plants" :key="plant._id" class="plant-card">
            <div class="plant-card-header" @click="goToPlantDetail(plant._id)">
              <h3>{{ plant.name }}</h3>
              <div v-if="plant.species" class="badge badge-primary">
                {{ plant.species }}
              </div>
            </div>
            <div class="plant-card-body" @click="goToPlantDetail(plant._id)">
              <p>Added on {{ formatDate(plant.createdAt) }}</p>
              <div class="care-logs" v-if="getPlantLogs(plant._id).length > 0">
                <h4>Recent Care</h4>
                <ul class="care-log-list">
                  <li v-for="log in getPlantLogs(plant._id).slice(0, 2)" :key="log._id" class="care-log-item">
                    <span class="care-type">{{ log.type }}</span>
                    <span class="care-date">{{ formatDate(log.createdAt) }}</span>
                  </li>
                </ul>
              </div>
            </div>
            <div class="plant-card-actions">
              <button class="btn btn-text" @click.stop="showAddCareLogModal(plant)">
                Add Care
              </button>
              <button class="btn btn-text" @click.stop="openEditPlantModal(plant)">
                Edit
              </button>
              <button class="btn btn-text text-danger" @click.stop="confirmDeletePlant(plant)">
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
    
    <!-- Add Plant Modal -->
    <div v-if="showAddPlantModal" class="modal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Add New Plant</h3>
          <button class="btn btn-text" @click="showAddPlantModal = false">×</button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="addPlant">
            <div class="form-group">
              <label for="plantName" class="form-label">Plant Name</label>
              <input
                id="plantName"
                v-model="newPlant.name"
                type="text"
                class="form-input"
                placeholder="Enter plant name"
                required
              />
            </div>
            <div class="form-group">
              <label for="plantSpecies" class="form-label">Species (Optional)</label>
              <input
                id="plantSpecies"
                v-model="newPlant.species"
                type="text"
                class="form-input"
                placeholder="Enter plant species"
              />
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-outline" @click="showAddPlantModal = false">
                Cancel
              </button>
              <button type="submit" class="btn btn-primary">
                Add Plant
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
    
    <!-- Edit Plant Modal -->
    <div v-if="showEditPlantModal" class="modal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Edit Plant</h3>
          <button class="btn btn-text" @click="showEditPlantModal = false">×</button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="updatePlant">
            <div class="form-group">
              <label for="editPlantName" class="form-label">Plant Name</label>
              <input
                id="editPlantName"
                v-model="editingPlant.name"
                type="text"
                class="form-input"
                placeholder="Enter plant name"
                required
              />
            </div>
            <div class="form-group">
              <label for="editPlantSpecies" class="form-label">Species (Optional)</label>
              <input
                id="editPlantSpecies"
                v-model="editingPlant.species"
                type="text"
                class="form-input"
                placeholder="Enter plant species"
              />
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-outline text-danger" @click="deletePlant">
                Delete
              </button>
              <div>
                <button type="button" class="btn btn-outline" @click="showEditPlantModal = false">
                  Cancel
                </button>
                <button type="submit" class="btn btn-primary">
                  Save Changes
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
    

    <div v-if="showCareLogModal" class="modal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Add Care Log for {{ selectedPlant?.name }}</h3>
          <button class="btn btn-text" @click="showCareLogModal = false">×</button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="addCareLog">
            <div class="form-group">
              <label for="careType" class="form-label">Care Type</label>
              <select
                id="careType"
                v-model="newCareLog.type"
                class="form-input"
                required
              >
                <option value="watering">Watering</option>
                <option value="fertilizing">Fertilizing</option>
                <option value="pruning">Pruning</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div class="form-group">
              <label for="careNotes" class="form-label">Notes (Optional)</label>
              <textarea
                id="careNotes"
                v-model="newCareLog.notes"
                class="form-input"
                placeholder="Enter any notes"
                rows="3"
              ></textarea>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-outline" @click="showCareLogModal = false">
                Cancel
              </button>
              <button type="submit" class="btn btn-primary">
                Add Care Log
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/services/api';

export default {
  name: 'PlantManager',
  data() {
    return {
      plants: [],
      plantCareLogs: {}, 
      loading: true,
      showAddPlantModal: false,
      showEditPlantModal: false,
      showCareLogModal: false,
      newPlant: {
        name: '',
        species: ''
      },
      editingPlant: {
        _id: '',
        name: '',
        species: ''
      },
      selectedPlant: null,
      newCareLog: {
        type: 'watering',
        notes: '',
        plant: ''
      }
    };
  },
  created() {
    this.fetchPlants();
  },
  methods: {
    goToCalculator() {
      this.$router.push('/calculator');
    },
    async fetchPlants() {
      try {
        this.loading = true;
        console.log('Fetching plants...');
        const plants = await api.get('/plants');
        this.plants = plants || [];
        
        // Fetch care logs for each plant
        for (const plant of this.plants) {
          await this.fetchPlantCareLogs(plant._id);
        }
        
        this.loading = false;
      } catch (error) {
        console.error('Error fetching plants:', error);
        this.loading = false;
      }
    },
    async fetchPlantCareLogs(plantId) {
      try {
        console.log('Fetching care logs for plant:', plantId);
        const careLogs = await api.get(`/plants/${plantId}/care-logs`);
        console.log(`Received ${careLogs ? careLogs.length : 0} care logs for plant ${plantId}`);
        this.plantCareLogs[plantId] = careLogs || [];
      } catch (error) {
        console.error(`Error fetching care logs for plant ${plantId}:`, error);
        // Initialize with empty array if there's an error
        this.plantCareLogs[plantId] = [];
      }
    },
    async addPlant() {
      try {
        const response = await api.post('/plants', this.newPlant);
        console.log('Plant added:', response);
        this.showAddPlantModal = false;
        this.newPlant = { name: '', species: '' };
        await this.fetchPlants();
      } catch (error) {
        console.error('Error adding plant:', error);
        alert('Failed to add plant: ' + (error.message || 'Unknown error'));
      }
    },
    openEditPlantModal(plant) {
      this.editingPlant = { ...plant };
      this.showEditPlantModal = true;
    },
    async updatePlant() {
      try {
        await api.put(`/plants/${this.editingPlant._id}`, {
          name: this.editingPlant.name,
          species: this.editingPlant.species
        });
        this.showEditPlantModal = false;
        await this.fetchPlants();
      } catch (error) {
        console.error('Error updating plant:', error);
        alert('Failed to update plant: ' + (error.message || 'Unknown error'));
      }
    },
    confirmDeletePlant(plant) {
      if (confirm(`Are you sure you want to delete ${plant.name}?`)) {
        this.deletePlantById(plant._id);
      }
    },
    async deletePlant() {
      if (confirm('Are you sure you want to delete this plant?')) {
        try {
          await this.deletePlantById(this.editingPlant._id);
          this.showEditPlantModal = false;
        } catch (error) {
          console.error('Error deleting plant:', error);
          alert('Failed to delete plant: ' + (error.message || 'Unknown error'));
        }
      }
    },
    async deletePlantById(plantId) {
      try {
        await api.delete(`/plants/${plantId}`);
        await this.fetchPlants();
        return true;
      } catch (error) {
        console.error('Error deleting plant:', error);
        alert('Failed to delete plant: ' + (error.message || 'Unknown error'));
        return false;
      }
    },
    showAddCareLogModal(plant) {
      this.selectedPlant = plant;
      this.newCareLog.plant = plant._id;
      this.showCareLogModal = true;
    },
    async addCareLog() {
      try {
        console.log('Adding care log for plant:', this.selectedPlant._id);
        const response = await api.post('/care-logs', this.newCareLog);
        console.log('Care log added:', response);
        
        this.showCareLogModal = false;
        this.newCareLog = { type: 'watering', notes: '', plant: '' };
        
        // Refresh care logs for this plant
        if (this.selectedPlant) {
          await this.fetchPlantCareLogs(this.selectedPlant._id);
        }
      } catch (error) {
        console.error('Error adding care log:', error);
        alert('Failed to add care log: ' + (error.message || 'Unknown error'));
      }
    },
    getPlantLogs(plantId) {
      return this.plantCareLogs[plantId] || [];
    },
    formatDate(dateString) {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    },
    async logout() {
      try {
        await api.post('/auth/logout');
        this.$router.push('/');
      } catch (error) {
        console.error('Error logging out:', error);
      }
    },
    goToPlantDetail(plantId) {
      if (plantId) {
        console.log('Navigating to plant detail:', plantId);
        this.$router.push(`/plants/${plantId}`);
      } else {
        console.error('Cannot navigate to plant detail: Invalid plant ID');
      }
    }
  }
};
</script>

<style scoped>
.plant-manager {
  min-height: 100vh;
  background-color: var(--background-alt);
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.add-plant-button-container {
  display: flex;
  justify-content: center;
  margin-bottom: 2rem;
}

.plant-card {
  display: flex;
  flex-direction: column;
  border-radius: var(--radius);
  overflow: hidden;
  box-shadow: var(--shadow);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  background-color: var(--background);
}

.plant-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.plant-card-header {
  background-color: var(--primary-light);
  padding: 1rem;
  cursor: pointer;
}

.plant-card-body {
  padding: 1rem;
  flex-grow: 1;
  cursor: pointer;
}

.plant-card-actions {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem;
  border-top: 1px solid var(--border);
}

.care-logs {
  margin-top: 1rem;
}

.care-logs h4 {
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  color: var(--text-light);
}

.care-log-list {
  list-style: none;
}

.care-log-item {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--border);
  font-size: 0.875rem;
}

.care-log-item:last-child {
  border-bottom: none;
}

.care-type {
  text-transform: capitalize;
  font-weight: 500;
}

.care-date {
  color: var(--text-light);
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 50vh;
  text-align: center;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--border);
  border-top: 3px solid var(--primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.text-danger {
  color: var(--error);
}
</style>

