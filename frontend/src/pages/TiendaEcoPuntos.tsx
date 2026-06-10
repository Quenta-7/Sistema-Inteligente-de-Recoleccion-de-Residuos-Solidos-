import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  BadgeCheck,
  Bike,
  Gift,
  Home,
  MapPin,
  Sparkles,
  ShoppingBag,
  Shirt,
  Star,
  Ticket,
  TrendingUp,
  Sun,
  Moon
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { authedFetch } from '../api';

type Categoria = {
  label: string;
  tone: string;
  icon: React.ElementType;
};

type Producto = {
  nombre: string;
  descripcion: string;
  puntos: number;
  categoria: string;
  badge?: string;
  cover: string;
  icon: React.ElementType;
};

type Historial = {
  titulo: string;
  fecha: string;
  puntos: number;
  estado: string;
};

const categorias: Categoria[] = [
  { label: 'Movilidad', tone: 'bg-emerald-100 text-emerald-700', icon: Bike },
  { label: 'Hogar', tone: 'bg-teal-100 text-teal-700', icon: Home },
  { label: 'EcoModa', tone: 'bg-lime-100 text-lime-700', icon: Shirt },
  { label: 'Experiencias', tone: 'bg-amber-100 text-amber-700', icon: MapPin },
];

const productos: Producto[] = [
  {
    nombre: 'Botella termica reutilizable',
    descripcion: 'Acero inoxidable, 750 ml con aislante.',
    puntos: 280,
    categoria: 'Hogar',
    badge: 'Nuevo',
    cover: 'bg-gradient-to-br from-emerald-100 via-white to-teal-100',
    icon: Gift,
  },
  {
    nombre: 'Bono para transporte urbano',
    descripcion: 'Recarga digital para bus o corredor.',
    puntos: 420,
    categoria: 'Movilidad',
    badge: 'Top',
    cover: 'bg-gradient-to-br from-amber-100 via-white to-rose-100',
    icon: Ticket,
  },
  {
    nombre: 'Kit de compostaje en casa',
    descripcion: 'Incluye guia practica y mini compostera.',
    puntos: 650,
    categoria: 'Hogar',
    cover: 'bg-gradient-to-br from-lime-100 via-white to-emerald-100',
    icon: Sparkles,
  },
  {
    nombre: 'Tote bag de algodon organico',
    descripcion: 'Bolsa reforzada para compras sin plastico.',
    puntos: 220,
    categoria: 'EcoModa',
    cover: 'bg-gradient-to-br from-teal-100 via-white to-cyan-100',
    icon: ShoppingBag,
  },
  {
    nombre: 'Entrada a ruta verde guiada',
    descripcion: 'Experiencia local con enfoque ambiental.',
    puntos: 780,
    categoria: 'Experiencias',
    badge: 'Limitado',
    cover: 'bg-gradient-to-br from-amber-100 via-white to-yellow-100',
    icon: MapPin,
  },
  {
    nombre: 'Pack de semillas nativas',
    descripcion: 'Variedades andinas para tu huerto urbano.',
    puntos: 180,
    categoria: 'Hogar',
    cover: 'bg-gradient-to-br from-emerald-100 via-white to-lime-100',
    icon: Star,
  },
];

const historial: Historial[] = [
  {
    titulo: 'Tote bag de algodon organico',
    fecha: '10 May 2026',
    puntos: 220,
    estado: 'Entregado',
  },
  {
    titulo: 'Bono para transporte urbano',
    fecha: '02 May 2026',
    puntos: 420,
    estado: 'En proceso',
  },
  {
    titulo: 'Pack de semillas nativas',
    fecha: '21 Abr 2026',
    puntos: 180,
    estado: 'Entregado',
  },
];

