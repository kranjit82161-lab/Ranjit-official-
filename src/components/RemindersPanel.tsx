import React, { useState } from 'react';
import { Bell, Plus, Trash2, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import { Reminder } from '../types/jarvis.ts';

interface RemindersPanelProps {
  reminders: Reminder[];
  onAddReminder: (reminder: Omit<Reminder, 'id' | 'createdAt'>) => void;
  onToggleComplete: (id: string) => void;
  onDeleteReminder: (id: string) => void;
  activeAlarmReminder?: Reminder | null;
  onDismissAlarm?: () => void;
}

export const RemindersPanel: React.FC<RemindersPanelProps> = ({
  reminders,
  onAddReminder,
  onToggleComplete,
  onDeleteReminder,
  activeAlarmReminder,
  onDismissAlarm,
}) => {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('18:00');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAddReminder({
      title: title.trim(),
      time,
      date,
      completed: false,
      priority: 'high',
    });
    setTitle('');
    setShowForm(false);
  };

  return (
    <div className="w-full flex flex-col gap-3">
      {/* Active Alarm Banner (if triggered) */}
      {activeAlarmReminder && (
        <div className="p-4 rounded-xl bg-red-950/90 border-2 border-red-500 animate-pulse glow-red flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-600 text-white animate-bounce">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-mono-tech tracking-wider text-red-300 font-bold">
                ⚠️ ALARM ALERT FIRING NOW
              </span>
              <h4 className="text-base font-bold text-white">
                {activeAlarmReminder.title}
              </h4>
              <p className="text-xs text-red-200 font-mono-tech">
                Scheduled for {activeAlarmReminder.time}
              </p>
            </div>
          </div>
          {onDismissAlarm && (
            <button
              onClick={onDismissAlarm}
              className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase font-mono-tech shadow-lg"
            >
              Dismiss Alarm
            </button>
          )}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-amber-400" />
          <h3 className="font-orbitron font-bold text-base text-white">
            Smart Reminders & Alarms
          </h3>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-mono-tech flex items-center gap-1 transition-all shadow-md active:scale-95"
        >
          <Plus className="w-3.5 h-3.5" />
          Set Reminder
        </button>
      </div>

      {/* Add Reminder Form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="p-3.5 rounded-xl bg-slate-900/90 border border-amber-500/40 flex flex-col gap-2.5 shadow-lg"
        >
          <h4 className="text-xs font-mono-tech text-amber-300 uppercase tracking-wider">
            New Jarvis Reminder
          </h4>
          <input
            type="text"
            placeholder="Reminder description (e.g. Papa ko medicine dena hai)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-amber-500/30 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
            autoFocus
          />
          <div className="flex items-center gap-2">
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-slate-950 border border-amber-500/30 text-xs text-amber-300 focus:outline-none focus:border-amber-400 font-mono-tech"
            />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="flex-1 px-3 py-1.5 rounded-lg bg-slate-950 border border-amber-500/30 text-xs text-amber-300 focus:outline-none focus:border-amber-400 font-mono-tech"
            />
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all font-mono-tech"
            >
              Set
            </button>
          </div>
        </form>
      )}

      {/* Reminders List */}
      <div className="flex flex-col gap-2">
        {reminders.length === 0 ? (
          <div className="text-center py-6 text-slate-400 font-mono-tech text-xs bg-slate-950/40 rounded-xl border border-dashed border-amber-500/20">
            No active reminders. Speak: "5 baje reminder lagao - recharge karna hai".
          </div>
        ) : (
          reminders.map((r) => (
            <div
              key={r.id}
              className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                r.completed
                  ? 'bg-slate-950/40 border-slate-800/60 opacity-60'
                  : 'bg-slate-900/70 border-amber-500/25 hover:border-amber-400/50 hover:bg-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => onToggleComplete(r.id)}
                  className="text-amber-400 hover:text-amber-300 transition-colors"
                >
                  {r.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <Bell className="w-5 h-5 text-amber-500/80" />
                  )}
                </button>
                <div>
                  <span
                    className={`text-sm font-medium ${
                      r.completed ? 'line-through text-slate-400' : 'text-white'
                    }`}
                  >
                    {r.title}
                  </span>
                  <div className="flex items-center gap-2 text-xs text-amber-400/80 font-mono-tech mt-0.5">
                    <Clock className="w-3 h-3" />
                    <span>{r.time}</span>
                    <span className="text-slate-500">• {r.date}</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onDeleteReminder(r.id)}
                className="text-slate-500 hover:text-red-400 p-1.5 rounded-lg transition-colors"
                title="Delete reminder"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
