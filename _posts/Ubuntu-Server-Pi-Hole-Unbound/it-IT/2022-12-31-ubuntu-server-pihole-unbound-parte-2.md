---
title: "Guida Pi-Hole & Unbound - Parte 2: Autenticazione a Due Fattori"
description: "Come configurare l'autenticazione a due fattori (2FA) su Ubuntu Server tramite Google Authenticator per proteggere l'accesso SSH prima di installare Pi-Hole e Unbound."
short_url: pihole-guida-2
date: 2022-12-31 11:00:00 +0100
last_modified_at: 2024-08-07 16:30:08 +0200
lang: it
image: https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/2_2FA/2FA_13.webp
topic: selfhosting
tags:
  - ubuntu
  - unbound
  - pi-hole
  - dns
  - server
  - adblocker
keywords:
  - ubuntu 2fa configurazione
  - autenticazione due fattori ssh
  - google authenticator ubuntu
  - sicurezza ssh
  - ubuntu server sicurezza
  - autenticazione due fattori linux
  - configurazione ssh 2fa
---

*Nella [parte precedente]({% post_url Ubuntu-Server-Pi-Hole-Unbound/it-IT/2022-12-31-ubuntu-server-pihole-unbound-parte-1 %}) è stato spiegato come installare il sistema operativo Ubuntu Server.*

## SSH

Dopo l'installazione si procede ad aggiornare il sistema e i pacchetti installati alla loro ultima versione.

### Login via SSH

Per accedere aprire il terminale in un altro computer nella stessa rete (Powershell nel caso di Windows) e digitare il seguente comando:

```shell
ssh USERNAME@IP
```

`USERNAME` è da sostituire con il nome utente inserito durante la fase di installazione di Ubuntu Server (Impostazioni profilo)
Al posto di `IP` va inserito l'indirizzo ip del computerdove è installato Ubuntu Server.
`-p 22` è opzionale dato che di default ssh si collega alla porta 22 del dispositivo.

![Accesso SSH - connessione a Ubuntu Server tramite terminale con il comando ssh](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/2_2FA/2FA_1.webp)

Dopo aver premuto invio chiederà di salvare la chiave SHA256. Scrivere `y` e confermare premento il tasto `Invio`.

![Accesso SSH - richiesta di conferma per salvare la chiave host SHA256 del server](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/2_2FA/2FA_2.webp)

Ora inserire la password impostata durante la fase di installazione di Ubuntu Server (Impostazioni profilo).

