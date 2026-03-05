export interface Batch {
    id: string;
    name: string;
}

export interface Module {
    id: string;
    name: string;
    batch_id: string;
}

export interface Lecture {
    id: string;
    title: string;
    module_id: string;
    type: 'lecture' | 'section';
    number: number;
}

export interface Source {
    id: string;
    lecture_id: string;
    title: string;
    url: string | null;
    duration_minutes: number;
    created_at: string;
}

export interface Rating {
    id: string;
    source_id: string;
    score: number;
    comment: string | null;
    created_at: string;
}

export interface SourceWithStats extends Source {
    average_rating: number;
    rating_count: number;
    ratings: Rating[];
}
