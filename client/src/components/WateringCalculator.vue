<template>
    <div class="watering-calculator">
      <header class="header container">
        <div class="logo">
          <span>GreenTrack</span>
        </div>
        <div class="nav">
          <button class="btn btn-text" @click="goToPlants">
            My Plants
          </button>
          <button class="btn btn-text" @click="logout">
            Logout
          </button>
        </div>
      </header>
      
      <main class="container">
        <div class="calculator-header">
          <h1>Watering Calculator</h1>
          <p class="calculator-subtitle">Calculate the perfect amount of water for your plants</p>
        </div>
        
        <div class="calculator-card">
          <form @submit.prevent="calculateWaterNeeds" class="calculator-form">
            <div class="form-group">
              <label for="plantType" class="form-label">Plant Type</label>
              <select id="plantType" v-model="calculatorData.plantType" class="form-input" required>
                <option value="">Select plant type</option>
                <option value="succulent">Succulent/Cactus</option>
                <option value="tropical">Tropical</option>
                <option value="herb">Herb</option>
                <option value="vegetable">Vegetable</option>
                <option value="flower">Flowering Plant</option>
                <option value="fern">Fern</option>
                <option value="vine">Vine/Climber</option>
              </select>
            </div>
            
            <div class="form-group">
              <label for="potSize" class="form-label">Pot Size (diameter in inches)</label>
              <select id="potSize" v-model="calculatorData.potSize" class="form-input" required>
                <option value="">Select pot size</option>
                <option value="2">2 inches</option>
                <option value="4">4 inches</option>
                <option value="6">6 inches</option>
                <option value="8">8 inches</option>
                <option value="10">10 inches</option>
                <option value="12">12 inches</option>
                <option value="14">14+ inches</option>
              </select>
            </div>
            
            <div class="form-group">
              <label for="season" class="form-label">Current Season</label>
              <select id="season" v-model="calculatorData.season" class="form-input" required>
                <option value="">Select season</option>
                <option value="spring">Spring</option>
                <option value="summer">Summer</option>
                <option value="fall">Fall</option>
                <option value="winter">Winter</option>
              </select>
            </div>
            
            <div class="form-group">
              <label for="sunlight" class="form-label">Sunlight Exposure</label>
              <select id="sunlight" v-model="calculatorData.sunlight" class="form-input" required>
                <option value="">Select sunlight level</option>
                <option value="low">Low (Shade)</option>
                <option value="medium">Medium (Partial Sun)</option>
                <option value="high">High (Full Sun)</option>
              </select>
            </div>
            
            <button type="submit" class="btn btn-primary calculator-submit">
              Calculate Water Needs
            </button>
          </form>
          
          <div v-if="showResults" class="calculator-results">
            <h3>Watering Recommendation</h3>
            
            <div class="result-card">
              <div class="result-icon">💧</div>
              <div class="result-details">
                <div class="result-value">{{ waterAmount }} {{ waterUnit }}</div>
                <div class="result-label">Water Amount</div>
              </div>
            </div>
            
            <div class="result-card">
              <div class="result-icon">📅</div>
              <div class="result-details">
                <div class="result-value">{{ frequencyText }}</div>
                <div class="result-label">Watering Frequency</div>
              </div>
            </div>
            
            <div class="watering-tips">
              <h4>Watering Tips</h4>
              <ul>
                <li v-for="(tip, index) in wateringTips" :key="index">{{ tip }}</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  </template>
  
  <script>
  export default {
    name: 'WateringCalculator',
    data() {
      return {
        calculatorData: {
          plantType: '',
          potSize: '',
          season: '',
          sunlight: ''
        },
        showResults: false,
        waterAmount: '',
        waterUnit: '',
        frequencyText: '',
        wateringTips: []
      };
    },
    methods: {
      calculateWaterNeeds() {
        // Convert pot size to number
        const potSize = parseInt(this.calculatorData.potSize);
        
        // Base calculations
        let waterAmount = 0;
        let frequencyDays = 0;
        
        
        switch(this.calculatorData.plantType) {
          case 'succulent':
            waterAmount = potSize * 0.25; 
            frequencyDays = 14; 
            break;
          case 'tropical':
            waterAmount = potSize * 0.75; 
            frequencyDays = 7; 
            break;
          case 'herb':
            waterAmount = potSize * 0.5; 
            frequencyDays = 5; 
            break;
          case 'vegetable':
            waterAmount = potSize * 0.8; 
            frequencyDays = 4; 
            break;
          case 'flower':
            waterAmount = potSize * 0.6; 
            frequencyDays = 6; 
            break;
          case 'fern':
            waterAmount = potSize * 0.7; 
            frequencyDays = 5; 
            break;
          case 'vine':
            waterAmount = potSize * 0.65; 
            break;
        }
        
        
        switch(this.calculatorData.season) {
          case 'summer':
            waterAmount *= 1.25; 
            frequencyDays = Math.max(2, Math.floor(frequencyDays * 0.7)); 
            break;
          case 'winter':
            waterAmount *= 0.75; 
            frequencyDays = Math.floor(frequencyDays * 1.5);
            break;
          case 'fall':
            waterAmount *= 0.9; 
            frequencyDays = Math.floor(frequencyDays * 1.2); 
            break;
       
        }
        
       
        switch(this.calculatorData.sunlight) {
          case 'high':
            waterAmount *= 1.2; 
            frequencyDays = Math.max(2, Math.floor(frequencyDays * 0.8)); 
            break;
          case 'low':
            waterAmount *= 0.8; 
            frequencyDays = Math.floor(frequencyDays * 1.2); 
            break;
        }
        
        waterAmount = Math.round(waterAmount * 10) / 10;
        
        if (waterAmount >= 16) {
          this.waterAmount = Math.round((waterAmount / 8) * 10) / 10;
          this.waterUnit = 'cups';
        } else {
          this.waterAmount = waterAmount;
          this.waterUnit = 'ounces';
        }
        
        this.frequencyText = `Every ${frequencyDays} days`;
        
        this.generateWateringTips();
        
        this.showResults = true;
      },
      
      generateWateringTips() {
        const commonTips = [
          'Water in the morning to reduce evaporation and fungal growth.',
          'Check soil moisture before watering - the top inch should be dry.'
        ];
        
        let specificTips = [];
        
        switch(this.calculatorData.plantType) {
          case 'succulent':
            specificTips = [
              'Allow soil to completely dry out between waterings.',
              'Reduce watering significantly during dormant periods.',
              'Use well-draining soil to prevent root rot.'
            ];
            break;
          case 'tropical':
            specificTips = [
              'Keep soil consistently moist but not soggy.',
              'Increase humidity by misting leaves or using a humidifier.',
              'Use room temperature water to avoid shocking the roots.'
            ];
            break;
          case 'herb':
            specificTips = [
              'Water when the top inch of soil feels dry.',
              'Avoid wetting the leaves to prevent disease.',
              'Most herbs prefer to dry slightly between waterings.'
            ];
            break;
          case 'vegetable':
            specificTips = [
              'Consistent watering is key for vegetable growth and fruit production.',
              'Water at the base of plants to keep foliage dry.',
              'Mulch around plants to retain moisture.'
            ];
            break;
          case 'flower':
            specificTips = [
              'Water deeply but infrequently to encourage strong root growth.',
              'Deadhead spent blooms to encourage more flowering.',
              'Reduce watering after flowering period.'
            ];
            break;
          case 'fern':
            specificTips = [
              'Keep soil consistently moist but not waterlogged.',
              'Increase humidity by misting regularly.',
              'Avoid letting ferns dry out completely.'
            ];
            break;
          case 'vine':
            specificTips = [
              'Water thoroughly when the top inch of soil is dry.',
              'Provide support for climbing varieties.',
              'Adjust watering based on growth rate - more during active growth.'
            ];
            break;
        }
        
        let seasonTip = '';
        switch(this.calculatorData.season) {
          case 'summer':
            seasonTip = 'During hot summer days, you may need to water more frequently than recommended.';
            break;
          case 'winter':
            seasonTip = 'In winter, allow soil to dry more between waterings as plant growth slows down.';
            break;
          case 'fall':
            seasonTip = 'As temperatures cool in fall, gradually reduce watering frequency.';
            break;
          case 'spring':
            seasonTip = 'Spring is the growing season for many plants - monitor closely for changing water needs.';
            break;
        }
        
        this.wateringTips = [...commonTips, ...specificTips, seasonTip];
      },
      
      goToPlants() {
        this.$router.push('/plants');
      },
      
      async logout() {
        try {
          const api = require('@/services/api').default;
          await api.request('POST', '/auth/logout');
          this.$router.push('/');
        } catch (error) {
          console.error('Error logging out:', error);
        }
      }
    }
  };
  </script>
  
  <style scoped>
  .watering-calculator {
    min-height: 100vh;
    background-color: var(--background-alt);
  }
  
  .calculator-header {
    margin-bottom: 2rem;
    text-align: center;
  }
  
  .calculator-subtitle {
    color: var(--text-light);
    margin-top: 0.5rem;
  }
  
  .calculator-card {
    background-color: var(--background);
    border-radius: var(--radius);
    box-shadow: var(--shadow);
    padding: 2rem;
    margin-bottom: 2rem;
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }
  
  @media (min-width: 768px) {
    .calculator-card {
      flex-direction: row;
      align-items: flex-start;
    }
  
    .calculator-form,
    .calculator-results {
      flex: 1;
    }
  }
  
  .calculator-form {
    margin-bottom: 1rem;
  }
  
  .calculator-submit {
    width: 100%;
    margin-top: 1rem;
  }
  
  .calculator-results {
    background-color: var(--primary-light);
    border-radius: var(--radius);
    padding: 1.5rem;
  }
  
  .calculator-results h3 {
    margin-bottom: 1.5rem;
    text-align: center;
    color: var(--primary);
  }
  
  .result-card {
    display: flex;
    align-items: center;
    background-color: var(--background);
    border-radius: var(--radius);
    padding: 1rem;
    margin-bottom: 1rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }
  
  .result-icon {
    font-size: 2rem;
    margin-right: 1rem;
  }
  
  .result-details {
    flex: 1;
  }
  
  .result-value {
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--primary);
  }
  
  .result-label {
    font-size: 0.875rem;
    color: var(--text-light);
  }
  
  .watering-tips {
    margin-top: 2rem;
  }
  
  .watering-tips h4 {
    margin-bottom: 1rem;
    color: var(--primary);
  }
  
  .watering-tips ul {
    padding-left: 1.5rem;
  }
  
  .watering-tips li {
    margin-bottom: 0.5rem;
    font-size: 0.9rem;
  }
  </style>
  
  