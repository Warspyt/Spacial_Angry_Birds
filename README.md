# Spacial Angry Birds 🚀🌍

Una réplica interactiva del clásico juego **Angry Birds** desarrollada en JavaScript con la biblioteca **p5.js** y el motor físico **Matter.js**. Cuenta con dos modos de juego únicos: un nivel terrestre con físicas tradicionales y un nivel espacial con mecánicas de gravedad planetaria.

---

## 🕹️ Cómo Jugar y Controles

*   **Lanzar Pájaros:** Haz clic izquierdo sobre el pájaro en la resortera (slingshot), arrastra hacia atrás para apuntar y calcular la fuerza, y suelta el botón para disparar.
*   **Siguiente Pájaro:** Si tu pájaro actual se detiene o sale de la pantalla y aún te quedan tiros, presiona la **[Barra Espaciadora]** para traer al siguiente pájaro a la resortera.
*   **Menú/Instrucciones:** Puedes presionar la tecla **[ESC]** estando en la pantalla de instrucciones para regresar al menú principal de forma rápida.

---

## 🎯 Objetivo del Juego

El objetivo principal es **eliminar a todos los cerdos** del escenario antes de quedarte sin pájaros.
*   **Victoria:** Se alcanza al derrotar a todos los cerdos del nivel.
*   **Derrota:** Si lanzas todos tus pájaros disponibles y aún queda algún cerdo con vida, perderás el nivel y aparecerá la pantalla de fallo.

---

## ⚔️ Elementos del Juego

### 🐦 Tipos de Pájaros (Lanzamientos)
El juego selecciona pájaros aleatorios en tu cola de lanzamientos:
1.  **Rojo (Red):** Pájaro estándar de impacto equilibrado.
2.  **Amarillo (Chuck):** Más ligero, ideal para penetrar estructuras de madera.
3.  **Negro (Bomb):** Mayor masa, inflige un gran impacto al colisionar.

### 📦 Tipos de Bloques (Nivel Normal)
Las columnas defensivas del primer nivel se generan de manera aleatoria combinando dos materiales:
*   **Madera (Destruible):** Se rompe inmediatamente con un impacto directo de pájaro o al sufrir caídas y colisiones fuertes. Al dañarse, cambia visualmente su tonalidad a rojo antes de destruirse.
*   **Metal (Indestructible):** Bloques grises reforzados con remaches. Son completamente inmunes a los impactos y no pueden destruirse, funcionando como obstáculos permanentes.

### 🐖 Sistema de Vida de los Cerdos
Cada cerdo cuenta con una barra de vida (3 puntos). Un cerdo recibirá daño si:
*   Es impactado directamente por cualquier pájaro (eliminación instantánea).
*   Sufre caídas o impactos a gran velocidad contra el suelo, planetas u otras cajas.

---

## 🪐 Modos de Nivel

### 🌍 Nivel Normal (Terrestre)
Presenta gravedad clásica hacia abajo. Deberás derribar las estructuras mixtas de madera y metal para hacer caer a los cerdos y eliminarlos mediante el impacto de los escombros o la caída contra el suelo.

### 🚀 Nivel Espacial
Juega sin gravedad global. En su lugar, el mapa cuenta con **tres planetas** que ejercen campos gravitacionales independientes:
*   Los bloques y cerdos flotan estables en el espacio.
*   El trayecto de tu pájaro **se curvará sutilmente** bajo la influencia de la gravedad planetaria al pasar cerca de ellos. ¡Usa esta atracción a tu favor para rodear los obstáculos y golpear los objetivos ocultos!
