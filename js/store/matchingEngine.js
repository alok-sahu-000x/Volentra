export function calculatePriorityScore(urgency, peopleAffected, createdAt) {
    const urgencyScore = (urgency / 10) * 100;
    const peopleScore = Math.min((peopleAffected / 1000) * 100, 100);
    const hoursPending = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60);
    const timeScore = Math.min((hoursPending / 72) * 100, 100);
    return Math.round((urgencyScore * 0.5) + (peopleScore * 0.3) + (timeScore * 0.2));
}

function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    const R = 6371; 
    const dLat = (lat2 - lat1) * (Math.PI/180);
    const dLon = (lon2 - lon1) * (Math.PI/180); 
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * (Math.PI/180)) * Math.cos(lat2 * (Math.PI/180)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    return R * c;
}

export function rankVolunteers(report, volunteers) {
    const requiredSkill = report.issueType.toLowerCase();

    return volunteers.map(vol => {
        const hasSkill = vol.skills.some(s => requiredSkill.includes(s.toLowerCase()) || s.toLowerCase() === 'general');
        const skillMatch = hasSkill ? 100 : 20;
        
        const distanceKm = getDistanceFromLatLonInKm(report.latitude, report.longitude, vol.latitude, vol.longitude);
        let locationProximity = 0;
        if (distanceKm <= 5) locationProximity = 100;
        else if (distanceKm <= 20) locationProximity = 70;
        else if (distanceKm <= 50) locationProximity = 40;
        else locationProximity = 10;
        
        const availability = vol.availabilityStatus === 'available' ? 100 : 0;
        const experience = (vol.rating / 5) * 100;
        
        const finalScore = (skillMatch * 0.4) + (locationProximity * 0.3) + (availability * 0.2) + (experience * 0.1);
        
        return {
            ...vol,
            matchScore: Math.round(finalScore),
            distanceKm: distanceKm.toFixed(1)
        };
    }).sort((a, b) => b.matchScore - a.matchScore);
}
