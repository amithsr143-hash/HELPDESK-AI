-- 005_storage_policies.sql: Storage Bucket & RLS for Ticket Attachments

-- Create private bucket for ticket attachments
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'ticket-attachments',
    'ticket-attachments',
    FALSE,
    5242880, -- 5MB limit
    ARRAY['image/png', 'image/jpeg', 'image/webp', 'application/pdf', 'text/plain', 'application/zip']
)
ON CONFLICT (id) DO UPDATE
SET public = FALSE,
    file_size_limit = 5242880;

-- Storage Policies
CREATE POLICY "Allow authenticated users to download attachments for their tickets"
ON storage.objects FOR SELECT
TO authenticated
USING (
    bucket_id = 'ticket-attachments'
    AND (
        public.get_auth_role() IN ('admin', 'agent')
        OR (storage.foldername(name))[1] = auth.uid()::text
    )
);

CREATE POLICY "Allow authenticated users to upload attachments to their folder"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'ticket-attachments'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Allow agents/admins to delete attachments"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'ticket-attachments'
    AND public.get_auth_role() = 'admin'
);

