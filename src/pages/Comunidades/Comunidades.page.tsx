import { useState } from 'react';
import { Plus, Users, Loader2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AppShell } from '../../components/AppShell';
import { useNotifications } from '../../contexts/NotificationsContext';
import { useConfirm } from '../../contexts/ConfirmContext';
import { communitiesApi } from '../../lib/api/communities';
import type { Community } from '../../lib/api/communities';

type CategoryFilter = 'Todas' | string;

const CATEGORIES: CategoryFilter[] = [
  'Todas', 'Tecnologia', 'Engenharia', 'Design', 'Produto', 'Liderança', 'Carreira', 'Freelance',
];

const CATEGORY_COLOR: Record<string, string> = {
  Tecnologia: 'text-[#7C3AED]',
  Engenharia: 'text-[#2563EB]',
  Design: 'text-[#0D9488]',
  Produto: 'text-[#059669]',
  Liderança: 'text-[#E11D48]',
  Carreira: 'text-[#D97706]',
  Freelance: 'text-[#4F46E5]',
};

const COVER_GRADIENT: Record<string, string> = {
  Tecnologia: 'linear-gradient(135deg, #2e1065 0%, #7C3AED 100%)',
  Engenharia: 'linear-gradient(135deg, #1e3a5f 0%, #2563EB 100%)',
  Design: 'linear-gradient(135deg, #0f4c5c 0%, #0D9488 100%)',
  Produto: 'linear-gradient(135deg, #064e3b 0%, #059669 100%)',
  Liderança: 'linear-gradient(135deg, #7f1d1d 0%, #E11D48 100%)',
  Carreira: 'linear-gradient(135deg, #78350f 0%, #D97706 100%)',
  Freelance: 'linear-gradient(135deg, #312e81 0%, #4F46E5 100%)',
};

const TOPIC_ICON: Record<string, string> = {
  Tecnologia: '💻', Engenharia: '🔧', Design: '🎨', Produto: '📦',
  Liderança: '🚀', Carreira: '🏛️', Freelance: '💼',
};

function coverFor(c: Community): string {
  if (c.cover) return '';
  return COVER_GRADIENT[c.topic] ?? 'linear-gradient(135deg, #3B1E7A 0%, #7C3AED 100%)';
}

