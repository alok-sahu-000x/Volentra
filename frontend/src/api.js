const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
const API_URL = `${BACKEND_URL}/api`;

const getAuthHeaders = (extraHeaders = {}) => {
    const token = localStorage.getItem('token');
    return {
        ...extraHeaders,
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
};

const fetchWithTimeout = async (url, options = {}, timeoutMs = 3500) => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeoutMs);
    try {
        const res = await fetch(url, { ...options, signal: controller.signal });
        clearTimeout(id);
        return res;
    } catch (err) {
        clearTimeout(id);
        throw err;
    }
};

// ── Fallback Mock Data ────────────────────────────────────────────────────────
const issueTypes = ['Medical', 'Food Shortage', 'Infrastructure', 'Shelter', 'Water Supply', 'Logistics'];
const volNames = ['Alice Morgan', 'Ben Carter', 'Clara Hayes', 'David Kim', 'Emma Ross', 'Frank Lee', 'Grace Wu', 'Henry Park', 'Iris Chen', 'James Miller'];

let mockVolunteers = volNames.map((name, i) => ({
    id: i + 100, userId: i === 0 ? 2 : null, name,
    skills: [issueTypes[i % issueTypes.length], 'General'],
    latitude: 34.0522 + (Math.sin(i) * 0.05),
    longitude: -118.2437 + (Math.cos(i) * 0.05),
    availabilityStatus: i % 3 === 0 ? 'busy' : 'available',
    rating: parseFloat((4.0 + (i % 10) * 0.1).toFixed(1)),
    experienceLevel: i % 2 === 0 ? 'Expert' : 'Intermediate',
    totalHoursServed: 20 + i * 15,
}));

let mockReports = Array.from({ length: 15 }, (_, i) => ({
    id: i + 500,
    issueType: issueTypes[i % issueTypes.length],
    description: `Urgent assistance required in sector ${i + 1}. Multiple families affected.`,
    urgency: (i % 10) + 1,
    peopleAffected: (i + 1) * 25,
    latitude: 34.0522 + (Math.sin(i) * 0.04),
    longitude: -118.2437 + (Math.cos(i) * 0.04),
    submittedBy: 3,
    status: i % 3 === 0 ? 'Completed' : (i % 2 === 0 ? 'Assigned' : 'Pending'),
    createdAt: new Date(Date.now() - i * 36000000).toISOString(),
    priorityScore: Math.min(100, ((i % 10) + 1) * 8 + (i * 2)),
    aiAnalysis: {
        recommendedAction: `Dispatch ${issueTypes[i % issueTypes.length].toLowerCase()} response team immediately.`,
        requiredSupplies: ['Emergency Kits', 'Water', 'First Aid']
    }
}));

let mockTasks = mockReports.filter(r => r.status !== 'Pending').map((r, i) => ({
    id: i + 1000,
    reportId: r.id,
    assignedVolunteerId: mockVolunteers[i % mockVolunteers.length].id,
    assignedAt: new Date(Date.now() - i * 18000000).toISOString(),
    completedAt: r.status === 'Completed' ? new Date().toISOString() : null,
    status: r.status === 'Assigned' ? 'In Progress' : 'Completed',
}));

const mockNGOs = [
    { id: 1, organizationName: 'HopeAid Foundation', address: '123 Main St, Los Angeles, CA', contact: '+1-310-555-0101' },
    { id: 2, organizationName: 'CityReach', address: '456 Oak Ave, Los Angeles, CA', contact: '+1-310-555-0202' },
    { id: 3, organizationName: 'GlobalVolunteer Network', address: '789 Pine Blvd, Los Angeles, CA', contact: '+1-310-555-0303' },
];

