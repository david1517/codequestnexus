import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, Sparkles, Trophy, Code2, Cpu, ArrowRight, Github, Star } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ParticleBackground } from '@/components/effects/ParticleBackground';
import { GlitchText } from '@/components/effects/GlitchText';
import { PLANETS } from '@/constants/planets';

export function Landing() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-bg-primary text-white">
      <ParticleBackground />

      {/* Navbar */}
      <nav className="relative z-10 border-b border-white/5 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-neon-blue to-neon-purple blur-md" />
              <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-neon-blue to-neon-purple">
                <Zap className="h-5 w-5 text-white" fill="white" />
              </div>
            </div>
            <div>
              <h1 className="font-display text-base font-black leading-none tracking-wide">
                CODEQUEST
              </h1>
              <p className="font-display text-[10px] font-bold tracking-[0.3em] text-neon-blue">
                NEXUS
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/auth/login">
              <Button variant="ghost" size="sm">
                Entrar
              </Button>
            </Link>
            <Link to="/auth/register">
              <Button variant="primary" size="sm" glow>
                Começar grátis
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 px-4 pt-20 pb-32 md:px-6">
        <div className="mx-auto max-w-5xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Badge rarity="legendary" variant="glass" size="md" className="mb-6">
              <Star className="h-3 w-3" />
              ACADEMIA FUTURISTA DE PROGRAMADORES
            </Badge>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-display text-5xl font-black leading-[1.1] tracking-tight md:text-7xl lg:text-8xl"
          >
            Torne-se uma
            <br />
            <GlitchText
              text="LENDA DO CÓDIGO"
              className="text-gradient text-6xl md:text-8xl lg:text-9xl"
            />
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mx-auto mt-6 max-w-2xl text-lg text-gray-400 md:text-xl"
          >
            Aprenda programação explorando galáxias. Cada linguagem é um planeta.
            <br className="hidden md:block" />
            Cada lição, uma evolução. Bem-vindo ao nexus.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <Link to="/auth/register">
              <Button size="xl" glow rightIcon={<ArrowRight className="h-5 w-5" />}>
                Iniciar Jornada
              </Button>
            </Link>
            <Button size="xl" variant="outline">
              <Github className="mr-2 h-5 w-5" />
              Ver no GitHub
            </Button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="mx-auto mt-16 grid max-w-3xl grid-cols-3 gap-4"
          >
            {[
              { v: '10', l: 'Planetas' },
              { v: '500+', l: 'Lições' },
              { v: '50K+', l: 'Coders' },
            ].map((s, i) => (
              <div key={i} className="text-center">
                <p className="font-display text-3xl font-black text-gradient md:text-5xl">
                  {s.v}
                </p>
                <p className="mt-1 text-xs font-display uppercase tracking-widest text-gray-500 md:text-sm">
                  {s.l}
                </p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 px-4 py-20 md:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <h2 className="font-display text-4xl font-black md:text-5xl">
              <span className="text-gradient">RECURSOS</span> DE ELITE
            </h2>
            <p className="mt-4 text-gray-400">Tudo que você precisa para evoluir</p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                icon: Sparkles,
                title: 'IA Tutora',
                desc: 'NEXUS AI explica, corrige e sugere em tempo real.',
                color: 'blue' as const,
              },
              {
                icon: Trophy,
                title: 'Gamificação',
                desc: 'XP, níveis, classes, conquistas e loot boxes.',
                color: 'gold' as const,
              },
              {
                icon: Code2,
                title: 'Editor AAA',
                desc: 'Editor estilo VS Code com execução no navegador.',
                color: 'purple' as const,
              },
            ].map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card variant="glass" hoverable className="p-6 h-full">
                  <div
                    className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-neon-${f.color}/10 text-neon-${f.color}`}
                  >
                    <f.icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-display text-xl font-bold">{f.title}</h3>
                  <p className="mt-2 text-sm text-gray-400">{f.desc}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Planets Preview */}
      <section className="relative z-10 px-4 py-20 md:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <h2 className="font-display text-4xl font-black md:text-5xl">
              EXPLORE A <span className="text-gradient">GALÁXIA</span>
            </h2>
            <p className="mt-4 text-gray-400">10 planetas. 10 linguagens. Infinitas possibilidades.</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {PLANETS.map((planet, i) => (
              <motion.div
                key={planet.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ y: -8 }}
              >
                <Card
                  className="p-4 h-full border-white/5 hover:border-white/20"
                  style={{ backgroundColor: `${planet.color}08` }}
                >
                  <div
                    className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl text-2xl"
                    style={{
                      backgroundColor: `${planet.color}20`,
                      boxShadow: `0 0 20px ${planet.color}40`,
                    }}
                  >
                    {planet.icon}
                  </div>
                  <h3 className="font-display text-sm font-bold" style={{ color: planet.color }}>
                    {planet.name}
                  </h3>
                  <p className="mt-1 text-[10px] text-gray-500">{planet.planetName}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 px-4 py-20 md:px-6">
        <div className="mx-auto max-w-4xl">
          <Card variant="neon" className="p-12 text-center">
            <Cpu className="mx-auto mb-4 h-12 w-12 text-neon-blue" />
            <h2 className="font-display text-3xl font-black md:text-5xl">
              Pronto para a <span className="text-gradient">evolução</span>?
            </h2>
            <p className="mt-4 text-gray-400">
              Junte-se a milhares de coders que estão dominando o multiverso.
            </p>
            <Link to="/auth/register">
              <Button size="xl" className="mt-8" glow rightIcon={<ArrowRight className="h-5 w-5" />}>
                Criar Conta Grátis
              </Button>
            </Link>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-8 text-center text-sm text-gray-500">
        <p>© 2026 CodeQuest Nexus. Feito com ⚡ para a próxima geração de devs.</p>
      </footer>
    </div>
  );
}
