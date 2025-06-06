CREATE TABLE forum_comments (
    id SERIAL NOT NULL,
    forum_id uuid NOT NULL,
    user_id uuid NOT NULL,
    message text NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    edited boolean DEFAULT false,
    PRIMARY KEY(id),
    CONSTRAINT fk_forum FOREIGN KEY(forum_id) REFERENCES forums(id),
    CONSTRAINT fk_user FOREIGN KEY(user_id) REFERENCES users(id)
);
