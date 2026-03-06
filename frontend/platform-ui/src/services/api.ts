import axios from 'axios';

const API_BASE = "http://localhost:8005";
const DEMO_APP_BASE = "http://localhost:8006";

const api = axios.create({
  baseURL: API_BASE,
});

export const fetchAlerts = async () => {
  try {
    const response = await api.get('/alerts');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch alerts', error);
    return [];
  }
};

export const fetchSystemState = async () => {
  try {
    const response = await api.get('/system-state');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch system state', error);
    return { commanderStatus: 'UNKNOWN', globalThreatLevel: 'UNKNOWN', systemHealth: 0, nodes: [], edges: [] };
  }
};

export const fetchAgentStatus = async () => {
  try {
    const response = await api.get('/agent-status');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch agent status', error);
    return [];
  }
};

export const fetchTimeline = async () => {
  try {
    const response = await api.get('/timeline');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch timeline', error);
    return [];
  }
};

export const triggerAttack = async (endpoint: string) => {
  try {
    const response = await axios.post(`${DEMO_APP_BASE}/attack/${endpoint}`);
    return response.data;
  } catch (error) {
    console.error(`Failed to trigger attack: ${endpoint}`, error);
    return { message: 'Attack trigger failed' };
  }
};
