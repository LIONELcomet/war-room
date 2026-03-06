const API_BASE = 'http://localhost:8005';

export const fetchAlerts = async () => {
    try {
        const res = await fetch(`${API_BASE}/alerts`);
        if (!res.ok) throw new Error('Network error');
        return await res.json();
    } catch (error) {
        console.error('Failed to fetch alerts', error);
        return [];
    }
};

export const fetchSystemState = async () => {
    try {
        const res = await fetch(`${API_BASE}/system-state`);
        if (!res.ok) throw new Error('Network error');
        return await res.json();
    } catch (error) {
        console.error('Failed to fetch system state', error);
        return { commanderStatus: 'UNKNOWN', globalThreatLevel: 'UNKNOWN', systemHealth: 0, nodes: [], edges: [] };
    }
};

export const fetchAgentStatus = async () => {
    try {
        const res = await fetch(`${API_BASE}/agent-status`);
        if (!res.ok) throw new Error('Network error');
        return await res.json();
    } catch (error) {
        console.error('Failed to fetch agent status', error);
        return [];
    }
};

export const fetchTimeline = async () => {
    try {
        const res = await fetch(`${API_BASE}/timeline`);
        if (!res.ok) throw new Error('Network error');
        return await res.json();
    } catch (error) {
        console.error('Failed to fetch timeline', error);
        return [];
    }
};
