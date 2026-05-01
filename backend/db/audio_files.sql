CREATE TABLE audio_files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    file_path TEXT,
    url TEXT,
    text_source TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);
