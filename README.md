### Progetto Tecnologie Web 2023/2024 Università di Bologna\
**Membri**: Angelo Greco\
**Estensione**: Base (18-21)

**Esecuzione**:
- Su /server, eseguire npx nodemon index.js
- Su /client, eseguire npm start

##### Informazioni:\
Per il forntend è stato usato il framework React, e Bootstrap per lo stile.

Ogni componente può essere raggiunta dalla home o dalla navbar. La timemachine è nel footer.

Il calendario carica gli eventi ricorrenti fino a 10 anni dopo la data della timemachine.
Se si modifica un evento ricorrente, si modifica il primo evento della serie, che cambia tutta la serie.

Le attività possono essere verdi (complete), bianche (normali), gialle (scadenza in 3 giorni), rosse (scadenza oggi) o nere (scadute).

Le note sono in markdown, e possono essere ordinate per ultima modifica, lunghezza o alfabeticamente (in modo ascendente o discendente).

Il timer pomodoro ha animazioni in css adattate da https://loading.io/css/. Si pausa automaticamente una volta usciti dalla pagina, e se resta in pausa per 30 minuti, la sessione viene terminata.

