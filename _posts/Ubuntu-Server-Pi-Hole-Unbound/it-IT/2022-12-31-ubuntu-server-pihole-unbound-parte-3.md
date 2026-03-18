---
title: "Guida Pi-Hole & Unbound - Parte 3: Installazione Pi-Hole"
description: Come installare Pi-Hole su Ubuntu Server per bloccare pubblicità e tracker a livello DNS su tutta la rete, come parte di uno stack DNS self-hosted con Unbound.
short_url: pihole-guida-3
date: 2022-12-31 12:00:00 +0100
last_modified_at: 2024-08-07 16:30:08 +0200
lang: it
image: https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/3_Pi-Hole/Pi-Hole_7.webp
topic: selfhosting
tags:
  - ubuntu
  - unbound
  - pi-hole
  - dns
  - server
  - adblocker
keywords:
  - installazione pi-hole ubuntu
  - blocco pubblicità dns
  - pi-hole ubuntu server
  - blocco ads rete
  - dns pi-hole installazione
  - configurazione pi-hole
  - server blocco pubblicità
---

*Nella [parte precedente]({% post_url Ubuntu-Server-Pi-Hole-Unbound/it-IT/2022-12-31-ubuntu-server-pihole-unbound-parte-2 %}) è stato spiegato come aggiungere l'autenticazione a due fattori (2FA) per l'accesso via SSH.*

## Installazione Pi-Hole

In questa fase verrà installato Pi-Hole, un software open source che agisce come [DNS sinkhole](https://it.wikipedia.org/wiki/DNS_sinkhole) e volendo anche come server DHCP. Questa applicazione filtrerà le richieste DNS per ridurre drasticamente la pubblicità presente nelle pagine web.

### Download repository ufficiale

Come primo passo c'è da scaricare il repository di Pi-Hole: `git clone --depth 1 https://github.com/pi-hole/pi-hole.git Pi-hole`.

![Installazione Pi-Hole - clonazione del repository ufficiale Pi-Hole da GitHub](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/3_Pi-Hole/Pi-Hole_2.webp)

Alla fine del download entriamo all'interno della cartella: `cd 'Pi-hole/automated install/'`.

![Installazione Pi-Hole - accesso alla directory Pi-hole/automated install/ dopo il download](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/3_Pi-Hole/Pi-Hole_4.webp)

### Preparazione installazione Pi-Hole

Da questa directory lanciare lo script bash: `sudo bash basic-install.sh`.
È possibile che chieda la password utente poiché viene lanciato con i privilegi di amministratore.
In caso affermativo inserirla e premere `Invio`.

![Installazione Pi-Hole - esecuzione dello script basic-install.sh con privilegi sudo](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/3_Pi-Hole/Pi-Hole_6.webp)

Si attende qualche momento per il controllo che sia tutto compatibile e non ci siano conflitti.

![Installazione Pi-Hole - verifica della compatibilità e dei conflitti in corso](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/3_Pi-Hole/Pi-Hole_7.webp)

Premete `Invio` per ciascuna delle due schermate per iniziare la configurazione.

![Installazione Pi-Hole - prima schermata informativa, premere Invio per continuare](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/3_Pi-Hole/Pi-Hole_8.webp)

![Installazione Pi-Hole - seconda schermata informativa, premere Invio per iniziare la configurazione](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/3_Pi-Hole/Pi-Hole_9.webp)

### Configurazione installazione Pi-Hole

Siccome da router è stato impostato come ip statico possiamo confermare, selezionando `Continue` e premendo `Invio`.

![Installazione Pi-Hole - schermata di conferma dell'indirizzo IP statico, selezione di Continue](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/3_Pi-Hole/Pi-Hole_10.webp)

Selezionare la stessa interfaccia a cui era stato assegnato l'ip usato durante tutta la procedura. In questo caso la prima. Premere `Invio` per confermare.

![Installazione Pi-Hole - schermata di selezione dell'interfaccia di rete](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/3_Pi-Hole/Pi-Hole_11.webp)

Selezionare un provider DNS provvisorio. Successivamente verrà tolto siccome il computer con Ubuntu Server diventerà un DNS resolver lui stesso alla porta `5353` e indirizzo `127.0.0.1`.

![Installazione Pi-Hole - selezione di un provider DNS provvisorio per l'upstream](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/3_Pi-Hole/Pi-Hole_12.webp)

Selezionare `Yes` per includere liste di terzi per filtrare i contenuti e confermare premendo `Invio`.

![Installazione Pi-Hole - abilitazione delle liste di blocco di terze parti per il filtraggio dei contenuti](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/3_Pi-Hole/Pi-Hole_13.webp)

Confermare l'installazione dell'interfaccia web per dove fare ulteriori modifiche alle impostazioni. Selezionare `Yes` e premere `Invio`.

![Installazione Pi-Hole - conferma dell'installazione dell'interfaccia web di amministrazione Pi-Hole](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/3_Pi-Hole/Pi-Hole_14.webp)

Confermare l'installazione del server web lighttpd per rendere l'interfaccia web funzionante. Selezionare `Yes` e premere `Invio`.

![Installazione Pi-Hole - conferma dell'installazione del server web lighttpd](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/3_Pi-Hole/Pi-Hole_15.webp)

Abilitare il logging delle query per eventuali debug di problemi. Selezionare `Yes` e premere `Invio`.

![Installazione Pi-Hole - abilitazione del logging delle query DNS per il debug](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/3_Pi-Hole/Pi-Hole_16.webp)

In questa schermata si può scegliere  quanti contenuti sono visualizzabili da interfaccia web dell'admin. Lasciare a default `Show everything`. Selezionare `Continue` e premere `Invio`.

![Installazione Pi-Hole - selezione della modalità di privacy per l'interfaccia web, lasciando "Show everything" come default](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/3_Pi-Hole/Pi-Hole_17.webp)

Qui verrà visualizzata la password autogenerata per loggare nell'interfaccia web tramite l'ip del computer. Non è importante ricordarla siccome verrà successivamente cambiare con una più lunga per sicurezza. Premere `Invio` per continuare.

![Installazione Pi-Hole - password autogenerata per l'interfaccia web visualizzata al termine dell'installazione](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/3_Pi-Hole/Pi-Hole_18.webp)

Terminata la procedura di configurazione di Pi-Hole, si può procedere a cambiare la password dell'interfaccia admin (da non confondere con la password utente).

![Installazione Pi-Hole - schermata di riepilogo al termine dell'installazione completata](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/3_Pi-Hole/Pi-Hole_19.webp)

Per cambiare la password dell'interfaccia web di Pi-Hole usare il comando `pihole -a -p`.


![Pi-Hole - esecuzione del comando "pihole -a -p" per cambiare la password dell'interfaccia web di amministrazione](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/3_Pi-Hole/Pi-Hole_20.webp)

Dopo aver premuto `Invio` inserire la password, premere di nuovo `Invio`, reinserire la password e confermare infine sempre con il tasto `Invio`.

![Pi-Hole - inserimento e conferma della nuova password per l'interfaccia web di amministrazione](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/3_Pi-Hole/Pi-Hole_21.webp)

Se la procedura ha avuto successo comparirà la scritta `New password set`

![Pi-Hole - messaggio di conferma "New password set" dopo aver cambiato la password con successo](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/3_Pi-Hole/Pi-Hole_22.webp)

**[Parte successiva]({% post_url Ubuntu-Server-Pi-Hole-Unbound/it-IT/2022-12-31-ubuntu-server-pihole-unbound-parte-4 %})**
