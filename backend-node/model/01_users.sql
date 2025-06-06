CREATE TABLE users (
    password varchar(255),
    token text,
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    email text,
    google_id varchar(255),
    name varchar(255),
    timestamp timestamp without time zone,
    PRIMARY KEY(id)
);

CREATE UNIQUE INDEX email ON public.users USING btree (email);
