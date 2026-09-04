import {
  Bookmark,
  Briefcase,
  Calendar,
  Compass,
  GraduationCap,
  Home,
  MessageCircle,
  Users,
} from "lucide-react";

export const nav = [
  { to: "/feed", label: "Início", icon: Home },
  { to: "/rede", label: "Rede", icon: Users },
  { to: "/comunidades", label: "Comunidades", icon: Compass },
  { to: "/mensagens", label: "Mensagens", icon: MessageCircle },
  { to: "/salvos", label: "Salvos", icon: Bookmark },
  { to: "/vagas", label: "Vagas", icon: Briefcase },
  { to: "/mentoria", label: "Mentoria", icon: GraduationCap },
  { to: "/eventos", label: "Eventos", icon: Calendar },
];
