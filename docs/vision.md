===============================================================================
                               ENGLISH VERSION
===============================================================================
Project Vision Document

**Reptile Haven — Idle Terrarium Management Game**
**Version:** 0.2 — Scope Confirmed
**Date:** July 2026
**Status:** Active

---

## Change Log

| Version | Date | Change |
|---------|------|--------|
| 0.1 | July 2026 | Initial vision document |
| 0.2 | July 2026 | MVP scope confirmed: single-player, no backend, LocalStorage. Social features deferred to Phase 2. Balancing principle added. |

---

1. Core Concept
Reptile Haven is an idle/management game where players collect, care for, and breed real reptile species in virtual terrariums. It combines the accessibility and addictive gameplay loop of Happy Aquarium with light educational content about herpetology, offering a relaxing and rewarding progression experience that respects the player's time.

2. Target Audience
**Primary:** Casual players aged 16–35 with an interest in animals, nature, or pets. Familiar with idle and light management games on mobile or web platforms.
**Secondary:** Real-life reptile enthusiasts looking for a digital experience that reflects their hobby. Nostalgic players of Happy Aquarium, Fish Tycoon, and similar games.
**Player Profile:**
* Plays in short sessions (5–15 minutes) several times a day
* Values aesthetics and collection more than direct competition
* Enjoys sharing achievements and visiting other players
* Does not want to feel "forced" to log in, but appreciates having reasons to return

3. Platform and Scope

**MVP (Phase 1):**
- Single-player only
- Web browser with responsive mobile-friendly design
- Local save via LocalStorage — no backend, no authentication, no accounts
- One terrarium
- Initial roster of reptile species (see Section 6.1)
- Core systems: Reptile care, Breeding, Terrarium decoration, Idle progression, Economy, Reptipedia
- No social features of any kind

**Phase 2 (post-retention validation):**
- User accounts and authentication
- Cloud saves
- Friend visits and coin bonuses
- Hatchling gifting
- Activity feed
- Optional leaderboards
- Premium currency infrastructure (Gems)

**Future Expansion:** Native mobile (iOS / Android), potential Steam client.

4. Core Gameplay
Players manage a virtual terrarium inhabited by reptiles that must be fed, kept clean, and decorated. Reptiles breed, generate passive resources, and have mood states that reflect the quality of their environment.
The experience is idle by design: the game progresses even while the player is offline, ensuring that every return offers something rewarding (hatchlings, accumulated coins, reward chests).
**Player Actions (MVP):**
* Feed reptiles (triggers animations, increases happiness, generates coins)
* Clean the terrarium (simple recurring mechanic, never punitive)
* Decorate using backgrounds, substrates, plants, rocks, and hides
* Pair reptiles for breeding
* Open reward chests
* Browse the Reptipedia

5. Gameplay Loop

Enter the game
     ↓
Check the terrarium status (reptiles, cleanliness, available hatchlings)
     ↓
Feed reptiles → happy reptiles → generate coins/resources
     ↓
Clean if necessary → maintains terrarium health
     ↓
Open accumulated reward chests → possible coins, decorations, surprise eggs
     ↓
Manage hatchlings → keep or sell for coins
     ↓
Invest coins → new species, decorations
     ↓
Browse Reptipedia → learn about unlocked species
     ↓
Close the game / wait
     ↓
The game progresses while idle → cycle repeats

Gameplay Loop Design Principle:
Every session should feel productive and satisfying in under 10 minutes. The game should never punish players for being away.

6. Core Systems
6.1 Reptile System

Each species has:

- Visible stats: Happiness, Hunger, Health
- Educational information: Short profile with habitat, diet, and real-world facts
- Rarity: Common, Uncommon, Rare, Special Event
- Visual personality: Colors and patterns faithful to the real species, with slightly simplified proportions

Initial species planned for the MVP (representing the main reptile groups):

| Group | Species |
|-------|---------|
| Geckos | Leopard Gecko, Crested Gecko |
| Lizards | Bearded Dragon, Blue-tongued Skink |
| Turtles | Red-eared Slider, Greek Tortoise |
| Snakes | Ball Python, Corn Snake |
| Chameleons | Veiled Chameleon (Rare) |

