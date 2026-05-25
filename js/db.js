// IndexedDB wrapper for offline-first data storage
const DB_NAME = 'solarconnect';
const DB_VERSION = 3;

const STORES = [
  { name: 'reports',      keyPath: 'id', indexes: [['timestamp','timestamp'],['synced','synced'],['status','status']] },
  { name: 'technicians',  keyPath: 'id' },
  { name: 'settings',     keyPath: 'key' },
  { name: 'status',       keyPath: 'key' },
  { name: 'devices',      keyPath: 'id', indexes: [['type','type'],['status','status']] },
  { name: 'tickets',      keyPath: 'id', indexes: [['status','status'],['createdAt','createdAt']] },
  { name: 'energyLogs',   keyPath: 'date' },
  { name: 'alerts',       keyPath: 'id', indexes: [['timestamp','timestamp'],['acknowledged','acknowledged']] },
  { name: 'appointments', keyPath: 'id', indexes: [['scheduledFor','scheduledFor']] },
  { name: 'posts',        keyPath: 'id', indexes: [['createdAt','createdAt']] },
  { name: 'progress',     keyPath: 'lessonId' },
  { name: 'maintenance',  keyPath: 'id', indexes: [['deviceId','deviceId'],['date','date']] }
];

const db = {
  _db: null,

  async open() {
    if (this._db) return this._db;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (e) => {
        const database = e.target.result;
        for (const s of STORES) {
          if (!database.objectStoreNames.contains(s.name)) {
            const store = database.createObjectStore(s.name, { keyPath: s.keyPath });
            (s.indexes || []).forEach(([name, key]) => store.createIndex(name, key, { unique: false }));
          }
        }
      };

      request.onsuccess = (e) => { this._db = e.target.result; resolve(this._db); };
      request.onerror   = (e) => reject(e.target.error);
    });
  },

  async _tx(storeName, mode, callback) {
    const database = await this.open();
    return new Promise((resolve, reject) => {
      const tx = database.transaction(storeName, mode);
      const store = tx.objectStore(storeName);
      const result = callback(store);

      if (result && 'onsuccess' in result) {
        result.onsuccess = () => resolve(result.result);
        result.onerror   = () => reject(result.error);
      } else {
        tx.oncomplete = () => resolve(result);
        tx.onerror    = () => reject(tx.error);
      }
    });
  },

  // ---- Reports
  addReport:       (r) => db._tx('reports', 'readwrite', s => s.put(r)),
  updateReport:    (r) => db._tx('reports', 'readwrite', s => s.put(r)),
  deleteReport:    (id)=> db._tx('reports', 'readwrite', s => s.delete(id)),
  getReports:      ()  => db._tx('reports', 'readonly',  s => s.getAll()),
  async getUnsyncedReports() {
    const all = await this.getReports();
    return all.filter(r => !r.synced);
  },

  // ---- Technicians
  addTechnician:   (t) => db._tx('technicians', 'readwrite', s => s.put(t)),
  getTechnicians:  ()  => db._tx('technicians', 'readonly',  s => s.getAll()),
  deleteTechnician:(id)=> db._tx('technicians', 'readwrite', s => s.delete(id)),

  // ---- Settings
  async setSetting(key, value) {
    return this._tx('settings', 'readwrite', s => s.put({ key, value }));
  },
  async getSetting(key) {
    const r = await this._tx('settings', 'readonly', s => s.get(key));
    return r ? r.value : null;
  },

  // ---- System Status
  setStatus: (key, data) => db._tx('status', 'readwrite', s => s.put({ key, ...data })),
  getStatus: (key)       => db._tx('status', 'readonly',  s => s.get(key)),

  // ---- Devices
  addDevice:    (d)  => db._tx('devices', 'readwrite', s => s.put(d)),
  getDevices:   ()   => db._tx('devices', 'readonly',  s => s.getAll()),
  getDevice:    (id) => db._tx('devices', 'readonly',  s => s.get(id)),
  deleteDevice: (id) => db._tx('devices', 'readwrite', s => s.delete(id)),

  // ---- Tickets
  addTicket:    (t)  => db._tx('tickets', 'readwrite', s => s.put(t)),
  getTickets:   ()   => db._tx('tickets', 'readonly',  s => s.getAll()),
  getTicket:    (id) => db._tx('tickets', 'readonly',  s => s.get(id)),
  updateTicket: (t)  => db._tx('tickets', 'readwrite', s => s.put(t)),

  // ---- Energy logs (one record per day)
  addEnergyLog: (e)  => db._tx('energyLogs', 'readwrite', s => s.put(e)),
  getEnergyLogs:()   => db._tx('energyLogs', 'readonly',  s => s.getAll()),

  // ---- Alerts
  addAlert:    (a)   => db._tx('alerts', 'readwrite', s => s.put(a)),
  getAlerts:   ()    => db._tx('alerts', 'readonly',  s => s.getAll()),
  updateAlert: (a)   => db._tx('alerts', 'readwrite', s => s.put(a)),

  // ---- Appointments
  addAppointment:    (a) => db._tx('appointments', 'readwrite', s => s.put(a)),
  getAppointments:   ()  => db._tx('appointments', 'readonly',  s => s.getAll()),
  deleteAppointment: (id)=> db._tx('appointments', 'readwrite', s => s.delete(id)),

  // ---- Community posts
  addPost:  (p) => db._tx('posts', 'readwrite', s => s.put(p)),
  getPosts: ()  => db._tx('posts', 'readonly',  s => s.getAll()),

  // ---- Learning progress
  setProgress: (p)        => db._tx('progress', 'readwrite', s => s.put(p)),
  getProgress: (lessonId) => db._tx('progress', 'readonly',  s => s.get(lessonId)),
  getAllProgress: ()      => db._tx('progress', 'readonly',  s => s.getAll()),

  // ---- Maintenance history
  addMaintenance:  (m) => db._tx('maintenance', 'readwrite', s => s.put(m)),
  getMaintenance:  ()  => db._tx('maintenance', 'readonly',  s => s.getAll())
};
