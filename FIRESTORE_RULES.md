# Firestore Security Rules für teil3 + teil4

Gehe zu:
https://console.firebase.google.com/project/meister-tischler-lernapp/firestore/rules

Ersetze den gesamten Inhalt mit:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Teil III (Meister-Atelier)
    match /users-teil3/{uid} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
    match /profile-teil3/{uid} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
    match /progress-teil3/{uid} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
    match /stats-teil3/{uid} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }

    // Teil IV (AEVO Meisterkurs) — falls dort auch namespaced
    match /users-teil4/{uid} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
    match /profile-teil4/{uid} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
    match /progress-teil4/{uid} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
    match /stats-teil4/{uid} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }

    // Teil IV Legacy (ohne Namespace · falls dort doch /users/{uid} genutzt)
    match /users/{uid} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
    match /progress/{uid} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
  }
}
```

Klick "Veröffentlichen" / "Publish".

Nach Publish: Jede Nutzer kann nur SEINE eigenen Daten lesen/schreiben. Andere Nutzer
kommen nicht ran. Das ist die Standard-Private-User-Daten-Konfiguration.
