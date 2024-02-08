---
title: Installazione e configurazione server DNS (Parte 2) - Installazione 2FA (IT)
description: Imposta un robusto e sicuro server DNS utilizzando Ubuntu, Pi-Hole e Unbound, offrendo un miglioramento della privacy e un maggiore controllo sul traffico della tua rete.
date: 2022-12-31 11:00:00 +0100
ogimg: "https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/2_2FA/2FA_13.jpg"
---

*Nella [parte precedente]({% post_url 2022-12-31-ubuntu-server-pihole-unbound-parte-1 %}) è stato spiegato come installare il sistema operativo Ubuntu Server.*

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

**[Parte successiva]({% post_url 2022-12-31-ubuntu-server-pihole-unbound-parte-3 %})**
