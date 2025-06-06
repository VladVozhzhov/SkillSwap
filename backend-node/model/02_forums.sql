CREATE TABLE forums (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    title text NOT NULL,
    description text,
    created_by uuid NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY(id),
    CONSTRAINT forums_created_by_fkey FOREIGN KEY(created_by) REFERENCES users(id)
);