export const api = {
    async login(email, password) {
        const res = await fetchWithTimeout(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });
        if (!res.ok) throw new Error('Invalid email or password');
        return res.json();
    },

    async getStats() {
        try {
            const res = await fetchWithTimeout(`${API_URL}/stats`);
            if (res.ok) return await res.json();
        } catch { }
        return {
            totalReports: mockReports.length,
            completedTasks: mockTasks.filter(t => t.status === 'Completed').length,
            pendingReports: mockReports.filter(r => r.status === 'Pending').length,
            activeVolunteers: mockVolunteers.filter(v => v.availabilityStatus === 'available').length,
        };
    },

    async getReports() {
        try {
            const res = await fetchWithTimeout(`${API_URL}/reports`);
            if (res.ok) return await res.json();
        } catch { }
        return mockReports;
    },

    async getTasks() {
        try {
            const res = await fetchWithTimeout(`${API_URL}/tasks`);
            if (res.ok) return await res.json();
        } catch { }
        return mockTasks;
    },

    async getVolunteers() {
        try {
            const res = await fetchWithTimeout(`${API_URL}/volunteers`);
            if (res.ok) return await res.json();
        } catch { }
        return mockVolunteers;
    },

    async getNGOs() {
        try {
            const res = await fetchWithTimeout(`${API_URL}/ngos`);
            if (res.ok) return await res.json();
        } catch { }
        return mockNGOs;
    },

    async submitReport(data) {
        try {
            const isFormData = data instanceof FormData;
            const res = await fetchWithTimeout(`${API_URL}/reports`, {
                method: 'POST',
                headers: getAuthHeaders(isFormData ? {} : { 'Content-Type': 'application/json' }),
                body: isFormData ? data : JSON.stringify(data),
            });
            if (res.ok) return await res.json();
        } catch { }
        
        const newReport = {
            id: Math.floor(Math.random() * 90000) + 10000,
            issueType: data instanceof FormData ? data.get('issueType') || 'General' : data.issueType || 'General',
            description: data instanceof FormData ? data.get('description') || '' : data.description || '',
            urgency: parseInt(data instanceof FormData ? data.get('urgency') : data.urgency) || 5,
            peopleAffected: parseInt(data instanceof FormData ? data.get('peopleAffected') : data.peopleAffected) || 10,
            latitude: 34.0522,
            longitude: -118.2437,
            submittedBy: 3,
            status: 'Pending',
            createdAt: new Date().toISOString(),
            priorityScore: 65,
            aiAnalysis: { recommendedAction: 'Assess emergency priority', requiredSupplies: ['Water', 'First Aid'] }
        };
        mockReports.unshift(newReport);
        return newReport;
    },

    async assignTask(reportId, volunteerId) {
        try {
            const res = await fetchWithTimeout(`${API_URL}/tasks`, {
                method: 'POST',
                headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
                body: JSON.stringify({ reportId, volunteerId }),
            });
            if (res.ok) return await res.json();
        } catch { }

        mockReports = mockReports.map(r => r.id === parseInt(reportId) ? { ...r, status: 'Assigned' } : r);
        const task = {
            id: Math.floor(Math.random() * 90000) + 10000,
            reportId: parseInt(reportId),
            assignedVolunteerId: parseInt(volunteerId),
            assignedAt: new Date().toISOString(),
            completedAt: null,
            status: 'In Progress',
        };
        mockTasks.unshift(task);
        return task;
    },

    async updateTaskStatus(taskId, status) {
        try {
            const res = await fetchWithTimeout(`${API_URL}/tasks/${taskId}`, {
                method: 'PATCH',
                headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
                body: JSON.stringify({ status }),
            });
            if (res.ok) return await res.json();
        } catch { }

        mockTasks = mockTasks.map(t => t.id === parseInt(taskId) ? { ...t, status, completedAt: status === 'Completed' ? new Date().toISOString() : t.completedAt } : t);
        return { success: true };
    },

    async getSuggestedVolunteers(reportId) {
        try {
            const res = await fetchWithTimeout(`${API_URL}/reports/${reportId}/match`);
            if (res.ok) return await res.json();
        } catch { }

        return mockVolunteers.map(vol => ({
            ...vol,
            matchScore: Math.floor(Math.random() * 30) + 70,
            distanceKm: (Math.random() * 10 + 1).toFixed(1),
        })).sort((a, b) => b.matchScore - a.matchScore).slice(0, 5);
    },
};