const TiendaEcoPuntos = () => {
  const [ecopuntos, setEcopuntos] = useState(0);
  const [loadingPerfil, setLoadingPerfil] = useState(true);
  const [theme, setThemeState] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('color-theme') as 'light' | 'dark') || 'light';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setThemeState(nextTheme);
    localStorage.setItem('color-theme', nextTheme);
  };

  useEffect(() => {
    const cargarPerfil = async () => {
      try {
        setLoadingPerfil(true);
        const response = await authedFetch('/api/perfil/');
        if (response.ok) {
          const data = await response.json();
          setEcopuntos(data.user.ecopuntos || 0);
        }
      } catch (error) {
        console.error('Error cargando perfil:', error);
      } finally {
        setLoadingPerfil(false);
      }
    };

    cargarPerfil();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <div className="relative overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(circle at 10% 20%, rgba(16, 185, 129, 0.2), transparent 40%), radial-gradient(circle at 90% 10%, rgba(14, 116, 144, 0.2), transparent 45%), radial-gradient(circle at 50% 80%, rgba(251, 191, 36, 0.15), transparent 50%)',
          }}
        ></div>
        <div className="absolute -top-16 -right-20 h-64 w-64 rounded-full bg-emerald-200/40 dark:bg-emerald-950/20 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-teal-200/40 dark:bg-teal-950/20 blur-3xl"></div>

        <header className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-6">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex-1">
              <div className="flex justify-between items-center w-full">
                <Link
                  to="/dashboard"
                  className="inline-flex items-center text-sm font-semibold text-emerald-700 hover:text-emerald-650 dark:text-emerald-450 dark:hover:text-emerald-350 bg-emerald-500/10 dark:bg-emerald-950/40 px-4 py-2 rounded-full border border-emerald-500/10 dark:border-emerald-500/20"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Volver al dashboard
                </Link>
                
                <button
                  onClick={toggleTheme}
                  className="p-2 text-slate-500 dark:text-slate-350 hover:text-amber-500 transition-colors bg-white dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm"
                  title={theme === 'light' ? 'Modo Oscuro' : 'Modo Claro'}
                >
                  {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5 text-amber-400" />}
                </button>
              </div>
              <h1 className="mt-4 text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                Tienda EcoPuntos
              </h1>
              <p className="mt-3 text-base md:text-lg text-slate-600 dark:text-slate-400 max-w-2xl">
                Canjea tus EcoPuntos por artículos sostenibles, experiencias locales y
                beneficios que multiplican tu impacto.
              </p>
            </div>
            <div className="glass-card rounded-2xl px-6 py-4 flex items-center gap-4 w-full md:w-auto transition-colors duration-300">
              <div className="h-12 w-12 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
                <TrendingUp className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                  Tu saldo actual
                </p>
                <p className="text-3xl font-black text-slate-900 dark:text-white mt-1">
                  {loadingPerfil ? '...' : ecopuntos.toLocaleString()}
                </p>
                <p className="text-xs text-slate-500">Nivel Verde: Explorador</p>
              </div>
            </div>
          </div>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="glass-card rounded-2xl p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500">Puntos en transito</p>
                  <p className="text-2xl font-bold text-slate-900">+140</p>
                </div>
                <BadgeCheck className="h-10 w-10 text-emerald-500" />
              </div>
              <p className="mt-3 text-sm text-slate-500">Se acreditan al validar evidencias.</p>
            </div>
            <div className="glass-card rounded-2xl p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500">Siguiente recompensa</p>
                  <p className="text-2xl font-bold text-slate-900">1,500</p>
                </div>
                <Star className="h-10 w-10 text-amber-500" />
              </div>
              <div className="mt-4">
                <div className="h-2 w-full rounded-full bg-emerald-100">
                  <div className="h-2 rounded-full bg-emerald-500 w-[83%]"></div>
                </div>
                <p className="text-xs text-slate-500 mt-2">Te faltan 250 pts para el nivel Pro.</p>
              </div>
            </div>
            <div className="glass-card rounded-2xl p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Recompensas canjeadas</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">12</p>
                </div>
                <Gift className="h-10 w-10 text-rose-500" />
              </div>
              <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">Tu historial se actualiza en tiempo real.</p>
            </div>
          </div>
        </header>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <section className="mt-6 flex flex-wrap gap-3">
          {categorias.map((categoria) => {
            const Icon = categoria.icon;
            return (
              <button
                key={categoria.label}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${categoria.tone}`}
              >
                <Icon className="h-4 w-4" />
                {categoria.label}
              </button>
            );
          })}
        </section>

        <section className="mt-10 grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-8">
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Catálogo destacado</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Productos curados para tu estilo de vida sostenible.</p>
              </div>
              <button className="hidden md:inline-flex items-center gap-2 text-sm font-semibold text-emerald-600 hover:text-emerald-500 dark:text-emerald-400 dark:hover:text-emerald-300">
                Ver todo
                <ArrowLeft className="h-4 w-4 rotate-180" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {productos.map((producto) => {
                const Icon = producto.icon;
                return (
                  <div key={producto.nombre} className="glass-card rounded-3xl p-5 flex flex-col">
                    <div className={`h-36 rounded-2xl flex items-center justify-center ${producto.cover}`}>
                      <Icon className="h-14 w-14 text-emerald-700 dark:text-emerald-950" />
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-xs font-semibold uppercase text-emerald-600 dark:text-emerald-400">{producto.categoria}</span>
                      {producto.badge && (
                        <span className="text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-2 py-1 rounded-full">
                          {producto.badge}
                        </span>
                      )}
                    </div>
                    <h3 className="mt-2 text-lg font-bold text-slate-900 dark:text-white">{producto.nombre}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{producto.descripcion}</p>
                    <div className="mt-5 flex items-center justify-between">
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Costo</p>
                        <p className="text-lg font-extrabold text-slate-900 dark:text-white">{producto.puntos} pts</p>
                      </div>
                      <button className="px-4 py-2 rounded-full text-sm font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-all">
                        Canjear
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-6">
            <div className="glass-card rounded-3xl p-6">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
                  <Sparkles className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs uppercase font-semibold text-slate-500 dark:text-slate-400">Recompensa del mes</p>
                  <p className="text-lg font-bold text-slate-900 dark:text-white">Kit compostaje urbano</p>
                </div>
              </div>
              <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                Incluye mini compostera, guía rápida y seguimiento en la app.
              </p>
              <div className="mt-4 flex items-center justify-between">
                <p className="text-xl font-black text-emerald-600 dark:text-emerald-450">650 pts</p>
                <button className="px-4 py-2 rounded-full text-sm font-semibold border border-emerald-200 dark:border-slate-800 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-slate-800 transition-all">
                  Ver detalle
                </button>
              </div>
            </div>

            <div className="glass-card rounded-3xl p-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Tu nivel verde</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Explorador • {ecopuntos.toLocaleString()} pts acumulados</p>
              <div className="mt-4">
                <div className="h-2 w-full rounded-full bg-emerald-100 dark:bg-emerald-950/40">
                  <div
                    className="h-2 rounded-full bg-emerald-500"
                    style={{ width: `${Math.min((ecopuntos / 1500) * 100, 100)}%` }}
                  ></div>
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span>Explorador</span>
                  <span>Pro (1,500 pts)</span>
                </div>
              </div>
              <div className="mt-5 flex items-center gap-2 text-sm text-emerald-700 dark:text-emerald-400">
                <BadgeCheck className="h-5 w-5" />
                Acceso a recompensas premium
              </div>
            </div>

            <div className="glass-card rounded-3xl p-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Retos activos</h3>
              <div className="mt-4 space-y-3">
                <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">Recicla 3 kg esta semana</p>
                  <p className="text-xs text-slate-500 dark:text-slate-450">Gana +60 pts</p>
                </div>
                <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/20">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">Sube 2 evidencias verificadas</p>
                  <p className="text-xs text-slate-500 dark:text-slate-450">Gana +80 pts</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card rounded-3xl p-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Cómo funciona</h3>
            <div className="mt-4 space-y-4 text-sm text-slate-600 dark:text-slate-350">
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold">1</div>
                <p>Sube evidencias y acumula EcoPuntos validados.</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold">2</div>
                <p>Explora el catálogo y elige la recompensa que deseas.</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold">3</div>
                <p>Canjea y recibe notificaciones sobre el estado de entrega.</p>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-3xl p-6 md:col-span-2">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Historial de canjes</h3>
              <button className="text-sm font-semibold text-emerald-600 hover:text-emerald-500 dark:text-emerald-400 dark:hover:text-emerald-350">Ver todo</button>
            </div>
            <div className="mt-4 space-y-3">
              {historial.map((item) => (
                <div key={item.titulo} className="flex items-center justify-between border border-slate-100 dark:border-slate-800 rounded-2xl px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{item.titulo}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{item.fecha}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-900 dark:text-white">-{item.puntos} pts</p>
                    <p className="text-xs text-emerald-600 dark:text-emerald-450">{item.estado}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-12 glass-card rounded-3xl p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-450 flex items-center justify-center">
              <ShoppingBag className="h-7 w-7" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Nuevos aliados verdes</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Marcas locales se suman cada mes con recompensas exclusivas.
              </p>
            </div>
          </div>
          <button className="px-6 py-3 rounded-full text-sm font-semibold bg-slate-900 dark:bg-white text-white dark:text-slate-950 hover:bg-slate-800 dark:hover:bg-slate-105 transition-all">
            Explorar convenios
          </button>
        </section>
      </main>
    </div>
  );
};

export default TiendaEcoPuntos;