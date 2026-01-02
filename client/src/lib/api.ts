const API_URL = import.meta.env.VITE_API_URL || '/api';

export interface Team {
    id: number;
    name: string;
    priceCents: number;
    capacity: number;
    description: string | null;
    open: boolean;
}

export async function fetchTeams(): Promise<Team[]> {
    const res = await fetch(`${API_URL}/teams`);
    if (!res.ok) throw new Error('Failed to fetch teams');
    return res.json();
}
