const { createApp, reactive, ref, onMounted, watch, computed } = Vue;

const connectorOptions = ['CCS', 'CHAdeMO', 'Type 2', 'GB/T'];
const apiBaseUrl = window.APP_CONFIG?.API_BASE_URL || 'http://localhost:5000';

const StationMap = {
  props: ['stations'],
  template: `
    <div class="map-card">
      <div class="map-header">
        <div>
          <h2>Map View</h2>
          <p>Click a marker to inspect charger details.</p>
        </div>
        <span class="pill">{{ stations.length }} stations</span>
      </div>
      <div ref="mapEl" class="map"></div>
    </div>
  `,
  setup(props) {
    const mapEl = ref(null);
    let map;
    let markersLayer;
    const defaultCenter = [20.5937, 78.9629];

    const renderMarkers = () => {
      if (!map || !markersLayer) return;
      markersLayer.clearLayers();

      if (!props.stations.length) {
        map.setView(defaultCenter, 4);
        return;
      }

      const bounds = [];

      props.stations.forEach((station) => {
        const lat = Number(station.location?.latitude);
        const lng = Number(station.location?.longitude);
        if (Number.isNaN(lat) || Number.isNaN(lng)) return;

        const marker = L.marker([lat, lng]).bindPopup(`
          <strong>${station.name}</strong><br>
          ${station.location?.address || 'No address provided'}<br>
          Status: ${station.status}<br>
          Power: ${station.powerOutput} kW<br>
          Connector: ${station.connectorType}
        `);

        marker.addTo(markersLayer);
        bounds.push([lat, lng]);
      });

      if (bounds.length === 1) {
        map.setView(bounds[0], 13);
      } else if (bounds.length > 1) {
        map.fitBounds(bounds, { padding: [24, 24] });
      }
    };

    onMounted(() => {
      map = L.map(mapEl.value).setView(defaultCenter, 4);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);
      markersLayer = L.layerGroup().addTo(map);
      renderMarkers();
    });

    watch(() => props.stations, renderMarkers, { deep: true });

    return { mapEl };
  }
};

