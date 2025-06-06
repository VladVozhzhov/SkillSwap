CREATE OR REPLACE FUNCTION update_comment_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.message IS DISTINCT FROM OLD.message THEN
        NEW.updated_at := CURRENT_TIMESTAMP;
        NEW.edited := TRUE;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trigger_update_comment_timestamp
BEFORE UPDATE ON public.forum_comments
FOR EACH ROW
EXECUTE FUNCTION update_comment_timestamp();
