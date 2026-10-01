import React, { useState } from 'react';
import { Phone, MessageSquare, Plus, Trash2, User, Star } from 'lucide-react';
import { Contact } from '../types/jarvis.ts';

interface ContactsPanelProps {
  contacts: Contact[];
  onCall: (phone: string, name: string) => void;
  onWhatsApp: (phone: string, name: string) => void;
  onSms: (phone: string, name: string) => void;
  onAddContact: (contact: Omit<Contact, 'id'>) => void;
  onDeleteContact: (id: string) => void;
}

export const ContactsPanel: React.FC<ContactsPanelProps> = ({
  contacts,
  onCall,
  onWhatsApp,
  onSms,
  onAddContact,
  onDeleteContact,
}) => {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('+91');
  const [relation, setRelation] = useState('Family');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;
    onAddContact({
      name: name.trim(),
      phone: phone.trim(),
      relation,
      avatarColor: 'bg-cyan-600',
    });
    setName('');
    setPhone('+91');
    setShowForm(false);
  };

  return (
    <div className="w-full flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Phone className="w-5 h-5 text-emerald-400" />
          <h3 className="font-orbitron font-bold text-base text-white">
            Phone Contacts & Direct Calling
          </h3>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono-tech flex items-center gap-1 transition-all shadow-md active:scale-95"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Contact
        </button>
      </div>

      <p className="text-xs text-slate-400 font-sans">
        JARVIS connects directly to your phone dialer. Just say: <span className="text-cyan-300 font-mono-tech">"Papa ko call karo"</span> or tap below.
      </p>

      {/* Add Contact Form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="p-3.5 rounded-xl bg-slate-900/90 border border-emerald-500/40 flex flex-col gap-2.5 shadow-lg"
        >
          <h4 className="text-xs font-mono-tech text-emerald-300 uppercase tracking-wider">
            Register Phone Contact
          </h4>
          <input
            type="text"
            placeholder="Contact Name (e.g. Papa, Mummy, Boss)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-emerald-500/30 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400"
            autoFocus
          />
          <div className="flex items-center gap-2">
            <input
              type="tel"
              placeholder="+91 Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="flex-1 px-3 py-1.5 rounded-lg bg-slate-950 border border-emerald-500/30 text-xs text-emerald-300 focus:outline-none focus:border-emerald-400 font-mono-tech"
            />
            <select
              value={relation}
              onChange={(e) => setRelation(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-slate-950 border border-emerald-500/30 text-xs text-emerald-300 focus:outline-none focus:border-emerald-400 font-mono-tech"
            >
              <option value="Family">Family</option>
              <option value="Friend">Friend</option>
              <option value="Work">Work</option>
              <option value="Emergency">Emergency</option>
            </select>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all font-mono-tech"
            >
              Save
            </button>
          </div>
        </form>
      )}

      {/* Contact Cards List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {contacts.map((c) => (
          <div
            key={c.id}
            className="p-3 rounded-xl bg-slate-900/70 border border-emerald-500/20 hover:border-emerald-400/50 transition-all flex items-center justify-between gap-2 shadow-sm"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm ${
                  c.avatarColor || 'bg-cyan-700'
                }`}
              >
                {c.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h4 className="text-sm font-semibold text-white truncate">
                    {c.name}
                  </h4>
                  {c.starred && (
                    <Star className="w-3 h-3 text-amber-400 fill-amber-400 flex-shrink-0" />
                  )}
                </div>
                <p className="text-xs text-emerald-400 font-mono-tech truncate">
                  {c.phone}
                </p>
                <span className="text-[10px] text-slate-400 font-mono-tech uppercase">
                  {c.relation}
                </span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-1 flex-shrink-0">
              {/* Call */}
              <button
                type="button"
                onClick={() => onCall(c.phone, c.name)}
                className="p-2 rounded-lg bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-white border border-emerald-500/40 transition-all"
                title={`Call ${c.name}`}
              >
                <Phone className="w-4 h-4" />
              </button>

              {/* WhatsApp */}
              <button
                type="button"
                onClick={() => onWhatsApp(c.phone, c.name)}
                className="p-2 rounded-lg bg-green-500/20 hover:bg-green-500 text-green-300 hover:text-white border border-green-500/40 transition-all"
                title={`WhatsApp ${c.name}`}
              >
                <MessageSquare className="w-4 h-4" />
              </button>

              {/* Delete */}
              <button
                type="button"
                onClick={() => onDeleteContact(c.id)}
                className="p-1.5 text-slate-500 hover:text-red-400 transition-colors"
                title="Remove contact"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
