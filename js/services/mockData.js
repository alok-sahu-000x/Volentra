const mockUsers = [
    { id: 1, name: 'Admin Aditya', email: 'admin@ngo.org', password: 'password', role: 'admin' },
    { id: 2, name: 'Volunteer John', email: 'john@vol.org', password: 'password', role: 'volunteer' },
    { id: 3, name: 'Field Worker Mike', email: 'mike@field.org', password: 'password', role: 'field_worker' },
];

const issueTypes = ['Medical', 'Food Shortage', 'Infrastructure', 'Shelter', 'Water Supply', 'Logistics'];

const mockVolunteers = Array.from({ length: 20 }, (_, i) => {
    return {
        id: i + 100,
        userId: i === 0 ? 2 : null,
        name: `Volunteer ${i + 1}`,
        skills: [issueTypes[Math.floor(Math.random() * issueTypes.length)], 'General'],
        latitude: 34.0522 + (Math.random() - 0.5) * 0.5,
        longitude: -118.2437 + (Math.random() - 0.5) * 0.5,
        availabilityStatus: Math.random() > 0.3 ? 'available' : 'busy',
        rating: (Math.random() * 2 + 3).toFixed(1),
        experienceLevel: Math.random() > 0.5 ? 'Expert' : 'Intermediate',
        totalHoursServed: Math.floor(Math.random() * 200)
    };
});

const mockReports = Array.from({ length: 30 }, (_, i) => {
    const isNew = Math.random() > 0.5;
    return {
        id: i + 500,
        issueType: issueTypes[Math.floor(Math.random() * issueTypes.length)],
        description: `Urgent assistance required in sector ${i}. Multiple families affected.`,
        urgency: Math.floor(Math.random() * 10) + 1,
        peopleAffected: Math.floor(Math.random() * 500) + 10,
        latitude: 34.0522 + (Math.random() - 0.5) * 0.4,
        longitude: -118.2437 + (Math.random() - 0.5) * 0.4,
        priorityScore: 0,
        submittedBy: 3,
        ngoId: 1,
        status: isNew ? 'Pending' : (Math.random() > 0.5 ? 'Assigned' : 'Completed'),
        createdAt: new Date(Date.now() - Math.random() * 100000000).toISOString()
    };
});

const mockTasks = mockReports.filter(r => r.status !== 'Pending').map((r, i) => {
    return {
        id: i + 1000,
        reportId: r.id,
        assignedVolunteerId: mockVolunteers[Math.floor(Math.random() * mockVolunteers.length)].id,
        assignedAt: new Date(Date.now() - 50000000).toISOString(),
        completedAt: r.status === 'Completed' ? new Date().toISOString() : null,
        deadline: new Date(Date.now() + 86400000).toISOString(),
        status: r.status === 'Assigned' ? 'In Progress' : 'Completed'
    };
});

import { calculatePriorityScore } from '../store/matchingEngine.js';
mockReports.forEach(r => {
    r.priorityScore = calculatePriorityScore(r.urgency, r.peopleAffected, r.createdAt);
});

export { mockUsers, mockVolunteers, mockReports, mockTasks };
