const API_URL = 'http://localhost:3000/api';

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