6.2 Breeding System
- Two reptiles of the same species can be paired.
- Breeding takes place in real time while the player is offline.
- Hatchlings have a chance to inherit color variations (morphs).
- Players can keep the hatchling or sell it for coins. (Gifting deferred to Phase 2.)
- Each terrarium has a population limit to prevent overcrowding without requiring active management.

6.3 Terrarium System
- Players begin with one unlocked terrarium. (Additional terrariums deferred to Phase 2.)
- Customization includes substrate, background, and functional decorations such as hides, branches, and water pools for turtles.
- Decorations are intentionally curated: a small selection of high-quality options instead of an overwhelming catalog.

6.4 Resource System
| Resource | How It Is Obtained | Purpose |
|----------|--------------------|---------|
| Coins | Happy reptiles, selling hatchlings, cleaning | Buy food, decorations, and new species |
| Chests | Daily login, achievements | Contain coins, decorations, and surprise eggs |
| Gems (Premium) | Reserved for Phase 2 | Speed up processes, extra slots (infrastructure only in MVP) |

6.5 Social System
**Deferred entirely to Phase 2.**
The MVP is a complete, self-contained single-player experience. No profiles, no friend visits, no gifting, no feeds, no leaderboards.
The codebase will be structured to accommodate social systems later without requiring architectural rewrites.

6.6 Knowledge System (Reptipedia)
Each unlocked species opens its profile in the in-game encyclopedia.
Real-world information includes:
- Geographic origin
- Ideal temperature
- Diet
- Lifespan

Information is presented visually and concisely rather than as academic text.

Related achievements include:
- "Discover 5 Species"
- "Complete the Gecko Family"

7. Progression
Short-term (first sessions):
Unlock the first species, decorate the initial terrarium, and obtain the first hatchling.
Mid-term (weeks):
Expand the collection, complete species families, fill the Reptipedia.
Long-term (months — Phase 2+):
Interact with friends, obtain event species, reach high reputation levels, fully customize multiple terrariums.

Progression Philosophy:
- There is always something small to accomplish in every session.
- There are no paywalls blocking core progression.
- Gems (Phase 2) accelerate progress rather than permanently locking gameplay content (except cosmetic collectibles).

8. Monetization
Business Model:
Free-to-Play with ethical optional monetization.

MVP:
No active monetization. The infrastructure is designed from the beginning to support it, but monetization will not be enabled until player retention has been validated.

Monetization Phases:
| Phase | Content Introduced |
|-------|--------------------|
| Phase 2 | Paid Gems to speed up breeding and unlock additional slots |
| Growth | Seasonal event species bundles (Christmas, Halloween, seasonal events) |
| Maturity | Optional "Reptile Haven Plus" subscription with cosmetic benefits and additional reward chests |

Never Behind a Paywall:
- Core game progression
- Educational content (complete Reptipedia)

Can Be Premium:
- Speed (timer acceleration)
- Exclusive cosmetics (limited-edition decorations)
- Event species with limited availability windows
- Additional terrarium slots beyond a reasonable progression threshold

9. Art Style
Visual Direction:
Naturalistic-cartoon. Reptiles maintain recognizable proportions and patterns faithful to their real-world species, while being rendered with soft lines, vibrant colors, and slightly simplified shapes that make them charming without losing their identity.
Style References:
The color palette and clean visual presentation of games like Niche or Webkinz, combined with the species accuracy found in wildlife observation apps (using iNaturalist as a photographic reference, not as an artistic reference).
General Palette:
Warm, earthy colors for environments (sand, rock, wood), contrasted with the vibrant colors characteristic of each species (the orange of the Bearded Dragon, the green of the Crested Gecko, the yellow of the Leopard Gecko).
UI:
Clean, with clear iconography. The interface should never overwhelm the screen. The terrarium is always the visual centerpiece.
Animations:
Subtle and satisfying. Reptiles occasionally move, blink, and eat using short animations. Nothing should feel frantic or overwhelming.

10. Player Experience
How Reptile Haven should feel:
- Relaxing, never stressful. No punishing timers, no energy systems, and no penalties for staying offline.
- Moderately surprising. Opening a chest, discovering a rare morph hatchling should feel like small gifts.
- Naturally educational. Players learn about reptiles without feeling like they are being taught. The Reptipedia is available for those who wish to explore further.
- Respectful of the player's time. A 10-minute session should always feel satisfying. Idle waiting should create anticipation, not frustration.

