# Voltguard — Sito web

Sito statico (HTML/CSS/JS puro, nessuna build necessaria) per **Voltguard**, bot di sicurezza per Discord.

## Struttura

```
voltguard/
├── index.html      → struttura della pagina
├── style.css        → tema grafico blu/nero, animazioni, layout responsive
├── script.js        → navbar fluida, sfondo animato, contatori, recensioni, PayPal
├── assets/
│   └── favicon.svg
└── README.md
```

## Pubblicare su GitHub Pages (gratis)

1. Crea un nuovo repository su GitHub (es. `voltguard`).
2. Carica tutti i file di questa cartella nella root del repository (branch `main`).
3. Vai su **Settings → Pages**.
4. In "Source" seleziona il branch `main` e la cartella `/ (root)`.
5. Salva: dopo 1-2 minuti il sito sarà online su `https://tuo-utente.github.io/voltguard/`.

Non serve nessuna build, server o database: è tutto HTML/CSS/JS statico.

## Collegare i pagamenti PayPal reali

Il sito include già i pulsanti PayPal funzionanti nella sezione **Prezzi**, ma usano il
Client ID di **sandbox** (`sb`) per farti testare tutto subito senza account.

Per accettare pagamenti veri:

1. Crea un'app su [developer.paypal.com/dashboard/applications](https://developer.paypal.com/dashboard/applications).
2. Copia il **Client ID Live**.
3. In `index.html`, trova questa riga vicino alla fine del file:

   ```html
   <script src="https://www.paypal.com/sdk/js?client-id=sb&currency=EUR&vault=true&intent=subscription" ...>
   ```

4. Sostituisci `sb` con il tuo Client ID:

   ```html
   <script src="https://www.paypal.com/sdk/js?client-id=IL_TUO_CLIENT_ID&currency=EUR&vault=true&intent=subscription" ...>
   ```

5. In `script.js`, dentro `initPayPalButtons()`, puoi modificare gli importi (`4.99` e `14.99`)
   o collegare veri piani di abbonamento (`plan_id`) se preferisci addebiti ricorrenti automatici
   invece del pagamento singolo attualmente configurato.

## Personalizzazione rapida

- **Link "Aggiungi a Discord"**: sostituisci gli URL `https://discord.com` in `index.html`
  con il link OAuth reale del tuo bot (formato
  `https://discord.com/oauth2/authorize?client_id=...&scope=bot`).
- **Colori**: tutte le variabili sono all'inizio di `style.css`, dentro `:root { ... }`.
- **Font**: `Unbounded` (titoli), `Manrope` (testo), `JetBrains Mono` (dettagli tecnici),
  caricati da Google Fonts nell'`<head>` di `index.html`.
- **Recensioni**: modifica l'array `reviews` dentro `initReviews()` in `script.js`.
- **Statistiche hero**: modifica gli attributi `data-target` sugli elementi `.stat-num` in `index.html`.

## Compatibilità

Sito testato per essere fluido su desktop e mobile, con supporto a `prefers-reduced-motion`
per chi disattiva le animazioni a livello di sistema operativo.