createApp({
  components: { StationMap },
  template: `
    <div class="page-shell">
      <header class="hero">
        <div>
          <p class="eyebrow">Node.js + Express + Vue</p>
          <h1>EV Charging Station Manager</h1>
          <p class="hero-copy">Authenticate, manage stations, filter inventory, and visualize locations on a live map.</p>
        </div>
        <div class="hero-actions">
          <span class="badge">{{ auth.token ? 'Authenticated' : 'Guest mode' }}</span>
          <button v-if="auth.token" class="secondary-btn" @click="logout">Logout</button>
        </div>
      </header>

      <main class="content-grid">
        <section class="panel auth-panel">
          <div class="tabs">
            <button :class="['tab', authMode === 'login' ? 'active' : '']" @click="authMode = 'login'">Login</button>
            <button :class="['tab', authMode === 'signup' ? 'active' : '']" @click="authMode = 'signup'">Sign up</button>
          </div>

          <form class="stack" @submit.prevent="submitAuth">
            <label v-if="authMode === 'signup'" class="field">
              <span>Name</span>
              <input v-model.trim="authForm.name" type="text" placeholder="Jane Doe">
            </label>
            <label class="field">
              <span>Email</span>
              <input v-model.trim="authForm.email" type="email" placeholder="jane@example.com">
            </label>
            <label class="field">
              <span>Password</span>
              <input v-model="authForm.password" type="password" placeholder="••••••••">
            </label>
            <button class="primary-btn" type="submit">{{ authMode === 'login' ? 'Login' : 'Create account' }}</button>
          </form>

          <div class="notice success" v-if="successMessage">{{ successMessage }}</div>
          <div class="notice error" v-if="errorMessage">{{ errorMessage }}</div>

          <div class="credentials-card">
            <h3>API Configuration</h3>
            <p>Update <code>window.APP_CONFIG.API_BASE_URL</code> in <code>frontend/index.html</code> before deployment.</p>
            <code>{{ apiBaseUrl }}</code>
          </div>
        </section>

        <section class="panel management-panel">
          <div class="section-header">
            <div>
              <h2>Charging Stations</h2>
              <p>Protected CRUD operations with filter support.</p>
            </div>
            <button class="primary-btn" :disabled="!auth.token || loadingStations" @click="loadStations">
              {{ loadingStations ? 'Refreshing…' : 'Refresh list' }}
            </button>
          </div>

          <div class="filter-grid">
            <label class="field">
              <span>Status</span>
              <select v-model="filters.status">
                <option value="">All</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </label>
            <label class="field">
              <span>Connector</span>
              <select v-model="filters.connectorType">
                <option value="">All</option>
                <option v-for="connector in connectorOptions" :key="connector" :value="connector">{{ connector }}</option>
              </select>
            </label>
            <label class="field">
              <span>Minimum power (kW)</span>
              <input v-model="filters.minPower" type="number" min="0" placeholder="50">
            </label>
            <label class="field">
              <span>Maximum power (kW)</span>
              <input v-model="filters.maxPower" type="number" min="0" placeholder="350">
            </label>
          </div>

          <div class="action-row">
            <button class="secondary-btn" :disabled="!auth.token" @click="applyFilters">Apply filters</button>
            <button class="ghost-btn" :disabled="!auth.token" @click="resetFilters">Reset</button>
          </div>

          <form class="station-form" @submit.prevent="submitStation">
            <div class="section-header compact">
              <div>
                <h3>{{ editingStationId ? 'Edit charger' : 'Add new charger' }}</h3>
                <p>Capture location, availability, power, and connector details.</p>
              </div>
              <button v-if="editingStationId" class="ghost-btn" type="button" @click="resetStationForm">Cancel edit</button>
            </div>

            <div class="form-grid">
              <label class="field">
                <span>Name</span>
                <input v-model.trim="stationForm.name" type="text" placeholder="Downtown Fast Hub">
              </label>
              <label class="field">
                <span>Latitude</span>
                <input v-model="stationForm.location.latitude" type="number" step="any" placeholder="28.6139">
              </label>
              <label class="field">
                <span>Longitude</span>
                <input v-model="stationForm.location.longitude" type="number" step="any" placeholder="77.2090">
              </label>
              <label class="field">
                <span>Address</span>
                <input v-model.trim="stationForm.location.address" type="text" placeholder="Connaught Place, New Delhi">
              </label>
              <label class="field">
                <span>Status</span>
                <select v-model="stationForm.status">
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </label>
              <label class="field">
                <span>Power Output (kW)</span>
                <input v-model="stationForm.powerOutput" type="number" min="0" placeholder="120">
              </label>
              <label class="field">
                <span>Connector Type</span>
                <select v-model="stationForm.connectorType">
                  <option v-for="connector in connectorOptions" :key="connector" :value="connector">{{ connector }}</option>
                </select>
              </label>
            </div>

            <button class="primary-btn" type="submit" :disabled="!auth.token || savingStation">
              {{ savingStation ? 'Saving…' : (editingStationId ? 'Update station' : 'Create station') }}
            </button>
          </form>

          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Status</th>
                  <th>Power</th>
                  <th>Connector</th>
                  <th>Coordinates</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="!stations.length">
                  <td colspan="6" class="empty-state">{{ auth.token ? 'No stations found for the current filters.' : 'Log in to manage stations.' }}</td>
                </tr>
                <tr v-for="station in stations" :key="station._id">
                  <td>
                    <strong>{{ station.name }}</strong>
                    <div class="muted">{{ station.location?.address || 'No address' }}</div>
                  </td>
                  <td><span :class="['pill', station.status === 'Active' ? 'pill-green' : 'pill-gray']">{{ station.status }}</span></td>
                  <td>{{ station.powerOutput }} kW</td>
                  <td>{{ station.connectorType }}</td>
                  <td>{{ station.location?.latitude }}, {{ station.location?.longitude }}</td>
                  <td>
                    <div class="inline-actions">
                      <button class="ghost-btn" @click="editStation(station)" :disabled="!auth.token">Edit</button>
                      <button class="danger-btn" @click="removeStation(station._id)" :disabled="!auth.token">Delete</button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </main>

      <StationMap :stations="stations" />
    </div>
  `,
  setup() {
    const authMode = ref('login');
    const errorMessage = ref('');
    const successMessage = ref('');
    const loadingStations = ref(false);
    const savingStation = ref(false);
    const editingStationId = ref('');
    const stations = ref([]);
    const auth = reactive(JSON.parse(localStorage.getItem('ev-auth') || '{"token":"","user":null}'));
    const authForm = reactive({ name: '', email: '', password: '' });
    const filters = reactive({ status: '', connectorType: '', minPower: '', maxPower: '' });
    const stationForm = reactive(getDefaultStationForm());
    const authHeaders = computed(() => ({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${auth.token}`
    }));

    function getDefaultStationForm() {
      return {
        name: '',
        location: {
          latitude: '',
          longitude: '',
          address: ''
        },
        status: 'Active',
        powerOutput: '',
        connectorType: 'CCS'
      };
    }

    function resetMessages() {
      errorMessage.value = '';
      successMessage.value = '';
    }

    function persistAuth(payload) {
      auth.token = payload.token;
      auth.user = payload.user;
      localStorage.setItem('ev-auth', JSON.stringify(payload));
    }

    function logout() {
      auth.token = '';
      auth.user = null;
      localStorage.removeItem('ev-auth');
      stations.value = [];
      resetMessages();
      successMessage.value = 'Logged out successfully.';
    }

    async function apiFetch(path, options = {}) {
      const response = await fetch(`${apiBaseUrl}${path}`, options);
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.message || 'Request failed');
      }
      return data;
    }

    async function submitAuth() {
      resetMessages();
      try {
        const payload = { email: authForm.email, password: authForm.password };
        if (authMode.value === 'signup') payload.name = authForm.name;

        const data = await apiFetch(`/api/auth/${authMode.value}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        persistAuth(data);
        authForm.name = '';
        authForm.email = '';
        authForm.password = '';
        successMessage.value = authMode.value === 'login' ? 'Logged in successfully.' : 'Account created successfully.';
        await loadStations();
      } catch (error) {
        errorMessage.value = error.message;
      }
    }

    async function loadStations() {
      if (!auth.token) return;
      resetMessages();
      loadingStations.value = true;
      try {
        const params = new URLSearchParams();
        if (filters.status) params.set('status', filters.status);
        if (filters.connectorType) params.set('connectorType', filters.connectorType);
        if (filters.minPower) params.set('minPower', filters.minPower);
        if (filters.maxPower) params.set('maxPower', filters.maxPower);
        const query = params.toString() ? `?${params.toString()}` : '';
        stations.value = await apiFetch(`/api/stations${query}`, { headers: authHeaders.value });
      } catch (error) {
        errorMessage.value = error.message;
      } finally {
        loadingStations.value = false;
      }
    }

    async function submitStation() {
      if (!auth.token) return;
      resetMessages();
      savingStation.value = true;
      try {
        const payload = {
          name: stationForm.name,
          location: {
            latitude: Number(stationForm.location.latitude),
            longitude: Number(stationForm.location.longitude),
            address: stationForm.location.address
          },
          status: stationForm.status,
          powerOutput: Number(stationForm.powerOutput),
          connectorType: stationForm.connectorType
        };

        const isEditing = Boolean(editingStationId.value);
        await apiFetch(isEditing ? `/api/stations/${editingStationId.value}` : '/api/stations', {
          method: isEditing ? 'PUT' : 'POST',
          headers: authHeaders.value,
          body: JSON.stringify(payload)
        });

        successMessage.value = isEditing ? 'Station updated successfully.' : 'Station created successfully.';
        resetStationForm();
        await loadStations();
      } catch (error) {
        errorMessage.value = error.message;
      } finally {
        savingStation.value = false;
      }
    }

    function editStation(station) {
      editingStationId.value = station._id;
      stationForm.name = station.name;
      stationForm.location.latitude = station.location?.latitude;
      stationForm.location.longitude = station.location?.longitude;
      stationForm.location.address = station.location?.address || '';
      stationForm.status = station.status;
      stationForm.powerOutput = station.powerOutput;
      stationForm.connectorType = station.connectorType;
      successMessage.value = `Editing ${station.name}`;
    }

    function resetStationForm() {
      editingStationId.value = '';
      const fresh = getDefaultStationForm();
      stationForm.name = fresh.name;
      stationForm.location.latitude = fresh.location.latitude;
      stationForm.location.longitude = fresh.location.longitude;
      stationForm.location.address = fresh.location.address;
      stationForm.status = fresh.status;
      stationForm.powerOutput = fresh.powerOutput;
      stationForm.connectorType = fresh.connectorType;
    }

    async function removeStation(id) {
      if (!auth.token) return;
      if (!window.confirm('Delete this charging station?')) return;
      resetMessages();
      try {
        await apiFetch(`/api/stations/${id}`, {
          method: 'DELETE',
          headers: authHeaders.value
        });
        successMessage.value = 'Station deleted successfully.';
        if (editingStationId.value === id) resetStationForm();
        await loadStations();
      } catch (error) {
        errorMessage.value = error.message;
      }
    }

    function applyFilters() {
      loadStations();
    }

    function resetFilters() {
      filters.status = '';
      filters.connectorType = '';
      filters.minPower = '';
      filters.maxPower = '';
      loadStations();
    }

    onMounted(() => {
      if (auth.token) loadStations();
    });

    return {
      apiBaseUrl,
      connectorOptions,
      authMode,
      errorMessage,
      successMessage,
      loadingStations,
      savingStation,
      editingStationId,
      stations,
      auth,
      authForm,
      filters,
      stationForm,
      submitAuth,
      loadStations,
      submitStation,
      editStation,
      removeStation,
      resetStationForm,
      applyFilters,
      resetFilters,
      logout
    };
  }
}).mount('#app');