11. What Reptile Haven Is NOT
To maintain focus throughout development:
❌ It is not a hyper-realistic reptile care simulator with severe consequences.
❌ It is not a farming game filled with dozens of crops and repetitive mechanics.
❌ It does not include fictional or fantasy reptiles.
❌ It does not feature combat or direct competitive gameplay.
❌ It is not an endless catalog of decorations that overwhelms players.
❌ It never punishes players for being offline.

12. MVP Success Metrics
| Metric | Target |
|--------|--------|
| Day 1 Retention | > 40% |
| Day 7 Retention | > 20% |
| Average Session Length | 8–12 minutes |
| Reptipedia Open Rate | > 50% |
| Players who complete first breed | > 25% |

Note: Social metrics (friends connected, visits) move to Phase 2 measurement.

13. Balance and Configuration Principle
All numerical values that affect gameplay feel — timers, coin rates, hunger/cleanliness decay, morph probabilities, chest drop weights, costs — must be defined in external configuration files or typed constant modules. They must never be hardcoded inline.

This applies to every system. The goal is to make playtesting adjustments a configuration change, not a code change.

14. Technical Vision
Architecture
- Frontend: Phaser 3 + TypeScript
- Build Tool: Vite
- Save: Browser LocalStorage (MVP)
- Documentation: Markdown (/docs)
- Version Control: Git
- Repository: GitHub

Development Principles
- Modular architecture
- Data-driven game systems
- Entity Component approach when appropriate
- Documentation-first workflow
- Testable code
- Clean architecture
- All balance values externalized to config — never hardcoded

===============================================================================
                               VERSIÓN EN ESPAÑOL
===============================================================================
Documento de Visión del Proyecto
Reptile Haven — Idle Terrarium Management Game
Versión: 0.2 — Alcance Confirmado
Fecha: Julio 2026
Estado: Activo

---

## Historial de Cambios

| Versión | Fecha | Cambio |
|---------|-------|--------|
| 0.1 | Julio 2026 | Documento de visión inicial |
| 0.2 | Julio 2026 | Alcance del MVP confirmado: un jugador, sin backend, LocalStorage. Funciones sociales diferidas a Fase 2. Principio de configuración de balance añadido. |

---

1. Concepto Central
Reptile Haven es un juego idle/management donde los jugadores coleccionan, cuidan y crían reptiles reales en terrarios virtuales. Combina la accesibilidad y el loop adictivo de Happy Aquarium con contenido educativo ligero sobre herpetología, ofreciendo una experiencia relajante y progresiva que respeta el tiempo del jugador.

2. Público Objetivo
Primario: Jugadores casuales de 16 a 35 años, con interés en animales, naturaleza o mascotas. Familiarizados con juegos idle y de gestión ligera en móvil o navegador.

Secundario: Entusiastas reales de reptiles que buscan una experiencia digital que refleje su hobby. Jugadores nostálgicos de Happy Aquarium, Fish Tycoon o similares.

Perfil de jugador:
- Juega en sesiones cortas (5–15 minutos) varias veces al día
- Valora la estética y la colección sobre la competencia directa
- No quiere sentirse "obligado" a conectarse, pero sí motivado a volver

3. Plataforma y Alcance

**MVP (Fase 1):**
- Un solo jugador
- Web (navegador) con diseño responsivo para móvil
- Guardado local via LocalStorage — sin backend, sin autenticación, sin cuentas
- Un terrario
- Elenco inicial de especies (ver Sección 6.1)
- Sistemas principales: Cuidado de reptiles, Crianza, Decoración, Progresión idle, Economía, Reptipedia
- Sin funciones sociales de ningún tipo

**Fase 2 (tras validar retención):**
- Cuentas de usuario y autenticación
- Guardado en la nube
- Visitas de amigos y bonus de monedas
- Envío de crías como regalo
- Feed de actividad
- Rankings opcionales
- Infraestructura de moneda premium (Gemas)

**Expansión futura:** Mobile nativo (iOS / Android), potencialmente Steam.

4. Gameplay Principal
El jugador gestiona un terrario virtual donde viven reptiles que hay que alimentar, mantener limpios y decorar. Los reptiles se reproducen, generan recursos pasivos y tienen estados de ánimo que reflejan la calidad de su entorno.

