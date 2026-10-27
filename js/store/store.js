class Store {
    constructor() {
        this.state = {
            user: null,
            reports: [],
            tasks: [],
            volunteers: [],
            notifications: [],
            stats: {
                totalReports: 0,
                completedTasks: 0,
                activeVolunteers: 0
            }
        };
        this.listeners = [];
    }
    getState() { return this.state; }
    setState(newState) {
        this.state = { ...this.state, ...newState };
        this.notify();
    }
    subscribe(listener) {
        this.listeners.push(listener);
        return () => { this.listeners = this.listeners.filter(l => l !== listener); };
    }
    notify() {
        for (const listener of this.listeners) listener(this.state);
    }
}
export const store = new Store();
