CREATE TABLE links (
    id text PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) NOT NULL,
    url text NOT NULL,
    title text NOT NULL,
    hostname text NOT NULL,
    tags text[] DEFAULT '{}',
    notes text,
    category text DEFAULT 'General',
    created_at bigint NOT NULL,
    updated_at bigint,
    synced_at timestamptz DEFAULT now()
);

ALTER TABLE links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own links."
    ON links
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