La experiencia es idle por diseño: el juego progresa aunque el jugador no esté conectado, y al volver siempre hay algo positivo esperándolo.

Acciones del jugador (MVP):
- Alimentar reptiles (dispara animaciones, sube felicidad, genera monedas)
- Limpiar el terrario (mecánica periódica, sencilla, no punitiva)
- Decorar con elementos de fondo, sustrato, plantas, rocas y escondites
- Emparejar reptiles para reproducción
- Abrir cofres de recompensa
- Explorar la Reptipedia

5. Loop de Juego

Entrar al juego
     ↓
Revisar estado del terrario (reptiles, limpieza, crías disponibles)
     ↓
Alimentar → reptiles felices → generan monedas/recursos
     ↓
Limpiar si es necesario → mantiene salud del terrario
     ↓
Abrir cofres acumulados → posibles monedas, decoraciones, huevos
     ↓
Gestionar crías → conservar o vender por monedas
     ↓
Invertir monedas → nuevas especies, decoraciones
     ↓
Explorar Reptipedia → aprender sobre especies desbloqueadas
     ↓
Cerrar el juego / esperar
     ↓
El juego avanza en idle → ciclo se repite

Principio de diseño del loop: Cada sesión debe sentirse productiva y satisfactoria en menos de 10 minutos. El juego no debe castigar al jugador por no conectarse.

6. Sistemas Principales
6.1 Sistema de Reptiles
Cada especie tiene:
- Estadísticas visibles: Felicidad, Hambre, Salud
- Datos educativos: Ficha breve con hábitat, dieta y curiosidades reales
- Rareza: Común, Poco común, Raro, Evento Especial
- Personalidad visual: Colores y patrones fieles a la especie real, con proporciones levemente simplificadas

Especies iniciales para el MVP:

| Grupo | Especie |
|-------|---------|
| Geckos | Leopard Gecko, Crested Gecko |
| Lagartos | Bearded Dragon, Blue-tongued Skink |
| Tortugas | Red-eared Slider, Greek Tortoise |
| Serpientes | Ball Python, Corn Snake |
| Camaleones | Veiled Chameleon (raro) |

6.2 Sistema de Crianza
- Dos reptiles de la misma especie pueden emparejarse.
- La cría tarda tiempo real (idle) en nacer.
- Las crías pueden tener variaciones de color/morph con probabilidad.
- El jugador puede quedarse con la cría o venderla por monedas. (Regalar crías se difiere a Fase 2.)
- Límite de población por terrario para evitar overcrowding sin gestión activa.

6.3 Sistema de Terrarios
- El jugador empieza con un terrario desbloqueado. (Terrarios adicionales se difieren a Fase 2.)
- Personalización: sustrato, fondo, decoraciones funcionales (escondites, ramas, piscinas para tortugas).
- Decoración intencionalmente curada: pocas opciones de alta calidad.

6.4 Sistema de Recursos
| Recurso | Cómo se obtiene | Para qué sirve |
|---------|-----------------|----------------|
| Monedas | Reptiles felices, venta de crías, limpieza | Comprar comida, decoraciones, especies nuevas |
| Cofres | Login diario, logros | Contienen monedas, decoraciones, huevos sorpresa |
| Gemas (premium) | Reservado para Fase 2 | Infraestructura preparada, no activada en MVP |

6.5 Sistema Social
**Diferido completamente a la Fase 2.**
El MVP es una experiencia monojugador completa y autocontenida. Sin perfiles, sin visitas, sin regalos, sin feeds, sin rankings.
La arquitectura del código se estructurará para incorporar sistemas sociales posteriormente sin reescrituras.

6.6 Sistema de Conocimiento (Reptipedia)
- Cada especie desbloqueada abre su ficha en una enciclopedia in-game.
- Datos reales: origen geográfico, temperatura ideal, dieta, esperanza de vida.
- Presentado de forma visual y breve, no como texto académico.
- Logros relacionados: "Descubre 5 especies", "Completa la familia de geckos".

7. Progresión
Corto plazo (primeras sesiones): Desbloquear primeras especies, decorar el terrario inicial, conseguir primera cría.
Mediano plazo (semanas): Ampliar colección, completar familias de especies, llenar la Reptipedia.
Largo plazo (meses — Fase 2+): Interactuar con amigos, conseguir especies de eventos, terrarios personalizados.

