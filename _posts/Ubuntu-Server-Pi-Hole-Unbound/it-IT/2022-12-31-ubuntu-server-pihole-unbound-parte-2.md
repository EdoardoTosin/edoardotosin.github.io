---
title: Installazione e configurazione server DNS (Parte 2) - Installazione 2FA (IT)
description: Imposta un robusto e sicuro server DNS utilizzando Ubuntu, Pi-Hole e Unbound, offrendo un miglioramento della privacy e un maggiore controllo sul traffico della tua rete.
date: 2022-12-31 11:00:00 +0100
last_modified_at: 2024-08-07 16:30:08 +0200
lang: it
ogimg: https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/2_2FA/2FA_13.jpg
tags: ["ubuntu", "unbound", "pi-hole", "dns", "server", "adblocker"]
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

{% include Image.html src="https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/2_2FA/2FA_1.jpg" title="2FA 1" %}

Dopo aver premuto invio chiederà di salvare la chiave SHA256. Scrivere `y` e confermare premento il tasto `Invio`.

{% include Image.html src="https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/2_2FA/2FA_2.jpg" title="2FA 2" %}

Ora inserire la password impostata durante la fase di installazione di Ubuntu Server (Impostazioni profilo).

{% include Image.html src="https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/2_2FA/2FA_3.jpg" title="2FA 3" %}

Se è stato inserito tutto correttamente allora è possibile controllare Ubuntu Server da remoto da CLI.

{% include Image.html src="https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/2_2FA/2FA_4.jpg" title="2FA 4" %}

## Aggiornamento sistema

{% include Image.html src="https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/2_2FA/2FA_5.jpg" title="2FA 5" %}

### Aggiornare repository e sistema

Per avviare l'aggiornamento basta eseguire la riga `sudo apt update && sudo apt upgrade`. Eseguendo entrambi i comandi con `sudo` verrà chiesta la password dell'utente (la stessa usata per fare il login).

{% include Image.html src="https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/2_2FA/2FA_6.jpg" title="2FA 6" %}

### Conferma aggiornamenti

Per confermare l'avvio degli aggiornamenti scrivere `y` e premere `Invio`.

{% include Image.html src="https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/2_2FA/2FA_7.jpg" title="2FA 7" %}

### Riavvio servizi

È probabile che compaia una schermata come la seguente che chiede quali servizi riavviare. Selezionare `Ok` senza cambiare nulla dalla lista e successivamente premere `Invio` per confermare.

{% include Image.html src="https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/2_2FA/2FA_8.jpg" title="2FA 8" %}

Ora si può riavviare il computer per verificare che con gli ultimi aggiornamenti il sistema funziona prima di procedere all’installazione delle applicazioni.

{% include Image.html src="https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/2_2FA/2FA_9.jpg" title="2FA 9" %}

## Installazione 2FA

Nella seguente procedura verrà aggiunta l'autenticazione a due fattori per ridurre il rischio di accessi non autorizzati (Zero Trust).

### Installazione pacchetto

Effettuare di nuovo il login seguendo la procedura `Login via SSH` senza il paragrafo riguardante la chiave.

Eseguire il comando `sudo apt install libpam-google-authenticator` per installere il pacchetto richiesto per l'autenticazione a due fattori.

{% include Image.html src="https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/2_2FA/2FA_10.jpg" title="2FA 10" %}

Inserire la password utente confermandola. Successivamente verrà chiesta la conferma per installare il pacchetto. Scrivere `y` e premere `Invio`.

### Configurazione 2FA

Ora si procede a configurare l'autenticazione con il codice a 6 cifre temporaneo (cambia ogni 30 secondi).

{% include Image.html src="https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/2_2FA/2FA_11.jpg" title="2FA 11" %}

Verrà chiesto se si vuole che i token siano temporanei. Scrivere `y` e premere `Invio`.

{% include Image.html src="https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/2_2FA/2FA_12.jpg" title="2FA 12" %}

Verrà creata la chiave segreta (`Your new secret key is:`) per la generazione dei codici a tempo.
È importante tenere un backup di questa chiave per ridurre il rischio di perderla.
Scansionare il QR-Code oppure inserire la chiave in un'applicazione (per distro Debian e derivate va bene Authenticator già presente nei repository di sistema) e salvare.
Dopo aver salvato si può vedere il codice. Inserirlo nel terminale e premere `Invio` per confermare.

{% include Image.html src="https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/2_2FA/2FA_13.jpg" title="2FA 13" %}

Successivamente chiederà se si vuole aggiornare il file .google_authenticator. Confermare scrivendo `y` e premendo `Invio`.

{% include Image.html src="https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/2_2FA/2FA_14.jpg" title="2FA 14" %}

Per aumentare la sicurezza aggiungiamo le restrizioni di login ogni 30 secondi (quindi un solo login con successo per ogni codice generato).
Per confermare scrivere `y` e premere `Invio`.

{% include Image.html src="https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/2_2FA/2FA_15.jpg" title="2FA 15" %}

Verrà chiesto se si vuole estendere il login con il codice generato oltre il limite di tempo da 3 codici a 17 (8 precedenti, corrente e 8 successivi). Siccome 3 vanno già bene non va esteso ulteriormente quindi scrivere `n` e premere `Invio`.

{% include Image.html src="https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/2_2FA/2FA_16.jpg" title="2FA 16" %}

Ora verrà confermata l'aggiunta del rate-limit, in modo tale che siano possibili solo 3 tentativi di login ogni 30 secondi. Per far ciò scrivere `y` e premere `Invio`.

{% include Image.html src="https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/2_2FA/2FA_17.jpg" title="2FA 17" %}

### Aggiunta 2FA al login

Per aggiungere l'autenticazione a due fattori appena configurata bisogna modificare il file common-session con il comando `sudo nano /etc/pan.d/common-session`. Se viene richiesta la password inserire quella dell'utente.

{% include Image.html src="https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/2_2FA/2FA_18.jpg" title="2FA 18" %}

Premendo `Invio` comparirà il file da editare. Dopo la riga `# end of pam-auth-update config` bisogna aggiungere una nuova riga che contiene `auth required pam_google_authenticator.so` come quella evidenziata nello screen successivo.
Per salvare le modifiche e uscire dall'editor, premere `CTRL+X` poi scrivere `y` e infine premere `Invio` per confermare.

{% include Image.html src="https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/2_2FA/2FA_19.jpg" title="2FA 19" %}

Altro file da modificare è `sshd_config`. Per fare ciò basta di nuovo aprirlo con il comando `sudo nano /etc/ssh/sshd_config`. Se chiede la password, inserire quella dell'utente.

{% include Image.html src="https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/2_2FA/2FA_20.jpg" title="2FA 20" %}

Se alla voce `KbdInteractiveAuthentication` è presente l’opzione `no`, allora sostituirla con `yes`.
Per salvare anche queste modifiche e uscire dall'editor, premere `CTRL+X` poi scrivere `y` e infine premere `Invio` per confermare.

{% include Image.html src="https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/2_2FA/2FA_21.jpg" title="2FA 21" %}

Riavviare il servizio sshd.service per caricare le modifiche con il comando `sudo systemctl restart sshd.service`

{% include Image.html src="https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/2_2FA/2FA_22.jpg" title="2FA 22" %}

**[Parte successiva]({% post_url Ubuntu-Server-Pi-Hole-Unbound/it-IT/2022-12-31-ubuntu-server-pihole-unbound-parte-3 %})**
