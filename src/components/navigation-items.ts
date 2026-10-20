import { texts } from "@/texts";
import {
  BookOpen,
  Bookmark,
  Briefcase,
  Building2,
  Calendar,
  Compass,
  GraduationCap,
  Gamepad2,
  Home,
  Joystick,
  MessageCircle,
  Users,
  UsersRound,
} from "lucide-react";

export const navigationItems = [
  { to: "/feed", label: texts.navigation.items.feed, icon: Home },
  { to: "/rede", label: texts.navigation.items.network, icon: Users },
  { to: "/comunidades", label: texts.navigation.items.communities, icon: Compass },
  { to: "/grupos", label: texts.navigation.items.groups, icon: UsersRound },
  { to: "/mensagens", label: texts.navigation.items.messages, icon: MessageCircle },
  { to: "/salvos", label: texts.navigation.items.saved, icon: Bookmark },
  { to: "/blogs", label: texts.navigation.items.blogs, icon: BookOpen },
  { to: "/vagas", label: texts.navigation.items.jobs, icon: Briefcase },
  { to: "/empresas", label: texts.navigation.items.companies, icon: Building2 },
  { to: "/mentoria", label: texts.navigation.items.mentoring, icon: GraduationCap },
  { to: "/eventos", label: texts.navigation.items.events, icon: Calendar },
  { to: "/jogos-diarios", label: "Jogos diários", icon: Gamepad2 },
  { to: "/games", label: "Jogos da comunidade", icon: Joystick },
];

