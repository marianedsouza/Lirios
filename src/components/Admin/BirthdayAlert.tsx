import React, { useState } from 'react';
import { useAppStore } from '../../store/useStore';
import { Gift, MessageCircle, X } from 'lucide-react';

const DISMISS_KEY = 'birthday_alert_dismissed';

function currentMonthKey(): string {
  const today = new Date();
  return `${today.getFullYear()}-${today.getMonth()}`;
}

export function BirthdayAlert() {
  const { members } = useAppStore();
  const [dismissed, setDismissed] = useState<boolean>(() => {
    try {
      return localStorage.getItem(DISMISS_KEY) === currentMonthKey();
    } catch {
      return false;
    }
  });

  const closeAlert = () => {
    try {
      localStorage.setItem(DISMISS_KEY, currentMonthKey());
    } catch {
      // storage indisponível — apenas fecha nesta sessão
    }
    setDismissed(true);
  };
  
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentDay = today.getDate();
  
  const membersWithBirthdays = members
    .filter(m => (m.status === 'Ativo' || m.status === 'Dirigente') && m.birthDate)
    .map(m => {
      const parts = m.birthDate.split('/');
      if (parts.length !== 3) return null;
      const [day, month, year] = parts.map(Number);
      if (!day || !month || !year) return null;
      const age = today.getFullYear() - year;
      return {
        ...m,
        birthdayDay: day,
        birthdayMonth: month - 1,
        age
      };
    })
    .filter(Boolean) as Array<{ birthdayDay: number; birthdayMonth: number; age: number } & typeof members[0]>;
  
  const birthdayThisMonth = membersWithBirthdays
    .filter(m => m.birthdayMonth === currentMonth)
    .sort((a, b) => a.birthdayDay - b.birthdayDay);
  
  const todayBirthdays = birthdayThisMonth.filter(m => m.birthdayDay === currentDay);
  const upcomingBirthdays = birthdayThisMonth.filter(m => m.birthdayDay > currentDay).slice(0, 5);
  const pastBirthdays = birthdayThisMonth
    .filter(m => m.birthdayDay < currentDay)
    .sort((a, b) => b.birthdayDay - a.birthdayDay);

  if (dismissed || birthdayThisMonth.length === 0) return null;

  const formatWhatsAppLink = (phone: string, name: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    const message = encodeURIComponent(`Parabéns pelo seu aniversário, ${name}! 🎂🎉 Que Deus abençoe este novo ano com muita saúde, paz e amor. Feliz aniversário! 🙏✨`);
    return `https://wa.me/55${cleanPhone}?text=${message}`;
  };

  return (
    <div className="bg-gradient-to-r from-pink-50 to-purple-50 border border-pink-200 rounded-lg p-4 mb-4">
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <Gift className="text-pink-500" size={20} />
          <h3 className="text-sm font-bold text-pink-700">Aniversariantes do Mês</h3>
          <span className="bg-pink-200 text-pink-800 text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
            {birthdayThisMonth.length} {birthdayThisMonth.length === 1 ? 'aniversariante' : 'aniversariantes'}
          </span>
        </div>
        <button
          onClick={closeAlert}
          className="text-pink-400 hover:text-pink-600 transition-colors shrink-0"
          title="Fechar alerta de aniversariantes deste mês"
        >
          <X size={18} />
        </button>
      </div>
      
      {todayBirthdays.length > 0 && (
        <div className="mb-3 p-3 bg-white rounded-lg border border-pink-300 shadow-sm">
          <p className="text-[10px] font-bold text-pink-600 uppercase mb-2">Hoje é aniversário de:</p>
          {todayBirthdays.map(member => (
            <div key={member.id} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-pink-700">🎂 {member.name}</span>
                <span className="text-[10px] text-pink-500">({member.age} anos)</span>
              </div>
              {member.whatsapp && (
                <a 
                  href={formatWhatsAppLink(member.whatsapp, member.name)} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 bg-green-500 text-white px-2 py-1 rounded text-[10px] font-bold hover:bg-green-600"
                >
                  <MessageCircle size={12} />
                  Parabenizar
                </a>
              )}
            </div>
          ))}
        </div>
      )}
      
      {upcomingBirthdays.length > 0 && (
        <div className="bg-white rounded-lg p-3 border border-pink-200">
          <p className="text-[10px] font-bold text-pink-600 uppercase mb-2">Próximos aniversários:</p>
          <div className="space-y-1">
            {upcomingBirthdays.map(member => (
              <div key={member.id} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-pink-400">🎂</span>
                  <span className="font-medium text-slate-700">{member.name}</span>
                  <span className="text-[10px] text-slate-400">
                    Dia {member.birthdayDay}/{member.birthdayMonth + 1}
                  </span>
                </div>
                {member.whatsapp && (
                  <a 
                    href={formatWhatsAppLink(member.whatsapp, member.name)} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-green-600 hover:text-green-700"
                  >
                    <MessageCircle size={14} />
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {pastBirthdays.length > 0 && (
        <div className="bg-white rounded-lg p-3 border border-pink-200">
          <p className="text-[10px] font-bold text-pink-600 uppercase mb-2">Já comemorados neste mês:</p>
          <div className="space-y-1">
            {pastBirthdays.map(member => (
              <div key={member.id} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-pink-400">🎂</span>
                  <span className="font-medium text-slate-700">{member.name}</span>
                  <span className="text-[10px] text-slate-400">
                    Dia {member.birthdayDay}/{member.birthdayMonth + 1}
                  </span>
                </div>
                {member.whatsapp && (
                  <a
                    href={formatWhatsAppLink(member.whatsapp, member.name)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-600 hover:text-green-700"
                  >
                    <MessageCircle size={14} />
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
