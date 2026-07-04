import { useState } from 'react';
import { Star, Calendar, CheckCircle, X, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AppShell, Avatar } from '../../components/AppShell';
import { mentorsApi } from '../../lib/api/mentors';
import { profileApi } from '../../lib/api/profile';
import { messagesApi } from '../../lib/api/messages';

interface Mentor {
  id: string;
  name: string;
  headline: string;
  avatar: string | null;
  expertise: string[];
  rating: number;
  sessions: number;
  price: string;
  nextSlot: string | null;
  verified: boolean;
}

/* ── Modal Tornar-se mentor ──────────────────────── */
function BecomeMentorModal({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient();
  const [specialties, setSpecialties] = useState('');
  const [price, setPrice] = useState('');

  const createMut = useMutation({
    mutationFn: () => mentorsApi.create({
      expertise: specialties.split(',').map(s => s.trim()).filter(Boolean),
      price: price.trim() || 'R$ 0,00',
    }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['mentors-enriched'] }); onClose(); },
  });

  const inputCls =
    'w-full rounded-xl border border-[#E5E0EB] bg-white px-4 py-3 text-[14px] font-light text-[#0f0f14] placeholder:text-[#9CA3AF] outline-none transition focus:border-[#7C3AED]';
  const labelCls = 'mb-1.5 block text-[13px] font-light text-[#0f0f14]';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-[#E5E0EB] bg-white shadow-2xl">
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <h2 className="text-[18px] font-light text-[#0f0f14]">Tornar-se mentor</h2>
          <button
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-full text-[#9CA3AF] transition hover:bg-[#F5F3FF] hover:text-[#6B7280]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="space-y-4 px-6 pb-6">
          <div>
            <label htmlFor="mentor-specialties" className={labelCls}>Especialidades (separadas por vírgula)</label>
            <input id="mentor-specialties" value={specialties} onChange={e => setSpecialties(e.target.value)} placeholder="Java, Spring, React" className={inputCls} />
          </div>
          <div>
            <label htmlFor="mentor-price" className={labelCls}>Investimento</label>
            <input id="mentor-price" value={price} onChange={e => setPrice(e.target.value)} placeholder="R$ 0,00" className={inputCls} />
          </div>
          <button
            onClick={() => createMut.mutate()}
            disabled={!specialties.trim() || createMut.isPending}
            className="mt-2 w-full rounded-full bg-[#7C3AED] py-3 text-[14px] font-light text-white transition hover:bg-[#6D28D9] disabled:opacity-40"
          >
            {createMut.isPending ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Card de mentor ──────────────────────────────── */
function MentorCard({ mentor }: { mentor: Mentor }) {
  const navigate = useNavigate();
  const [scheduled, setScheduled] = useState(false);

  const bookMut = useMutation({
    mutationFn: () => mentorsApi.bookSession(mentor.id, '', `Olá, ${mentor.name}! Tenho interesse em agendar uma sessão de mentoria com você.`),
  });

  const handleSchedule = async () => {
    setScheduled(true);
    bookMut.mutate();

    try {
      const conv = await messagesApi.createConversation({
        kind: 'DIRECT',
        title: mentor.name,
        participantIds: [mentor.id],
      });
      const text = `Olá, ${mentor.name}! Tenho interesse em agendar uma sessão de mentoria com você. Quais são os seus horários disponíveis?`;
      await messagesApi.sendMessage(conv.id, text).catch(() => {});
      localStorage.setItem('pending_open_conv', conv.id);
    } catch {}

    setTimeout(() => navigate('/mensagens'), 400);
  };

  const formatSlot = (iso: string) =>
    new Date(iso).toLocaleDateString('pt-BR', {
      day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
    });

  return (
    <div className="flex h-full flex-col items-center rounded-2xl border border-[#E5E0EB] bg-white p-5 text-center transition hover:shadow-sm">

      {/* 1. Avatar — h-16 w-16, tamanho fixo */}
      <Avatar src={mentor.avatar} name={mentor.name} size="xl" />

      {/* 2. Nome — h-6 (24 px), uma linha, overflow oculto */}
      <div
        className="mt-3 flex w-full items-center justify-center gap-1.5 overflow-hidden"
        style={{ height: '24px', flexShrink: 0 }}
      >
        <p className="truncate text-[14px] font-light text-[#0f0f14]">{mentor.name}</p>
        {mentor.verified && <CheckCircle className="h-3.5 w-3.5 shrink-0 text-[#7C3AED]" />}
      </div>

      {/* 3. Descrição — 36 px exatos = 2 × (12 px × line-height 1.5), overflow oculto */}
      <div
        className="mt-1 w-full overflow-hidden"
        style={{ height: '36px', flexShrink: 0 }}
      >
        <p className="line-clamp-2 w-full text-center text-[12px] leading-4.5 text-[#9CA3AF]">
          {mentor.headline}
        </p>
      </div>

      {/* 4. Tags — 52 px exatos = 2 × chip (≈24 px) + gap (4 px), overflow oculto */}
      <div
        className="mt-3 flex w-full flex-wrap content-start justify-center gap-1 overflow-hidden"
        style={{ height: '52px', flexShrink: 0 }}
      >
        {mentor.expertise.slice(0, 3).map(e => (
          <span key={e} className="rounded-full bg-[#EDE8F5] px-2.5 py-0.5 text-[11px] font-light text-[#7C3AED]">
            {e}
          </span>
        ))}
        {mentor.expertise.length > 3 && (
          <span className="rounded-full bg-[#EDE8F5] px-2.5 py-0.5 text-[11px] font-light text-[#7C3AED]">
            +{mentor.expertise.length - 3}
          </span>
        )}
      </div>

      {/* Stats — separador sempre na mesma posição */}
      <div className="mt-4 w-full border-t border-[#F5F3FF] pt-4">
        <div className="grid grid-cols-2 gap-y-3 text-[12px]">
          <div className="flex flex-col items-center gap-0.5">
            <p className="text-[#9CA3AF]">Avaliação</p>
            <p className="flex items-center gap-1 font-light text-[#0f0f14]">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              {mentor.rating.toFixed(1)}
            </p>
          </div>
          <div className="flex flex-col items-center gap-0.5">
            <p className="text-[#9CA3AF]">Sessões</p>
            <p className="font-light text-[#0f0f14]">{mentor.sessions}</p>
          </div>
          <div className="flex flex-col items-center gap-0.5">
            <p className="text-[#9CA3AF]">Investimento</p>
            <p className="font-light text-[#0f0f14]">{mentor.price}</p>
          </div>
          <div className="flex flex-col items-center gap-0.5">
            <p className="text-[#9CA3AF]">Próxima vaga</p>
            {mentor.nextSlot ? (
              <p className="flex items-center gap-1 font-light text-[#0f0f14]">
                <Calendar className="h-3 w-3 text-[#7C3AED]" />
                {formatSlot(mentor.nextSlot)}
              </p>
            ) : (
              <p className="text-[#9CA3AF]">—</p>
            )}
          </div>
        </div>
      </div>

      {/* CTA */}
      <button
        onClick={handleSchedule}
        disabled={scheduled}
        className={`mt-4 w-full rounded-full py-2.5 text-[13px] font-light transition ${
          scheduled
            ? 'cursor-default bg-[#EDE8F5] text-[#7C3AED]'
            : 'bg-[#7C3AED] text-white hover:bg-[#6D28D9]'
        }`}
      >
        {scheduled ? '✓ Sessão agendada' : 'Agendar sessão'}
      </button>
    </div>
  );
}

/* ── Página principal ────────────────────────────── */
export function MentoriaPage() {
  const [filter, setFilter] = useState<'todos' | 'gratuito' | 'pago'>('todos');
  const [becomeMentor, setBecomeMentor] = useState(false);

  const { data: mentors = [], isLoading } = useQuery({
    queryKey: ['mentors-enriched'],
    queryFn: async (): Promise<Mentor[]> => {
      const res = await mentorsApi.list();
      const profiles = await Promise.all(
        res.items.map(m => profileApi.getById(m.userId).catch(() => null)),
      );
      return res.items.map((m, i) => ({
        id: m.id,
        name: profiles[i]?.name ?? `Mentor ${m.userId.slice(0, 6)}`,
        headline: profiles[i]?.headline ?? (m.expertise[0] ?? 'Mentor'),
        avatar: profiles[i]?.avatar ?? null,
        expertise: m.expertise,
        rating: m.rating,
        sessions: m.sessions,
        price: m.price,
        nextSlot: m.nextSlot ?? null,
        verified: false,
      }));
    },
  });

  const filtered = mentors.filter(m => {
    if (filter === 'gratuito') return m.price === 'R$ 0,00' || m.price === '0';
    if (filter === 'pago') return m.price !== 'R$ 0,00' && m.price !== '0';
    return true;
  });

  return (
    <AppShell>
      {becomeMentor && <BecomeMentorModal onClose={() => setBecomeMentor(false)} />}

      <div className="space-y-6">
        {/* Hero */}
        <div
          className="relative overflow-hidden rounded-2xl p-8"
          style={{ background: 'linear-gradient(135deg, #0d0d18 0%, #1e1040 50%, #2d1f4e 100%)' }}
        >
          <div
            className="pointer-events-none absolute inset-0"
            style={{ background: 'radial-gradient(ellipse at top right, rgba(124,58,237,0.25), transparent 60%)' }}
          />
          <div className="relative z-10">
            <h1 className="max-w-lg text-[28px] font-light leading-tight tracking-tight text-white">
              Aprenda com quem já passou por onde você quer chegar.
            </h1>
            <p className="mt-2 max-w-xl text-[14px] font-light leading-relaxed text-white/60">
              Sessões reais com mentores verificados — sem performance, sem ruído. Avaliações honestas e agendamento em um clique.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={() => document.getElementById('mentores')?.scrollIntoView({ behavior: 'smooth' })}
                className="rounded-full bg-[#7C3AED] px-5 py-2.5 text-[14px] font-light text-white transition hover:bg-[#6D28D9]"
              >
                Encontrar mentor
              </button>
              <button
                onClick={() => setBecomeMentor(true)}
                className="rounded-full border border-white/20 bg-white/10 px-5 py-2.5 text-[14px] font-light text-white backdrop-blur-sm transition hover:bg-white/20"
              >
                Tornar-me mentor
              </button>
            </div>
          </div>
        </div>

        {/* Lista de mentores */}
        <div id="mentores">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-[18px] font-light text-[#0f0f14]">Mentores em destaque</h2>
              <p className="text-[13px] text-[#6B7280]">Avaliados pela comunidade nas últimas 8 semanas.</p>
            </div>
            <div className="flex gap-1.5">
              {([
                { key: 'todos', label: 'Todos' },
                { key: 'gratuito', label: 'Gratuito' },
                { key: 'pago', label: 'Pago' },
              ] as const).map(f => (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  className={`rounded-full border px-3 py-1 text-[12px] font-light transition ${
                    filter === f.key
                      ? 'border-[#7C3AED] bg-[#7C3AED] text-white'
                      : 'border-[#E5E0EB] bg-white text-[#6B7280] hover:border-[#7C3AED] hover:text-[#7C3AED]'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-[#7C3AED]" />
            </div>
          )}
          {!isLoading && filtered.length === 0 && (
            <div className="rounded-2xl border border-[#E5E0EB] bg-white px-6 py-12 text-center">
              <p className="text-[14px] font-light text-[#9CA3AF]">Nenhum mentor encontrado com esse filtro.</p>
            </div>
          )}
          {!isLoading && filtered.length > 0 && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map(mentor => (
                <MentorCard key={mentor.id} mentor={mentor} />
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