export function ComunidadesPage() {
  const { add: addNotif } = useNotifications();
  const { confirm } = useConfirm();
  const qc = useQueryClient();

  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('Tecnologia');
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newTopic, setNewTopic] = useState('Tecnologia');

  const { data, isLoading } = useQuery({
    queryKey: ['communities', activeCategory],
    queryFn: () => communitiesApi.list(activeCategory === 'Todas' ? undefined : activeCategory),
  });

  const joinMut = useMutation({
    mutationFn: (id: string) => communitiesApi.join(id),
    onSuccess: (_, id) => {
      const c = data?.items.find(x => x.id === id);
      if (c) addNotif(`Você entrou na comunidade "${c.name}".`, 'community');
      qc.invalidateQueries({ queryKey: ['communities'] });
    },
  });

  const leaveMut = useMutation({
    mutationFn: (id: string) => communitiesApi.leave(id),
    onSuccess: (_, id) => {
      const c = data?.items.find(x => x.id === id);
      if (c) addNotif(`Você saiu da comunidade "${c.name}".`, 'community');
      qc.invalidateQueries({ queryKey: ['communities'] });
    },
  });

  const createMut = useMutation({
    mutationFn: () => communitiesApi.create({ name: newName.trim(), description: newDesc.trim(), topic: newTopic }),
    onSuccess: () => {
      setShowCreate(false);
      setNewName(''); setNewDesc('');
      qc.invalidateQueries({ queryKey: ['communities'] });
    },
  });

  const handleToggle = (c: Community) => {
    if (c.joined) {
      confirm({
        title: 'Sair da comunidade',
        message: `Tem certeza que quer sair de "${c.name}"?`,
        confirmLabel: 'Sair',
        variant: 'danger',
        onConfirm: async () => leaveMut.mutate(c.id),
      });
    } else {
      joinMut.mutate(c.id);
    }
  };

  const communities = data?.items ?? [];

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Cabeçalho */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-[26px] font-light text-[#0f0f14] dark:text-[#e8e6ff]">Comunidades</h1>
            <p className="mt-0.5 text-[14px] font-light text-[#6B7280] dark:text-[#9CA3AF]">
              Encontre grupos profissionais, fóruns temáticos e círculos de mentoria.
            </p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="flex shrink-0 items-center gap-2 rounded-full bg-[#7C3AED] px-4 py-2 text-[14px] font-light text-white transition hover:bg-[#6D28D9]"
          >
            <Plus className="h-4 w-4" />
            Criar comunidade
          </button>
        </div>

        {/* Modal criar */}
        {showCreate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl border border-[#E5E0EB] bg-white p-6 shadow-2xl dark:border-[#2a2a3d] dark:bg-[#1c1c2e]">
              <h2 className="mb-4 text-[17px] font-light text-[#0f0f14] dark:text-[#e8e6ff]">Criar comunidade</h2>
              <div className="space-y-3">
                <input
                  value={newName} onChange={e => setNewName(e.target.value)}
                  placeholder="Nome da comunidade"
                  className="w-full rounded-xl border border-[#E5E0EB] bg-[#F9F8FF] px-4 py-2.5 text-[13px] text-[#0f0f14] placeholder:text-[#9CA3AF] outline-none focus:border-[#7C3AED] dark:border-[#2a2a3d] dark:bg-[#13131f] dark:text-[#e8e6ff]"
                />
                <textarea
                  value={newDesc} onChange={e => setNewDesc(e.target.value)}
                  placeholder="Descrição"
                  rows={3}
                  className="w-full resize-none rounded-xl border border-[#E5E0EB] bg-[#F9F8FF] px-4 py-2.5 text-[13px] text-[#0f0f14] placeholder:text-[#9CA3AF] outline-none focus:border-[#7C3AED] dark:border-[#2a2a3d] dark:bg-[#13131f] dark:text-[#e8e6ff]"
                />
                <select
                  value={newTopic} onChange={e => setNewTopic(e.target.value)}
                  className="w-full rounded-xl border border-[#E5E0EB] bg-[#F9F8FF] px-4 py-2.5 text-[13px] text-[#0f0f14] outline-none focus:border-[#7C3AED] dark:border-[#2a2a3d] dark:bg-[#13131f] dark:text-[#e8e6ff]"
                >
                  {CATEGORIES.filter(c => c !== 'Todas').map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="mt-4 flex justify-end gap-2">
                <button onClick={() => setShowCreate(false)} className="rounded-full border border-[#E5E0EB] px-4 py-2 text-[13px] font-light text-[#6B7280] dark:border-[#2a2a3d] dark:text-[#9CA3AF]">
                  Cancelar
                </button>
                <button
                  onClick={() => createMut.mutate()}
                  disabled={!newName.trim() || createMut.isPending}
                  className="rounded-full bg-[#7C3AED] px-4 py-2 text-[13px] font-light text-white disabled:opacity-40"
                >
                  Criar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Filtros */}
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`rounded-full border px-4 py-1.5 text-[13px] font-light transition ${
                activeCategory === cat
                  ? 'border-[#7C3AED] bg-[#7C3AED] text-white'
                  : 'border-[#E5E0EB] bg-white text-[#6B7280] hover:border-[#7C3AED] hover:text-[#7C3AED] dark:border-[#2a2a3d] dark:bg-transparent dark:text-[#9CA3AF]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-[#7C3AED]" />
          </div>
        )}

        {/* Grid */}
        {!isLoading && communities.length === 0 && (
          <div className="rounded-2xl border border-[#E5E0EB] bg-white p-10 text-center dark:border-[#2a2a3d] dark:bg-[#13131f]">
            <Users className="mx-auto h-8 w-8 text-[#9CA3AF]" />
            <p className="mt-3 text-[14px] font-light text-[#9CA3AF]">Nenhuma comunidade encontrada.</p>
          </div>
        )}

        {!isLoading && communities.length > 0 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {communities.map(c => (
              <div key={c.id} className="flex flex-col overflow-hidden rounded-2xl border border-[#E5E0EB] bg-white transition hover:shadow-sm dark:border-[#2a2a3d] dark:bg-[#13131f]">
                <div
                  className="flex h-28 w-full items-center justify-center text-4xl"
                  style={
                    c.cover
                      ? { backgroundImage: `url(${c.cover})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                      : { background: coverFor(c) }
                  }
                >
                  {!c.cover && <span role="img" aria-hidden="true">{TOPIC_ICON[c.topic] ?? '💬'}</span>}
                </div>

                <div className="flex flex-1 flex-col p-4">
                  <div className="flex items-center gap-2">
                    <span className={`text-[11px] font-semibold tracking-wider ${CATEGORY_COLOR[c.topic] ?? 'text-[#7C3AED]'}`}>
                      {c.topic.toUpperCase()}
                    </span>
                  </div>
                  <p className="mt-1 line-clamp-1 text-[15px] font-medium text-[#0f0f14] dark:text-[#e8e6ff]">{c.name}</p>
                  <p className="mt-1 line-clamp-2 flex-1 text-[12px] font-light text-[#6B7280] dark:text-[#9CA3AF]">{c.description}</p>

                  <div className="mt-3 flex items-center justify-between">
                    <span className="flex items-center gap-1 text-[12px] text-[#9CA3AF]">
                      <Users className="h-3.5 w-3.5" />
                      {c.members} membros
                    </span>
                    <button
                      onClick={() => handleToggle(c)}
                      disabled={joinMut.isPending || leaveMut.isPending}
                      className={`rounded-full px-4 py-1.5 text-[12px] font-light transition disabled:opacity-50 ${
                        c.joined
                          ? 'bg-[#EDE8F5] text-[#7C3AED] hover:bg-red-50 hover:text-red-500 dark:bg-[#2a1a4e] dark:text-[#a78bfa]'
                          : 'bg-[#7C3AED] text-white hover:bg-[#6D28D9]'
                      }`}
                    >
                      {c.joined ? 'Participando' : 'Entrar'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
