🇵🇱 Fantasia Restart – Wersja Developerska

Fantasia Restart to prototyp strategicznej gry turowej z elementami symulacji czasu rzeczywistego, budowanej w React + TypeScript + Canvas + Tailwind.
Celem projektu jest stworzenie lekkiego, modularnego RTS/Colony Buildera działającego w przeglądarce oraz łatwego do dalszej rozbudowy.

🚀 Aktualny stan projektu
Implementowane moduły:

⚙️ GameEngine (Canvas loop)

pętla animacji requestAnimationFrame

obsługa faz tury (30s symulacji → freeze)

integracja z logiką gry (produkcja, budowa, populacja)

🧱 Logic v2

produkcja surowców

kolejka budowy

wzrost populacji

system ról workerów

🎨 GraphicClasses

bazowa klasa GraphicObject

Worker z prostym ruchem (moveToAnchor)

plan pod AI (cele: HQ → surowiec → budynek)

🌱 Seed Parser

deterministyczne generowanie układu mapy

rozmieszczenie HQ i surowców

layout budynków (left/right)

system trzech punktów startowych (hex/triangle)

🖥️ React UI

panel tury (freeze)

wybór roli workerów

wybór budynku do kolejki

Tailwind layout

🗂️ Struktura projektu
src/
  App.tsx
  main.tsx
  graphics/
    assets.ts
  game/
    types.ts
    logic.ts
    engine/
      GameEngine.ts
      GraphicClasses.ts
      seedParser.ts
  components/
    GameCanvas.tsx
    TurnUI.tsx

🔄 Loop gry – opis skrócony

Każda tura składa się z dwóch faz:

1️⃣ Faza symulacji (30 sekund)

workerzy idą do pracy

produkcja surowców

ruch do placu budowy

budowa

animacje w canvasie

2️⃣ Faza freeze (wybory gracza)

przypisanie ról dla nowych peasants

wybór kolejnego budynku

potwierdzenie → start nowej symulacji

🧩 Seed map generator

Seed jest stringiem, np.:

312310


Interpretacja:

1–3 → sektor drewna

1–3 → sektor kamienia

1–3 → sektor owoców

1–3 → sektor gliny

0–1 → layout budynków

1–3 → pozycja HQ (triangle/hex map)

Parser zwraca współrzędne obiektów oraz layout.

🛠️ Tech Stack

React 18

TypeScript

Tailwind CSS

Canvas 2D

Vite

Modularny silnik gry

📅 Plan na kolejne dni

integracja AI workerów z seedem

animacje sprite’ów

rendering surowców i budynków

pełna mapa (triangle/hex)

dźwięki i efekty

zapis stanu gry backendem

🇬🇧 Fantasia Restart – Developer Version

Fantasia Restart is an early-stage prototype of a turn-based strategy game with real-time simulation elements, built using React + TypeScript + Canvas + Tailwind.
The goal is to create a lightweight, modular browser-based RTS/colony builder with clean systems and easy future expansion.

🚀 Current Project Status
Implemented modules:

⚙️ GameEngine (Canvas loop)

requestAnimationFrame loop

30-second simulation → freeze

integration with game logic (production, building queue, population)

🧱 Logic v2

resource production

building queue

population growth

worker roles system

🎨 GraphicClasses

base class GraphicObject

Worker with simple movement (moveToAnchor)

AI-ready structure (HQ → resource → building)

🌱 Seed Parser

deterministic world layout

HQ + resource positioning

building orientation (left/right)

3 faction start points (triangle/hex)

🖥️ React UI

turn freeze panel

worker role assignment

building selection

Tailwind layout

🗂️ Project Structure
src/
  App.tsx
  main.tsx
  graphics/
    assets.ts
  game/
    types.ts
    logic.ts
    engine/
      GameEngine.ts
      GraphicClasses.ts
      seedParser.ts
  components/
    GameCanvas.tsx
    TurnUI.tsx

🔄 Game Loop Overview

Each turn has two phases:

1️⃣ Simulation phase (30 seconds)

workers walk to their tasks

resources spawn

workers move to the build site

building progress

canvas animations

2️⃣ Freeze phase (player decisions)

assign roles to new peasants

choose next building

confirm → new simulation begins

🌱 Seed-based World Generator

Seed example:

312310


Meaning:

1–3: wood sector

1–3: stone sector

1–3: food sector

1–3: clay sector

0–1: building layout (left/right)

1–3: HQ start position (triangle/hex map)

The parser returns object positions and layout orientation.

🛠️ Technologies

React 18

TypeScript

Tailwind CSS

Canvas 2D

Vite

Modular game engine

📅 Next Steps

integrate worker AI with seed positions

sprite animations

rendering resource nodes + building visuals

full faction map (triangle/hex layout)

sound/effects

backend savefile support