Filosofía de progresión:
- Siempre hay algo pequeño que lograr en cada sesión.
- No hay "muros de pago" que bloqueen el progreso principal.
- Las gemas (Fase 2) aceleran, no bloquean contenido permanente.

8. Monetización
Modelo: Gratuito con monetización opcional (F2P ético).

MVP: Sin monetización activa. Infraestructura diseñada para soportarla, no activada hasta validar retención.

Fases de monetización:
| Fase | Qué se introduce |
|------|-----------------|
| Fase 2 | Gemas de pago para acelerar crianza, obtener más slots |
| Crecimiento | Paquetes de especies de evento (Navidad, Halloween, estacionales) |
| Madurez | Suscripción optional "Reptile Haven Plus" con beneficios cosméticos y cofres extra |

Lo que nunca estará detrás de pago:
- El progreso principal del juego
- Contenido educativo (Reptipedia completa)

Lo que puede ser premium:
- Velocidad (acelerar timers)
- Cosmético exclusivo (decoraciones de edición limitada)
- Especies de evento con ventana de disponibilidad
- Slots de terrario adicionales más allá de un umbral razonable

9. Estilo Artístico
Dirección visual: Naturalista-cartoon. Los reptiles mantienen proporciones y patrones reconocibles de sus especies reales, renderizados con líneas suaves, colores vibrantes y una ligera simplificación de formas.

Referentes: Paleta y limpieza de Niche o Webkinz, con fidelidad de especies tipo iNaturalist (como referencia fotográfica, no estilística).

Paleta: Colores cálidos y terrosos para ambientes, contrastados con los colores vivos de cada especie.

UI: Limpia, iconografía clara. El terrario es el protagonista visual.

Animaciones: Sutiles y satisfactorias. Movimientos ocasionales, parpadeo, animación de comer. Nada frenético.

10. Experiencia del Jugador
- Relajante, no estresante. Sin timers de castigo, sin energía, sin penalización por desconectarse.
- Sorprendente con moderación. Cofres, morphs raros: pequeños regalos.
- Educativo de forma natural. La Reptipedia está ahí para quien quiera profundizar.
- Honesto con el tiempo del jugador. 10 minutos deben ser satisfactorios. La espera idle crea anticipación, no bloqueo.

11. Lo que Reptile Haven NO es
❌ No es un simulador de cuidado hiperrealista con consecuencias severas.
❌ No es un juego de granja con decenas de cultivos y mecánicas repetitivas.
❌ No tiene reptiles ficticios ni fantasía.
❌ No tiene combate ni mecánicas competitivas directas.
❌ No es un catálogo infinito de decoraciones que abruma al jugador.
❌ No castiga al jugador por desconectarse.

12. Métricas de Éxito del MVP
| Métrica | Objetivo |
|---------|---------|
| Retención día 1 | > 40% |
| Retención día 7 | > 20% |
| Sesión promedio | 8–12 minutos |
| Tasa de apertura de Reptipedia | > 50% |
| Jugadores que completan primera cría | > 25% |

Nota: Las métricas sociales se trasladan a la medición de Fase 2.

13. Principio de Balance y Configuración
Todos los valores numéricos que afectan la jugabilidad — timers, tasas de monedas, degradación de hambre/limpieza, probabilidades de morph, pesos de cofres, costos — deben definirse en archivos de configuración externos o módulos de constantes tipadas. Nunca deben estar hardcodeados en línea.

Esto aplica a todos los sistemas. El objetivo es que los ajustes de playtesting sean cambios de configuración, no cambios de código.

14. Visión Técnica
Arquitectura:
- Frontend: Phaser 3 + TypeScript
- Build: Vite
- Guardado: Browser LocalStorage (MVP)
- Documentación: Markdown (/docs)
- Control de versiones: Git
- Repositorio: GitHub

Principios de desarrollo:
- Arquitectura modular
- Sistemas de juego orientados a datos
- Enfoque Entity Component cuando corresponda
- Workflow documentation-first
- Código testeable
- Arquitectura limpia
- Todos los valores de balance externalizados a config — nunca hardcodeados
