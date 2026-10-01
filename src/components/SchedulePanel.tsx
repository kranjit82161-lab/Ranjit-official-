import React, { useState } from 'react';
import { Calendar, CheckCircle2, Circle, Plus, Trash2, Volume2, Clock } from 'lucide-react';
import { ScheduleItem } from '../types/jarvis.ts';

interface SchedulePanelProps {
  schedule: ScheduleItem[];
  onToggleComplete: (id: string) => void;
  onAddItem: (item: Omit<ScheduleItem, 'id' | 'completed'>) => void;
  onDeleteItem: (id: string) => void;
  onReadSchedule: () => void;
}

export const SchedulePanel: React.FC<SchedulePanelProps> = ({
  schedule,
  onToggleComplete,
  onAddItem,
  onDeleteItem,
  onReadSchedule,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTime, setNewTime] = useState('10:00 AM');
  const [newCategory, setNewCategory] = useState<'work' | 'personal' | 'health' | 'stark'>('work');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    onAddItem({
      title: newTitle.trim(),
      time: newTime,
      category: newCategory,
      duration: '45 mins',
    });
    setNewTitle('');
    setShowAddForm(false);
  };

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'work':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
      case 'personal':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
      case 'health':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      default:
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
    }
  };

  return (
    <div className="w-full flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-cyan-400" />
          <h3 className="font-orbitron font-bold text-base text-white">
            Daily Schedule & Timeline
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onReadSchedule}
            className="px-2.5 py-1 rounded-lg bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 text-xs font-mono-tech flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
            title="Jarvis speaks schedule aloud"
          >
            <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
            Speak Schedule
          </button>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-2.5 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-mono-tech flex items-center gap-1 transition-all shadow-md active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Event
          </button>
        </div>
      </div>

      {/* Add Item Form */}
      {showAddForm && (
        <form
          onSubmit={handleSubmit}
          className="p-3.5 rounded-xl bg-slate-900/90 border border-cyan-500/40 flex flex-col gap-2.5 glow-cyan"
        >
          <h4 className="text-xs font-mono-tech text-cyan-300 uppercase tracking-wider">
            Create Schedule Directive
          </h4>
          <input
            type="text"
            placeholder="Event Title (e.g., Android Architecture Review)"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-cyan-500/30 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            autoFocus
          />
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Time (e.g. 04:30 PM)"
              value={newTime}
              onChange={(e) => setNewTime(e.target.value)}
              className="flex-1 px-3 py-1.5 rounded-lg bg-slate-950 border border-cyan-500/30 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono-tech"
            />
            <select
              value={newCategory}
              onChange={(e: any) => setNewCategory(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-slate-950 border border-cyan-500/30 text-xs text-cyan-300 focus:outline-none focus:border-cyan-400 font-mono-tech"
            >
              <option value="work">Work</option>
              <option value="personal">Personal</option>
              <option value="health">Health</option>
              <option value="stark">Stark Lab</option>
            </select>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-all font-mono-tech"
            >
              Save
            </button>
          </div>
        </form>
      )}

      {/* Schedule Items List */}
      <div className="flex flex-col gap-2">
        {schedule.length === 0 ? (
          <div className="text-center py-6 text-slate-400 font-mono-tech text-xs bg-slate-950/40 rounded-xl border border-dashed border-cyan-500/20">
            No schedule events recorded for today. Tell Jarvis: "Schedule add karo 4 baje meeting".
          </div>
        ) : (
          schedule.map((item) => (
            <div
              key={item.id}
              className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                item.completed
                  ? 'bg-slate-950/40 border-slate-800/60 opacity-60'
                  : 'bg-slate-900/70 border-cyan-500/25 hover:border-cyan-400/50 hover:bg-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => onToggleComplete(item.id)}
                  className="text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  {item.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <Circle className="w-5 h-5 text-cyan-500/70" />
                  )}
                </button>
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-sm font-medium ${
                        item.completed
                          ? 'line-through text-slate-400'
                          : 'text-white'
                      }`}
                    >
                      {item.title}
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded border uppercase font-mono-tech ${getCategoryBadge(
                        item.category
                      )}`}
                    >
                      {item.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-cyan-400/80 font-mono-tech mt-0.5">
                    <Clock className="w-3 h-3" />
                    <span>{item.time}</span>
                    {item.duration && (
                      <span className="text-slate-400">• {item.duration}</span>
                    )}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onDeleteItem(item.id)}
                className="text-slate-500 hover:text-red-400 p-1.5 rounded-lg transition-colors"
                title="Delete event"
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
