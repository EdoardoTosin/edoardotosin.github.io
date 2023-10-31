---
title: Installazione e configurazione server DNS (Parte 2) - Installazione 2FA
description: Guida installazione e configurazione Ubuntu Server, Pi-Hole e Unbound
date: 2022-12-31 11:00:00 +0100
ogimg: "https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/2_2FA/2FA_13.jpg"
---

*Nella [parte precedente]({% post_url 2022-12-31-ubuntu-server-pihole-unbound-part-1 %}) è stato spiegato come installare il sistema operativo Ubuntu Server.*

## Installazione 2FA

Nella seguente procedura verrà aggiunta l'autenticazione a due fattori per ridurre il rischio di accessi non autorizzati (Zero Trust).

### Installazione pacchetto

Effettuare di nuovo il login seguendo la procedura `Login via SSH` senza il paragrafo riguardante la chiave.

Eseguire il comando `sudo apt install libpam-google-authenticator` per installere il pacchetto richiesto per l'autenticazione a due fattori.

![2FA 10](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/2_2FA/2FA_10.jpg)

Inserire la password utente confermandola. Successivamente verrà chiesta la conferma per installare il pacchetto. Scrivere `y` e premere `Invio`.

### Configurazione 2FA

Ora si procede a configurare l'autenticazione con il codice a 6 cifre temporaneo (cambia ogni 30 secondi).

![2FA 11](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/2_2FA/2FA_11.jpg)

Verrà chiesto se si vuole che i token siano temporanei. Scrivere `y` e premere `Invio`.

![2FA 12](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/2_2FA/2FA_12.jpg)

Verrà creata la chiave segreta (`Your new secret key is:`) per la generazione dei codici a tempo.
È importante tenere un backup di questa chiave per ridurre il rischio di perderla.
Scansionare il QR-Code oppure inserire la chiave in un'applicazione (per distro Debian e derivate va bene Authenticator già presente nei repository di sistema) e salvare.
Dopo aver salvato si può vedere il codice. Inserirlo nel terminale e premere `Invio` per confermare.

![2FA 13](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/2_2FA/2FA_13.jpg)

Successivamente chiederà se si vuole aggiornare il file .google_authenticator. Confermare scrivendo `y` e premendo `Invio`.

![2FA 14](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/2_2FA/2FA_14.jpg)

Per aumentare la sicurezza aggiungiamo le restrizioni di login ogni 30 secondi (quindi un solo login con successo per ogni codice generato).
Per confermare scrivere `y` e premere `Invio`.

![2FA 15](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/2_2FA/2FA_15.jpg)

Verrà chiesto se si vuole estendere il login con il codice generato oltre il limite di tempo da 3 codici a 17 (8 precedenti, corrente e 8 successivi). Siccome 3 vanno già bene non va esteso ulteriormente quindi scrivere `n` e premere `Invio`.

![2FA 16](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/2_2FA/2FA_16.jpg)

Ora verrà confermata l'aggiunta del rate-limit, in modo tale che siano possibili solo 3 tentativi di login ogni 30 secondi. Per far ciò scrivere `y` e premere `Invio`.

![2FA 17](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/2_2FA/2FA_17.jpg)

### Aggiunta 2FA al login

Per aggiungere l'autenticazione a due fattori appena configurata bisogna modificare il file common-session con il comando `sudo nano /etc/pan.d/common-session`. Se viene richiesta la password inserire quella dell'utente.

![2FA 18](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/2_2FA/2FA_18.jpg)

Premendo `Invio` comparirà il file da editare. Dopo la riga `# end of pam-auth-update config` bisogna aggiungere una nuova riga che contiene `auth required pam_google_authenticator.so` come quella evidenziata nello screen successivo.
Per salvare le modifiche e uscire dall'editor, premere `CTRL+X` poi scrivere `y` e infine premere `Invio` per confermare.

![2FA 19](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/2_2FA/2FA_19.jpg)

Altro file da modificare è `sshd_config`. Per fare ciò basta di nuovo aprirlo con il comando `sudo nano /etc/ssh/sshd_config`. Se chiede la password, inserire quella dell'utente.

![2FA 20](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/2_2FA/2FA_20.jpg)

Se alla voce `KbdInteractiveAuthentication` è presente l’opzione `no`, allora sostituirla con `yes`.
Per salvare anche queste modifiche e uscire dall'editor, premere `CTRL+X` poi scrivere `y` e infine premere `Invio` per confermare.

![2FA 21](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/2_2FA/2FA_21.jpg)

Riavviare il servizio sshd.service per caricare le modifiche con il comando `sudo systemctl restart sshd.service`

![2FA 22](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/2_2FA/2FA_22.jpg)

**[Parte successiva]({% post_url 2022-12-31-ubuntu-server-pihole-unbound-part-3 %})**