![Accesso SSH - inserimento della password utente per l'autenticazione su Ubuntu Server](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/2_2FA/2FA_3.webp)

Se è stato inserito tutto correttamente allora è possibile controllare Ubuntu Server da remoto da CLI.

![Accesso SSH - accesso remoto via CLI a Ubuntu Server avvenuto con successo](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/2_2FA/2FA_4.webp)

## Aggiornamento sistema

![Ubuntu Server - esecuzione dei comandi di aggiornamento del sistema via SSH](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/2_2FA/2FA_5.webp)

### Aggiornare repository e sistema

Per avviare l'aggiornamento basta eseguire la riga `sudo apt update && sudo apt upgrade`. Eseguendo entrambi i comandi con `sudo` verrà chiesta la password dell'utente (la stessa usata per fare il login).

![Ubuntu Server - esecuzione di "sudo apt update && sudo apt upgrade" per aggiornare repository e pacchetti](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/2_2FA/2FA_6.webp)

### Conferma aggiornamenti

Per confermare l'avvio degli aggiornamenti scrivere `y` e premere `Invio`.

![Ubuntu Server - conferma dell'avvio degli aggiornamenti digitando "y"](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/2_2FA/2FA_7.webp)

### Riavvio servizi

È probabile che compaia una schermata come la seguente che chiede quali servizi riavviare. Selezionare `Ok` senza cambiare nulla dalla lista e successivamente premere `Invio` per confermare.

![Ubuntu Server - finestra di dialogo per il riavvio dei servizi dopo l'aggiornamento, selezione di Ok](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/2_2FA/2FA_8.webp)

Ora si può riavviare il computer per verificare che con gli ultimi aggiornamenti il sistema funziona prima di procedere all’installazione delle applicazioni.

![Ubuntu Server - riavvio del sistema al termine degli aggiornamenti](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/2_2FA/2FA_9.webp)

## Installazione 2FA

Nella seguente procedura verrà aggiunta l'autenticazione a due fattori per ridurre il rischio di accessi non autorizzati (Zero Trust).

### Installazione pacchetto

Effettuare di nuovo il login seguendo la procedura `Login via SSH` senza il paragrafo riguardante la chiave.

Eseguire il comando `sudo apt install libpam-google-authenticator` per installere il pacchetto richiesto per l'autenticazione a due fattori.

![Configurazione 2FA - installazione del pacchetto libpam-google-authenticator tramite apt](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/2_2FA/2FA_10.webp)

Inserire la password utente confermandola. Successivamente verrà chiesta la conferma per installare il pacchetto. Scrivere `y` e premere `Invio`.

### Configurazione 2FA

Ora si procede a configurare l'autenticazione con il codice a 6 cifre temporaneo (cambia ogni 30 secondi).

![Configurazione 2FA - richiesta se si desidera che i token siano temporanei (time-based)](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/2_2FA/2FA_11.webp)

Verrà chiesto se si vuole che i token siano temporanei. Scrivere `y` e premere `Invio`.

![Configurazione 2FA - QR code e chiave segreta visualizzati per la configurazione dell'app authenticator](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/2_2FA/2FA_12.webp)

Verrà creata la chiave segreta (`Your new secret key is:`) per la generazione dei codici a tempo.
È importante tenere un backup di questa chiave per ridurre il rischio di perderla.
Scansionare il QR-Code oppure inserire la chiave in un'applicazione (per distro Debian e derivate va bene Authenticator già presente nei repository di sistema) e salvare.
Dopo aver salvato si può vedere il codice. Inserirlo nel terminale e premere `Invio` per confermare.

![Configurazione 2FA - inserimento del codice di verifica generato dall'app authenticator](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/2_2FA/2FA_13.webp)

Successivamente chiederà se si vuole aggiornare il file .google_authenticator. Confermare scrivendo `y` e premendo `Invio`.

![Configurazione 2FA - richiesta di aggiornamento del file .google_authenticator](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/2_2FA/2FA_14.webp)

Per aumentare la sicurezza aggiungiamo le restrizioni di login ogni 30 secondi (quindi un solo login con successo per ogni codice generato).
Per confermare scrivere `y` e premere `Invio`.

![Configurazione 2FA - abilitazione della restrizione a un solo login con successo per finestra di 30 secondi](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/2_2FA/2FA_15.webp)

Verrà chiesto se si vuole estendere il login con il codice generato oltre il limite di tempo da 3 codici a 17 (8 precedenti, corrente e 8 successivi). Siccome 3 vanno già bene non va esteso ulteriormente quindi scrivere `n` e premere `Invio`.

![Configurazione 2FA - rifiuto dell'estensione della finestra temporale a 17 codici per la validità del codice](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/2_2FA/2FA_16.webp)

Ora verrà confermata l'aggiunta del rate-limit, in modo tale che siano possibili solo 3 tentativi di login ogni 30 secondi. Per far ciò scrivere `y` e premere `Invio`.

![Configurazione 2FA - abilitazione del rate-limit a 3 tentativi di login ogni 30 secondi](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/2_2FA/2FA_17.webp)

### Aggiunta 2FA al login

Per aggiungere l'autenticazione a due fattori appena configurata bisogna modificare il file common-session con il comando `sudo nano /etc/pan.d/common-session`. Se viene richiesta la password inserire quella dell'utente.

![Configurazione 2FA - apertura di /etc/pam.d/common-session in nano per aggiungere Google Authenticator](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/2_2FA/2FA_18.webp)

Premendo `Invio` comparirà il file da editare. Dopo la riga `# end of pam-auth-update config` bisogna aggiungere una nuova riga che contiene `auth required pam_google_authenticator.so` come quella evidenziata nello screen successivo.
Per salvare le modifiche e uscire dall'editor, premere `CTRL+X` poi scrivere `y` e infine premere `Invio` per confermare.

![Configurazione 2FA - file common-session con la riga "auth required pam_google_authenticator.so" aggiunta](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/2_2FA/2FA_19.webp)

Altro file da modificare è `sshd_config`. Per fare ciò basta di nuovo aprirlo con il comando `sudo nano /etc/ssh/sshd_config`. Se chiede la password, inserire quella dell'utente.

![Configurazione 2FA - apertura di /etc/ssh/sshd_config in nano per abilitare l'autenticazione interattiva via tastiera](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/2_2FA/2FA_20.webp)

Se alla voce `KbdInteractiveAuthentication` è presente l’opzione `no`, allora sostituirla con `yes`.
Per salvare anche queste modifiche e uscire dall'editor, premere `CTRL+X` poi scrivere `y` e infine premere `Invio` per confermare.

![Configurazione 2FA - sshd_config con KbdInteractiveAuthentication impostato a yes](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/2_2FA/2FA_21.webp)

Riavviare il servizio sshd.service per caricare le modifiche con il comando `sudo systemctl restart sshd.service`

![Configurazione 2FA - riavvio del servizio sshd per applicare le modifiche alla configurazione 2FA](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/2_2FA/2FA_22.webp)

**[Parte successiva]({% post_url Ubuntu-Server-Pi-Hole-Unbound/it-IT/2022-12-31-ubuntu-server-pihole-unbound-parte-3 %})**
