import { store } from '../store/store.js';
import { mockUsers, mockVolunteers, mockReports, mockTasks } from './mockData.js';
import { calculatePriorityScore, rankVolunteers } from '../store/matchingEngine.js';

const delay = (ms) => new Promise(res => setTimeout(res, ms));

export const api = {
    async initSeedData() {
        store.setState({
            volunteers: [...mockVolunteers],
            reports: [...mockReports],
            tasks: [...mockTasks]
        });
        this._updateStats();
    },

    _updateStats() {
        const state = store.getState();
        store.setState({
            stats: {
                totalReports: state.reports.length,
                completedTasks: state.tasks.filter(t => t.status === 'Completed').length,
                pendingReports: state.reports.filter(r => r.status === 'Pending').length,
                activeVolunteers: state.volunteers.filter(v => v.availabilityStatus === 'available').length
            }
        });
    },

    async login(email, password) {
        await delay(600);
        const user = mockUsers.find(u => u.email === email && u.password === password);
        if (!user) throw new Error("Invalid credentials");
        store.setState({ user });
        return user;
    },

    async logout() {
        await delay(300);
        store.setState({ user: null });
        window.navigate('/login');
    },

    async submitReport(reportData) {
        await delay(800);
        const state = store.getState();
        const score = calculatePriorityScore(reportData.urgency, reportData.peopleAffected, new Date().toISOString());
        
        const newReport = {
            id: Math.floor(Math.random() * 10000) + 1000,
            ...reportData,
            status: 'Pending',
            priorityScore: score,
            createdAt: new Date().toISOString()
        };
        
        store.setState({ reports: [newReport, ...state.reports] });
        this._updateStats();
        return newReport;
    },

    async assignTask(reportId, volunteerId) {
        await delay(500);
        const state = store.getState();
        const updatedReports = state.reports.map(r => r.id === reportId ? { ...r, status: 'Assigned' } : r);
        const newTask = {
            id: Math.floor(Math.random() * 10000) + 5000,
            reportId,
            assignedVolunteerId: volunteerId,
            assignedAt: new Date().toISOString(),
            status: 'In Progress'
        };

        store.setState({ 
            reports: updatedReports, 
            tasks: [newTask, ...state.tasks] 
        });
        this._updateStats();
        return newTask;
    },
    
    async updateTaskStatus(taskId, status) {
        await delay(400);
        const state = store.getState();
        const updatedTasks = state.tasks.map(t => {
            if (t.id === taskId) {
                return { ...t, status, completedAt: status === 'Completed' ? new Date().toISOString() : t.completedAt };
            }
            return t;
        });

        const task = updatedTasks.find(t => t.id === taskId);
        let updatedReports = state.reports;
        if(status === 'Completed' && task) {
             updatedReports = state.reports.map(r => r.id === task.reportId ? {...r, status: 'Completed'} : r);
        }

        store.setState({ tasks: updatedTasks, reports: updatedReports });
        this._updateStats();
    },

    async getSuggestedVolunteers(reportId) {
        await delay(300);
        const state = store.getState();
        const report = state.reports.find(r => r.id === reportId);
        if (!report) throw new Error("Report not found");

        return rankVolunteers(report, state.volunteers).slice(0, 5);
    }
};
