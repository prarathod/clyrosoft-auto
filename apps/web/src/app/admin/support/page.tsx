import { supabaseAdmin } from '@/lib/supabaseAdmin'
import SupportTable from './SupportTable'

export const revalidate = 0

export default async function AdminSupportPage() {
  const supabase = supabaseAdmin
  const { data: messages, error } = await supabase
    .from('support_messages')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-black text-white mb-1">Support</h1>
          <p className="text-gray-500 text-sm">Messages from clinic owners</p>
        </div>
        <div className="bg-yellow-950 border border-yellow-800 rounded-xl p-6">
          <p className="text-yellow-400 font-semibold mb-2">Table not set up yet</p>
          <p className="text-yellow-200 text-sm mb-4">Run this SQL in Supabase to enable support messages:</p>
          <pre className="bg-gray-950 text-green-400 text-xs p-4 rounded-lg overflow-x-auto">{`CREATE TABLE support_messages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  subdomain text NOT NULL,
  clinic_name text NOT NULL,
  phone text,
  message text NOT NULL,
  created_at timestamptz DEFAULT now(),
  replied boolean DEFAULT false
);
ALTER TABLE support_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "clients insert support" ON support_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "admin read support" ON support_messages FOR SELECT USING (true);
CREATE POLICY "admin update support" ON support_messages FOR UPDATE USING (true);`}</pre>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white mb-1">Support</h1>
        <p className="text-gray-500 text-sm">{(messages ?? []).length} messages from clinic owners</p>
      </div>
      <SupportTable messages={messages ?? []} />
    </div>
  )
}
