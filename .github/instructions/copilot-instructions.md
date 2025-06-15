🛑 Ne jamais exécuter de commandes nécessitant une interaction utilisateur, sauf si absolument nécessaire.
Par exemple, les commandes comme `git diff`, `less`, `show` ou `more` peuvent bloquer si trop de lignes sont affichées et que l'utilisateur doit appuyer sur Entrée ou `q`.  
Dans les scripts ou outils automatisés, toujours utiliser des options comme `--no-pager` ou rediriger la sortie pour éviter toute interaction bloquante.

✅ Avant toute implémentation, l’agent doit faire un récapitulatif clair des fonctionnalités qu’il compte ajouter ou modifier.  
L’utilisateur devra valider l’ensemble ou une partie des fonctionnalités avant de procéder.
Aucune modification de code ne doit être engagée sans cette validation explicite.

🔐 Avant de faire un `git commit` ou un `git push` automatiquement, l’agent **doit systématiquement demander confirmation à l’utilisateur**.  
Aucune action de commit ou de push ne doit être réalisée sans validation explicite.
Ne push jamais sans ma permission explicite, même après validation locale.

📄 Il est interdit d’ajouter de la documentation ou des commentaires dans le code
Tout commentaire ou documentation superflue sera automatiquement supprimé.